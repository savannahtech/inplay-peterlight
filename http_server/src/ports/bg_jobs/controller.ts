import GameService from "../../core/game/service";
import {CachePort} from "../cache";
import BGJobCaller from "./caller";
import UserService from "../../core/user/service";

export type BGJobControllerParams = {
    gameService: GameService,
    cache: CachePort,
    BGJobCaller: BGJobCaller,
    userService: UserService
};


export default class BGJobController {
    private gameService: GameService;
    private cache: CachePort
    private BGJobCaller: BGJobCaller
    private userService: UserService


    constructor(params: BGJobControllerParams) {
        this.gameService = params.gameService;
        this.cache = params.cache;
        this.BGJobCaller = params.BGJobCaller;
        this.userService = params.userService;
    }

    async endGameState({gameId}: { gameId: string }) {
        await this.gameService.updateGame(gameId, {
            isOngoing: false
        })
        await this.gameService.clearGameCache(gameId)
        await this.gameService.processUserBetsAfterGameEnds(gameId)

    }

    async updateLiveGame({gameId}: { gameId: string }) {
        if ((await this.cache.getValue(gameId))?.isOngoing) {
            await this.gameService.generateNewEvent(gameId)
            await this.gameService.getLiveOdds(gameId)
            await this.BGJobCaller.updateLiveGame(gameId)
        }
    }


    async updateUserAccountBalance({userId}: { userId: string }) {
        await this.userService.updateUserAccountBalance(userId)
    }
}