import {BaseRepository} from "./index";
import UserTransaction, {UserTransactionInterface} from "../../core/user/user_transaction/model/UserTransaction";
import {UserTransactionTypeEnum} from "../../core/user/user_transaction/enums";
import {ObjectId} from 'bson';

export default class UserTransactionRepository extends BaseRepository<UserTransactionInterface> {
    constructor() {
        super(UserTransaction);
    }

    async getSumOfAllCredits(userId: string): Promise<number | void> {
        console.log(userId,)
        return await this.model.aggregate([
            {
                $match: {userId: new ObjectId(userId), type: UserTransactionTypeEnum.CREDIT}
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {$sum: "$amount"}
                }
            }
        ])
            .then(result => {
                return Number.parseFloat(result[0]?.totalAmount || 0)
            })
    }

    async getSumOfAllDebits(userId: string): Promise<number | void> {
        return await this.model.aggregate([
            {
                $match: {userId: new ObjectId(userId), type: UserTransactionTypeEnum.DEBIT}
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {$sum: "$amount"}
                }
            }
        ])
            .then(result => {
                return Number.parseFloat(result[0]?.totalAmount || 0)
            })
    }
}

