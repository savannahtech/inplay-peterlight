import {ObjectsHelpers} from "./helpers";

export type GameParams = {
    _id?: string;
    homeTeam: string;
    awayTeam: string;
    defaultOddsHomeWin: number;
    defaultOddsAwayWin: number;
    defaultOddsDraw: number;
    isOngoing: boolean;
    startedAt?: Date;
};


export default class Game {
    public _id;
    public homeTeam;
    public awayTeam;
    public isOngoing;
    public startedAt;
    public defaultOddsHomeWin;
    public defaultOddsAwayWin;
    public defaultOddsDraw;

    constructor(params: GameParams) {
        this._id = params._id
        this.homeTeam = params.homeTeam
        this.awayTeam = params.awayTeam
        this.isOngoing = params.isOngoing
        this.startedAt = params.startedAt
        this.defaultOddsHomeWin = params.defaultOddsHomeWin
        this.defaultOddsAwayWin = params.defaultOddsAwayWin
        this.defaultOddsDraw = params.defaultOddsDraw
    }

    get data(): Partial<GameParams> {
        return ObjectsHelpers.extractAttributesToData(this)
    }
}
