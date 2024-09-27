import {BaseRepository} from "./index";
import Bet, {BetInterface} from "../../core/bet/model/Bet";

export default class BetRepository extends BaseRepository<BetInterface> {
    constructor() {
        super(Bet);
    }
}

