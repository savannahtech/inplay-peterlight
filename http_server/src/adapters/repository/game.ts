import {BaseRepository} from "./index";
import Game, {GameInterface} from "../../core/game/model/Game";

export default class GameRepository extends BaseRepository<GameInterface> {
    constructor() {
        super(Game);
    }
}

