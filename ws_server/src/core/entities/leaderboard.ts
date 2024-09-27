import {ObjectsHelpers} from "./helpers";

export type LeaderboardItemParams = {
    userId?: string;
    userName?: string;
    totalWins?: number;
    totalLosses?: number;
    totalProfits?: number;
};

export default class LeaderboardItem {
    userId?: string;
    userName?: string;
    totalWins?: number;
    totalLosses?: number;
    totalProfits?: number;

    constructor(params: LeaderboardItemParams) {
        this.userId = params.userId
        this.userName = params.userName
        this.totalWins = params.totalWins
        this.totalLosses = params.totalLosses
        this.totalProfits = params.totalProfits
    }

    get data(): Partial<LeaderboardItemParams> {
        return ObjectsHelpers.extractAttributesToData(this)
    }
}
