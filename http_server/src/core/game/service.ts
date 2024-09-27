import Game, {GameParams} from "./index";
import {LoggerPort} from "../../ports/logger";
import GameEvent, {GameEventParams} from "./event";
import {CachePort} from "../../ports/cache";
import GameEventService from "./event/service";
import Bet from "../bet";
import BetService from "../bet/service";
import {GameEventTeamEnum, GameEventTypeEnum} from "./event/enums";
import {BetPickEnum, BetStateEnum, BetTypeEnum} from "../bet/enums";
import {WebsocketPayloadDataType} from "../../ports/ws/data_types";
import WSDispatcher from "../../ports/ws/dispatcher";
import CustomException from "../../ports/helpers/exceptions/custom_exception";
import {HTTPResponseStatusCode} from "../../ports/helpers/definitions/response";
import {DateTimeHelpers} from "../../ports/helpers/commons/date_time";

type GameServiceParams = {
    gameRepository: any;
    messageQueue: any
    appConfig: any
    logger: LoggerPort
    cache: CachePort
    gameEventService: GameEventService,
    betService: BetService,
    wsDispatcher: WSDispatcher
};

export default class GameService {
    private gameRepository?: any;
    private messageQueue?: any;
    private appConfig?: any;
    private logger?: any;
    private cache: CachePort;
    private gameEventService: GameEventService;
    private betService: BetService
    private wsDispatcher: WSDispatcher


    constructor(params: GameServiceParams) {
        this.gameRepository = params.gameRepository;
        this.messageQueue = params.messageQueue;
        this.appConfig = params.appConfig;
        this.logger = params.logger;
        this.cache = params.cache;
        this.gameEventService = params.gameEventService;
        this.betService = params.betService;
        this.wsDispatcher = params.wsDispatcher;
    }

    async createGame(data: GameParams): Promise<Game> {
        const game = new Game(data)
        return await this.gameRepository.create(game);
    }

    async fetchMultipleGames(filterParams?: any, sortParams?: any, expansionParams?: any): Promise<Game[]> {
        return await this.gameRepository.fetchMultiple(filterParams, sortParams, expansionParams);
    }

    async fetchSingleGame(id: string, filterParams?: any, expansionParams?: any): Promise<Game> {
        const oldData = await this.cache.getValue(id)
        if (oldData) {
            return oldData
        }
        return await this.gameRepository.fetchSingle({_id: id, ...filterParams}, false, expansionParams);
    }

    async updateGame(id: string, data: any, filterParams?: any): Promise<Game> {
        const response = await this.gameRepository.update({_id: id, ...filterParams}, data);
        const oldData = await this.cache.getValue(id)
        if (oldData) {
            const newData = {...oldData, ...data}
            await this.cache.setValue(id, newData)
        } else {
            await this.cache.setValue(id, this.fetchSingleGame(id))
        }
        return response
    }

    async deleteGame(id: string, filterParams?: any) {
        return await this.gameRepository.delete({_id: id, ...filterParams});
    }

    async generateNewEvent(id: string): Promise<GameEvent | void> {
        if (this.appConfig.USE_REALISTIC_EVENT_GENERATION_MODE) {
            let cachedGameData: Game = await this.cache.getValue(id)
            if (!cachedGameData) {
                const gameRes = await this.fetchSingleGame(id)
                await this.cache.setValue(id, gameRes)
                cachedGameData = gameRes
            }
            let minute = DateTimeHelpers.computeSecondsBetweenStartEndTime(cachedGameData.startedAt as Date) / 60
            // Goal probability increases toward the end of each half
            const goalProbability = minute > 80 ? 0.1 : minute > 40 ? 0.05 : 0.02;
            // Red card probability increases in the second half
            const redCardProbability = minute > 60 ? 0.01 : 0.003;
            // Substitution probability is higher after halftime
            const substitutionProbability = minute > 45 ? 0.07 : 0.01;
            // Yellow card probability increases after 15 minutes and more after 60 minutes
            const yellowCardProbability = minute > 60 ? 0.05 : minute > 15 ? 0.02 : 0.005;
            const rand = Math.random();
            let eventType;
            let eventTeam = Math.random() < 0.5 ? GameEventTeamEnum.HOME : GameEventTeamEnum.AWAY;
            let eventPlayer;
            if (rand < goalProbability) {
                eventType = GameEventTypeEnum.GOAL;
            } else if (rand < goalProbability + redCardProbability) {
                eventType = GameEventTypeEnum.RED_CARD;
            } else if (rand < goalProbability + redCardProbability + substitutionProbability) {
                eventType = GameEventTypeEnum.SUBSTITUTION;
            } else if (rand < goalProbability + redCardProbability + substitutionProbability + yellowCardProbability) {
                eventType = GameEventTypeEnum.YELLOW_CARD
            }
            // @ts-ignore
            if (eventType) {
                const game: Game = new Game(await this.fetchSingleGame(id))
                const mockEvent: Partial<GameEventParams> = game.generate_new_event({type: eventType, team: eventTeam})
                const event: GameEvent = await this.gameEventService.createGameEvent(mockEvent as GameEventParams)
                if (game.isOngoing) {
                    await this.cache.setValue(event._id as string, event)
                    await this.cache.addKeyToSet(event._id as string, game.cache_set_key_events)
                }
                return event
            }
        } else {
            if (Math.random() < 0.5) {
                const game: Game = new Game(await this.fetchSingleGame(id))
                const mockEvent: Partial<GameEventParams> = game.generate_new_event()
                const event: GameEvent = await this.gameEventService.createGameEvent(mockEvent as GameEventParams)
                if (game.isOngoing) {
                    await this.cache.setValue(event._id as string, event)
                    await this.cache.addKeyToSet(event._id as string, game.cache_set_key_events)
                }
                return event
            }
        }

    }

    async placeBet(id: string, userId: string, betType: BetTypeEnum, betPick: BetPickEnum, amount: number): Promise<Bet> {
        const game: Game = new Game(await this.fetchSingleGame(id));
        if (!game.isOngoing) {
            throw new CustomException({
                status_code: HTTPResponseStatusCode.BAD_REQUEST,
                message: "You can only place bets on live games",
                errors: ["invalid_request"]
            })
        }
        let odds;
        if (betType === BetTypeEnum.WINNER) {
            if (betPick === BetPickEnum.AWAY) {
                // @ts-ignore
                odds = game.oddsAwayWin || game.defaultOddsAwayWin
            } else {
                // @ts-ignore
                odds = game.oddsHomeWin || game.defaultOddsHomeWin
            }
        } else if (betType === BetTypeEnum.SCORE_EXACT) {
            // @ts-ignore
            odds = game.defaultOddsDraw || game.oddsDraw
            betPick = BetPickEnum.DRAW
        }
        return await this.betService.createBet({
            userId,
            gameId: game._id as string,
            betType,
            betPick,
            amount,
            odds,
            state: BetStateEnum.PENDING
        })
    }

    async getEvents(id: string): Promise<GameEvent[]> {
        // @ts-ignore
        const game: Game = new Game(await this.fetchSingleGame(id))
        let events = await this.cache.retrieveSetMembers(game.cache_set_key_events) || [];
        if (events.length) {
            const newEvents = []
            for (let item of events) {
                const cached_item = await this.cache.getValue(item)
                let eventData;
                if (!cached_item) {
                    eventData = await this.gameEventService.fetchSingleGameEvent(item)
                    await this.cache.setValue(item, eventData)
                } else {
                    eventData = cached_item
                }
                newEvents.push(eventData)
            }
            return newEvents;
        } else {
            const filterParams = {
                gameId: game._id
            }
            const response = await this.gameEventService?.fetchMultipleGameEvents(filterParams)
            if (response) {
                for (let item of response) {
                    if (game.isOngoing) {
                        await this.cache.setValue(item._id as string, item)
                        await this.cache.addKeyToSet(item._id as string, game.cache_set_key_events)
                    }
                }
            }
            return response || []
        }
    }

    async getBets(id: string): Promise<Bet[]> {
        // @ts-ignore
        const game: Game = new Game(await this.fetchSingleGame(id))
        let bets = await this.cache.retrieveSetMembers(game.cache_set_key_betting_histories) || [];
        if (bets.length) {
            const newBets = []
            for (let item of bets) {
                const cached_item = await this.cache.getValue(item)
                let betData;
                if (!cached_item) {
                    betData = await this.betService?.fetchSingleBet(item)
                    await this.cache.setValue(item, betData)
                } else {
                    betData = cached_item
                }
                newBets.push(betData)
            }
            return newBets;
        } else {
            const filterParams = {
                gameId: game._id
            }
            const response = await this.betService?.fetchMultipleBets(filterParams)
            if (response) {
                for (let item of response) {
                    if (game.isOngoing) {
                        await this.cache.setValue(item._id as string, item)
                        await this.cache.addKeyToSet(item._id as string, game.cache_set_key_betting_histories)
                    }
                }
            }
            return response || []
        }
    }

    async getLiveOdds(id: string): Promise<Game> {
        // @ts-ignore
        let cachedGameData: Game = await this.cache.getValue(id)
        if (!cachedGameData) {
            const gameRes = await this.fetchSingleGame(id)
            await this.cache.setValue(id, gameRes)
            cachedGameData = gameRes
        }
        const game: Game = new Game(cachedGameData)
        const gameEvents = await this.getEvents(game._id as string);
        const gameBettingHistories = await this.getBets(game._id as string)
        const oddsHomeWin = cachedGameData.defaultOddsHomeWin
        const oddsAwayWin = cachedGameData.defaultOddsAwayWin
        const oddsDraw = cachedGameData.defaultOddsDraw
        const resNewOdds = game.get_updated_live_odds(gameEvents, gameBettingHistories, oddsHomeWin, oddsAwayWin, oddsDraw)
        if (resNewOdds) {
            // @ts-ignore
            cachedGameData.oddsHomeWin = resNewOdds.oddsHomeWin
            // @ts-ignore
            cachedGameData.oddsAwayWin = resNewOdds.oddsAwayWin
            // @ts-ignore
            cachedGameData.oddsDraw = resNewOdds.oddsDraw
            await this.cache.setValue(id, cachedGameData)
        }
        this.wsDispatcher.dispatchData(WebsocketPayloadDataType.GAME, cachedGameData)
        return cachedGameData

    }

    async clearGameCache(id: string): Promise<void> {
        // @ts-ignore
        let cachedGameData: Game = await this.cache.getValue(id)
        if (!cachedGameData) {
            cachedGameData = await this.fetchSingleGame(id)
        }
        const game: Game = new Game(cachedGameData)
        for (let key of (await this.cache.retrieveSetMembers(game.cache_set_key_betting_histories))) {
            await this.cache.deleteKey(key)
        }
        await this.cache.deleteKey(game.cache_set_key_betting_histories)
        for (let key of (await this.cache.retrieveSetMembers(game.cache_set_key_events))) {
            await this.cache.deleteKey(key)
        }
        await this.cache.deleteKey(game.cache_set_key_events)
        await this.cache.deleteKey(id)
    }

    async processUserBetsAfterGameEnds(id: string): Promise<void> {
        // @ts-ignore
        const gameEvents = await this.getEvents(id)
        let homeScore: number = 0
        let awayScore: number = 0
        if (gameEvents) {
            gameEvents.forEach((event) => {
                if (event.type === GameEventTypeEnum.GOAL) {
                    if (event.team === GameEventTeamEnum.HOME) {
                        homeScore++
                    } else if (event.team === GameEventTeamEnum.AWAY) {
                        awayScore++
                    }
                }
            });
        }
        // @ts-ignore
        const userBets = await this.getBets(id)
        if (userBets) {
            let groupedBetsByUser = {}
            for (let bet of userBets) {
                const userId = bet.userId
                // @ts-ignore
                groupedBetsByUser[userId] = groupedBetsByUser[userId] ? groupedBetsByUser[userId] : []
                // @ts-ignore
                groupedBetsByUser[userId].push(bet)
            }
            for (let userId in groupedBetsByUser) {
                // @ts-ignore
                let userBets: Bet[] = groupedBetsByUser[userId]
                for (let bet of userBets) {
                    if (bet.betType === BetTypeEnum.WINNER) {
                        if (homeScore > awayScore && bet.betPick === BetPickEnum.HOME) {
                            await this.betService.winBet(bet._id as string)
                            continue
                        } else if (awayScore > homeScore && bet.betPick === BetPickEnum.AWAY) {
                            await this.betService.winBet(bet._id as string)
                            continue
                        }
                    } else if (bet.betType === BetTypeEnum.SCORE_EXACT && bet.betPick === BetPickEnum.DRAW) {
                        if (homeScore === awayScore) {
                            await this.betService.winBet(bet._id as string)
                            continue
                        }
                    }
                    await this.betService.loseBet(bet._id as string)
                }
            }
        }
    }

}