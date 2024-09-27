import {GameEventTeamEnum, GameEventTypeEnum} from "./enums";
import {faker} from '@faker-js/faker';


export type GameEventParams = {
    _id?: string;
    type: GameEventTypeEnum;
    team: GameEventTeamEnum;
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

    static mock(data ?: Partial<GameEventParams>): Partial<GameEventParams> {
        return {
            type: faker.helpers.arrayElement(Object.values(GameEventTypeEnum)),
            team: faker.helpers.arrayElement(Object.values(GameEventTeamEnum)),
            player: faker.person.firstName(),
            ...(data || {})
        }
    }

    get id() {
        return this._id
    }
}
