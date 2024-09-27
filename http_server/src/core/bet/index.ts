import {BetPickEnum, BetStateEnum, BetTypeEnum} from "./enums";
import {ObjectsHelpers} from "../../ports/helpers/commons/objects";

export type BetParams = {
    _id?: string;
    userId: string;
    gameId: string;
    betType: BetTypeEnum;
    betPick: BetPickEnum;
    state: BetStateEnum;
    amount: number;
    odds: number

};

export default class Bet {
    public _id;
    public userId;
    public gameId;
    public betType;
    public betPick;
    public amount;
    public odds;
    public state;

    constructor(params: BetParams) {
        this._id = params._id
        this.userId = params.userId
        this.gameId = params.gameId
        this.betType = params.betType
        this.betPick = params.betPick
        this.amount = params.amount
        this.odds = params.odds
        this.state = params.state;


    }

    get id() {
        return this._id
    }

    get data(): Partial<BetParams> {
        return ObjectsHelpers.extractAttributesToData(this)
    }
}
