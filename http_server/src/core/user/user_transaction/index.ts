import {UserTransactionTypeEnum} from "./enums";
import {ObjectsHelpers} from "../../../ports/helpers/commons/objects";

export type UserTransactionParams = {
    _id?: string;
    userId: string;
    amount: number;
    type: UserTransactionTypeEnum;
    createdAt: Date;
};

export default class UserTransaction {
    public _id;
    public userId;
    public amount;
    public type;
    public createdAt?;

    constructor(params: UserTransactionParams) {
        this._id = params._id
        this.userId = params.userId
        this.amount = params.amount
        this.type = params.type
        this.createdAt = params.createdAt
    }

    get id() {
        return this._id
    }

    get data(): Partial<UserTransactionParams> {
        return ObjectsHelpers.extractAttributesToData(this)
    }
}
