import Bet, {BetParams} from "./index";
import {LoggerPort} from "../../ports/logger";
import {UserTransactionParams} from "../user/user_transaction";
import {UserTransactionTypeEnum} from "../user/user_transaction/enums";
import {BetStateEnum} from "./enums";
import container from "../../infrastructure/container";
import User, {UserParams} from "../user";
import {CachePort} from "../../ports/cache";

type BetServiceParams = {
    betRepository: any;
    messageQueue: any
    appConfig: any
    logger: LoggerPort;
    cache: CachePort;
};

export default class BetService {
    private betRepository?: any;
    private messageQueue?: any;
    private appConfig?: any;
    private logger?: any;
    private cache: CachePort;


    constructor(params: BetServiceParams) {
        this.betRepository = params.betRepository;
        this.messageQueue = params.messageQueue;
        this.appConfig = params.appConfig;
        this.logger = params.logger;
        this.cache = params.cache;
    }

    async refreshBetOnUserCache(userId: string, betId: string) {
        const userService = container.resolve("userService")
        const user = new User({_id: userId} as UserParams);
        let bets: Bet[] = await this.cache.retrieveSetMembers(user.cache_set_key_bets);
        if (!bets) {
            await this.cache.setValue(user.cache_set_key_bets, await this.fetchMultipleBets({
                userId
            }))
        } else {
            await this.cache.deleteSetKey(betId, user.cache_set_key_bets)
            await this.cache.addKeyToSet(betId, user.cache_set_key_bets)
        }
        await userService.updateUserLeaderBoardStats(userId)
    }

    async createBet(data: BetParams): Promise<Bet> {
        const userTransactionService = container.resolve("userTransactionService")
        const bet = new Bet(data)
        return await this.betRepository.create(bet).then(async (bet: Bet) => {
            if (bet.state === BetStateEnum.PENDING) {
                const payload: UserTransactionParams = {
                    userId: bet.userId,
                    type: UserTransactionTypeEnum.DEBIT,
                    amount: bet.amount
                } as UserTransactionParams
                await userTransactionService.createUserTransaction(payload)
                await this.refreshBetOnUserCache(bet.userId as string, bet._id as string)
            }
            return bet;
        });
    }

    async fetchMultipleBets(filterParams?: any, sortParams?: any, expansionParams?: any): Promise<Bet[]> {
        return await this.betRepository.fetchMultiple(filterParams, sortParams, expansionParams);
    }

    async fetchSingleBet(id: string, filterParams?: any, expansionParams?: any): Promise<Bet> {
        return await this.betRepository.fetchSingle({_id: id, ...filterParams}, false, expansionParams);
    }

    async updateBet(id: string, data: any, filterParams?: any): Promise<Bet> {
        return await this.betRepository.update({_id: id, ...filterParams}, data);
    }

    async deleteBet(id: string, filterParams?: any) {
        const bet: Bet = await this.fetchSingleBet(id);
        await this.refreshBetOnUserCache(bet.userId as string, bet._id as string)
        return await this.betRepository.delete({_id: id, ...filterParams});
    }

    async winBet(id: string): Promise<void> {
        const userTransactionService = container.resolve("userTransactionService")
        const bet: Bet = await this.fetchSingleBet(id)
        if (bet.state === BetStateEnum.PENDING) {
            const payload: UserTransactionParams = {
                userId: bet.userId,
                type: UserTransactionTypeEnum.CREDIT,
                // @ts-ignore
                amount: Number.parseFloat(bet.amount) * bet.odds
            } as UserTransactionParams
            await userTransactionService.createUserTransaction(payload)
            await this.updateBet(id, {
                state: BetStateEnum.WIN
            })
            await this.refreshBetOnUserCache(bet.userId as string, bet._id as string)
        }
    }

    async loseBet(id: string): Promise<void> {
        const bet: Bet = await this.fetchSingleBet(id)
        if (bet.state === BetStateEnum.PENDING) {
            await this.updateBet(id, {
                state: BetStateEnum.LOSS
            })
            await this.refreshBetOnUserCache(bet.userId as string, bet._id as string)
        }
    }
}