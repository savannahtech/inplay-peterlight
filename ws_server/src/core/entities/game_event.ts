import {ObjectsHelpers} from "./helpers";


export type GameEventParams = {
    _id?: string;
    type: string;
    team: string;
    gameId: string;
    player: string;
    minute: number;
};

export default class GameEvent {
    public _id;
    public type;
    public gameId;
    public team;
    public player;
    public minute;

    constructor(params: GameEventParams) {
        this._id = params._id
        this.type = params.type
        this.gameId = params.gameId
        this.team = params.team
        this.player = params.player
        this.minute = params.minute
    }

    get data(): Partial<GameEventParams> {
        return ObjectsHelpers.extractAttributesToData(this)
    }
}
