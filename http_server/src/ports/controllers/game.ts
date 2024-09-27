import {NextFunction, Request, Response} from "express";
import {HTTPResponseStatusCode} from "../helpers/definitions/response";
import GameService from "../../core/game/service";
import ExceptionsHelper from "../helpers/exceptions";
import Game from "../../core/game";
import {CachePort} from "../cache";

export type GameControllerParams = {
    gameService: any;
    appConfig: any;
    BGJobCaller: any;
    cache: CachePort;
};

export default class GameController {
    private gameService: GameService;
    private appConfig: any
    private BGJobCaller: any
    private cache: CachePort;


    constructor(params: GameControllerParams) {
        this.gameService = params.gameService;
        this.appConfig = params.appConfig;
        this.BGJobCaller = params.BGJobCaller;
        this.cache = params.cache;
    }


    private filterParams(req: Request) {
        // @ts-ignore
        const specifiedFilters = req._filter || {}
        // @ts-ignore
        const specifiedSearch = req._search || {}
        return {...specifiedFilters, ...specifiedSearch}
    }

    private orderingParams(req: Request) {
        // @ts-ignore
        return req._ordering
    }

    private expansionParams(req: Request) {
        // @ts-ignore
        return req._expansion
    }

    async fetchGame(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const game = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.gameService.fetchSingleGame(req.params.id, this.filterParams(req), this.expansionParams(req))),
            on_error: next
        });
        // @ts-ignore
        return game.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(game.data);
    }

    async fetchGameEvents(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const res_ = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.gameService.getEvents(req.params.id)),
            on_error: next
        });
        // @ts-ignore
        return res_.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(res_.data);
    }

    async fetchGameBets(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const res_ = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.gameService.getBets(req.params.id)),
            on_error: next
        });
        // @ts-ignore
        return res_.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(res_.data);
    }

    async fetchGameMultiple(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const game = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.gameService.fetchMultipleGames(this.filterParams(req), this.orderingParams(req), this.expansionParams(req))),
            on_error: next
        });
        // @ts-ignore
        return game.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(game.data);
    }


    async fetchActiveGames(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const filterParams = {
            isOngoing: true
        }
        const games = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.gameService.fetchMultipleGames(filterParams, this.orderingParams(req), this.expansionParams(req))),
            on_error: next
        });
        // @ts-ignore
        const activeGames = games.data || []
        let count_left = this.appConfig.ACTIVE_GAMES_COUNT - activeGames.length
        activeGames.forEach(async (item: Game) => {
            await this.BGJobCaller.endGameState(item._id)
            await this.BGJobCaller.updateLiveGame(item._id)
        })
        while (count_left > 0) {
            // @ts-ignore
            const gameInstance = await this.gameService.createGame(Game.mock({isOngoing: true}))
            // @ts-ignore
            await this.cache.setValue(gameInstance._id, gameInstance)
            await this.BGJobCaller.endGameState(gameInstance._id)
            await this.BGJobCaller.updateLiveGame(gameInstance._id)
            activeGames.push(gameInstance)
            count_left--
        }
        return res.status(HTTPResponseStatusCode.SUCCESS).json(activeGames);
    }

    async placeBetOnGame(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const userId = req?.user?._id
        const {amount, betType, betPick} = req.body;
        const bet = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.gameService.placeBet(req.params.id, userId, betType, betPick, amount)),
            on_error: next
        });
        // @ts-ignore
        return bet.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(bet.data);
    }


}
