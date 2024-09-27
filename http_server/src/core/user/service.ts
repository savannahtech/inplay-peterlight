import CustomException from "../../ports/helpers/exceptions/custom_exception";
import {HTTPResponseStatusCode} from "../../ports/helpers/definitions/response";
import User, {UserParams} from "./index";
import AppConfig from "../../config";
import ExceptionsHelper from "../../ports/helpers/exceptions";
import {DateTimeHelpers} from "../../ports/helpers/commons/date_time";
import {CachePort} from "../../ports/cache";
import UserTransactionService from "./user_transaction/service";
import {UserTransactionParams} from "./user_transaction";
import {UserTransactionTypeEnum} from "./user_transaction/enums";
import Bet from "../bet";
import {BetStateEnum} from "../bet/enums";
import container from "../../infrastructure/container";
import {LeaderboardItemParams} from "../leaderboard";
import WSDispatcher from "../../ports/ws/dispatcher";
import {WebsocketPayloadDataType} from "../../ports/ws/data_types";

type UserServiceParams = {
    userRepository: any;
    authService: any
    cache: CachePort;
    userTransactionService: UserTransactionService;
    wsDispatcher: WSDispatcher
};

type UserServiceParamsRegisterUser = {
    email: string,
    username: string,
    password: string
}

type UserServiceParamsAuthenticateUser = {
    email: string,
    password: string
}


type UserServiceParamsRefreshUserToken = {
    refreshToken: string
}

type UserServiceParamsFetchProfileByAccessToken = {
    accessToken: string
}


export default class UserService {
    private userRepository?: any;
    private authService?: any;
    private cache: CachePort;
    private userTransactionService: UserTransactionService;
    private wsDispatcher: WSDispatcher;


    constructor(params: UserServiceParams) {
        this.userRepository = params.userRepository;
        this.authService = params.authService;
        this.cache = params.cache
        this.userTransactionService = params.userTransactionService;
        this.wsDispatcher = params.wsDispatcher;

    }

    async registerUser(data: UserServiceParamsRegisterUser) {
        const {email, username, password} = data;
        CustomException.assert(
            !(await this.userRepository.findByEmail(email)),
            {
                status_code: HTTPResponseStatusCode.BAD_REQUEST,
                message: "Account with email already exists. Double check or sign in.",
                errors: ["account_exist_error"]
            }
        )
        CustomException.assert(
            !(await this.userRepository.findByUserName(username)),
            {
                status_code: HTTPResponseStatusCode.BAD_REQUEST,
                message: "Account with username already exists. Double check or sign in.",
                errors: ["account_exist_error"]
            }
        )
        const hashedPassword = await this.authService.hashPassword(password);
        const user = new User({email, username, password: hashedPassword})
        return await this.userRepository.create(user);

    }

    async authenticateUser(data: UserServiceParamsAuthenticateUser) {
        const {email, password} = data;
        const user = await this.userRepository.findByEmail(email);
        if (!user || !(await this.authService.comparePassword(password, user.password))) {
            throw new CustomException({
                status_code: HTTPResponseStatusCode.BAD_REQUEST,
                message: "Invalid credentials",
                errors: ["invalid_credentials"]
            });
        }
        return {
            access: this.authService.generateToken(user, "ACCESS", `${AppConfig.ACCESS_TOKEN_EXPIRY_SECS}s`),
            refresh: this.authService.generateToken(user, "REFRESH", `${AppConfig.REFRESH_TOKEN_EXPIRY_SECS}s`)
        };
    }

    async refreshUserToken(data: UserServiceParamsRefreshUserToken) {
        const {refreshToken} = data;
        let decoded = ExceptionsHelper.executeCallbackSync({
            callback: () => this.authService.decodeToken(refreshToken)
        })
        if (decoded.is_success) {
            decoded = decoded.data
            if (decoded?.type === "REFRESH" && DateTimeHelpers.currentTimeInSecs() < decoded?.exp) {
                const user = await this.userRepository.findByEmail(decoded.email)
                if (user) {
                    return {
                        access: this.authService.generateToken(user, "ACCESS", `${AppConfig.ACCESS_TOKEN_EXPIRY_SECS}s`)
                    };
                }
            }
        }
        throw new CustomException({
            status_code: HTTPResponseStatusCode.BAD_REQUEST,
            message: "Invalid token",
            errors: ["invalid_token"]
        });
    }

    async fetchUserProfileByAccessToken(data: UserServiceParamsFetchProfileByAccessToken) {
        const {accessToken} = data;
        let decoded = ExceptionsHelper.executeCallbackSync({
            callback: () => this.authService.decodeToken(accessToken)
        })
        if (decoded.is_success) {
            decoded = decoded.data
            if (decoded?.type === "ACCESS" && DateTimeHelpers.currentTimeInSecs() < decoded?.exp) {
                const user = await this.userRepository.findByEmail(decoded.email)
                if (user) {
                    return (new User(user as UserParams)).dataMini
                }
            }
        }
        throw new CustomException({
            status_code: HTTPResponseStatusCode.BAD_REQUEST,
            message: "Invalid token",
            errors: ["invalid_token"]
        });
    }

    async fetchMultipleUsers() {
        return await this.userRepository.fetchMultiple();
    }

    async updateUserAccountBalance(id: string) {
        const user = new User({_id: id} as UserParams);
        const allCredits = await this.userTransactionService.getSumOfAllCredits(id) || 0
        const allDebits = await this.userTransactionService.getSumOfAllDebits(id) || 0
        console.log(allCredits, allDebits)
        // @ts-ignore
        const accountBalance = allCredits - allDebits
        await this.cache.setValue(user.cache_account_balance_last_updated, accountBalance)
        return accountBalance

    }

    async fetchSingleUser(id: string) {
        const res = await this.userRepository.fetchSingle({_id: id}, false)
        return {...res, account_balance: await this.fetchUserAccountBalance(id)}
    }

    async fetchUserAccountBalance(id: string) {
        const user = new User({_id: id} as UserParams);
        let cachedBal = await this.cache.getValue(user.cache_account_balance_last_updated)
        if (!cachedBal && cachedBal !== 0) {
            return this.updateUserAccountBalance(id)
        }
        return cachedBal
    }

    async fundUserAccount(id: string, amount: number) {
        const user = new User({_id: id} as UserParams);
        const payload: UserTransactionParams = {
            userId: id,
            type: UserTransactionTypeEnum.CREDIT,
            amount: amount
        } as UserTransactionParams
        await this.userTransactionService.createUserTransaction(payload)
    }

    async getBets(id: string): Promise<Bet[]> {
        const betService = await container.resolve("betService")
        // @ts-ignore
        const user = new User({_id: id} as UserParams);
        let bets: string[] = await this.cache.retrieveSetMembers(user.cache_set_key_bets);
        if (bets) {
            const newBets = []
            for (let item of bets) {
                const cached_item = await this.cache.getValue(item)
                let betData;
                if (!cached_item) {
                    betData = await betService?.fetchSingleBet(item)
                    await this.cache.setValue(item, betData)
                } else {
                    betData = cached_item
                }
                newBets.push(betData)
            }
            return newBets;
        } else {
            const filterParams = {
                userId: id
            }
            const response = await betService?.fetchMultipleBets(filterParams)
            if (response) {
                for (let item of response) {
                    await this.cache.setValue(item._id as string, item)
                    await this.cache.addKeyToSet(item._id as string, user.cache_set_key_bets)
                }
            }
            return response || []
        }
    }

    async updateUserLeaderBoardStats(id: string) {
        let user: User = new User(await this.fetchSingleUser(id))
        const bets: Bet[] = await this.getBets(id)
        const leaderboardStats: LeaderboardItemParams = {
            userId: user._id as string,
            userName: user.username as string,
            totalWins: 0,
            totalLosses: 0,
            totalProfits: 0,
        }
        if (bets) {
            for (let bet of bets) {
                if (bet.state === BetStateEnum.WIN) {
                    // @ts-ignore
                    const profit = (Number.parseFloat(bet.amount) * bet.odds) - Number.parseFloat(bet.amount)
                    leaderboardStats.totalWins++
                    leaderboardStats.totalProfits += profit
                } else if (bet.state === BetStateEnum.LOSS) {
                    leaderboardStats.totalLosses++
                }
            }
        }
        await this.cache.setValue(user.cache_key_leaderboard_stat, leaderboardStats)
        await this.cache.addKeyToSet(user.cache_key_leaderboard_stat, User.cache_key_leaderboard_stat_all)
        this.wsDispatcher.dispatchData(WebsocketPayloadDataType.LEADERBOARD, leaderboardStats)
    }

    async fetchLeaderBoard() {
        const cachedLeaderBoards: string[] = (await this.cache.retrieveSetMembers(User.cache_key_leaderboard_stat_all)) || []
        const leaderBoards: LeaderboardItemParams[] = []
        for (let item of cachedLeaderBoards) {
            const val = await this.cache.getValue(item);
            if (val) {
                leaderBoards.push(val)
            }
        }
        return leaderBoards
    }
}