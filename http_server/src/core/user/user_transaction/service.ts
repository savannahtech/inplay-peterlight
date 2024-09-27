import UserTransaction, {UserTransactionParams} from "./index";
import {LoggerPort} from "../../../ports/logger";
import BGJobCaller from "../../../ports/bg_jobs/caller";

type UserTransactionServiceParams = {
    userTransactionRepository: any;
    messageQueue: any
    appConfig: any
    logger: LoggerPort,
    BGJobCaller: BGJobCaller
};

export default class UserTransactionService {
    private userTransactionRepository?: any;
    private messageQueue?: any;
    private appConfig?: any;
    private logger?: any;
    private BGJobCaller: BGJobCaller


    constructor(params: UserTransactionServiceParams) {
        this.userTransactionRepository = params.userTransactionRepository;
        this.messageQueue = params.messageQueue;
        this.appConfig = params.appConfig;
        this.logger = params.logger;
        this.BGJobCaller = params.BGJobCaller;
    }

    async createUserTransaction(data: UserTransactionParams): Promise<UserTransaction> {
        const userTransaction = new UserTransaction(data)
        return await this.userTransactionRepository.create(userTransaction).then((res: any) => {
            // @ts-ignore
            this.BGJobCaller.updateUserAccountBalance(res.userId, userTransaction._id)
            return res
        });

    }

    async fetchMultipleUserTransactions(filterParams?: any, sortParams?: any, expansionParams?: any): Promise<UserTransaction[]> {
        return await this.userTransactionRepository.fetchMultiple(filterParams, sortParams, expansionParams);
    }

    async fetchSingleUserTransaction(id: string, filterParams?: any, expansionParams?: any): Promise<UserTransaction> {
        return await this.userTransactionRepository.fetchSingle({_id: id, ...filterParams}, false, expansionParams);
    }

    async updateUserTransaction(id: string, data: any, filterParams?: any): Promise<UserTransaction> {
        return await this.userTransactionRepository.update({_id: id, ...filterParams}, data).then((res: any) => {
            // @ts-ignore
            this.BGJobCaller.updateUserAccountBalance(res.userId, id)
            return res
        });
    }

    async deleteUserTransaction(id: string, filterParams?: any) {
        const obj = await this.fetchSingleUserTransaction(id)
        return await this.userTransactionRepository.delete({_id: id, ...filterParams}).then((res: any) => {
            // @ts-ignore
            this.BGJobCaller.updateUserAccountBalance(obj.userId, id)
            return res
        });
    }

    async getSumOfAllCredits(userID: string): Promise<number | void> {
        return await this.userTransactionRepository.getSumOfAllCredits(userID);
    }


    async getSumOfAllDebits(userID: string): Promise<number | void> {
        return await this.userTransactionRepository.getSumOfAllDebits(userID);
    }
}