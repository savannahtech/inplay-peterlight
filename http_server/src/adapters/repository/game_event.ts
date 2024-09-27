import {BaseRepository} from "./index";
import GameEvent, {GameEventInterface} from "../../core/game/event/model/GameEvent";

export default class GameEventRepository extends BaseRepository<GameEventInterface> {
    constructor() {
        super(GameEvent);
    }
}

