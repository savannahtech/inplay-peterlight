import GameEvent, {GameEventParams} from "./index";
import {LoggerPort} from "../../../ports/logger";
import {WebsocketPayloadDataType} from "../../../ports/ws/data_types";
import WSDispatcher from "../../../ports/ws/dispatcher";

type GameEventServiceParams = {
    gameEventRepository: any;
    messageQueue: any
    appConfig: any
    logger: LoggerPort
    wsDispatcher: WSDispatcher
};

export default class GameEventService {
    private gameEventRepository?: any;
    private messageQueue?: any;
    private appConfig?: any;
    private logger?: any;
    private wsDispatcher: WSDispatcher;


    constructor(params: GameEventServiceParams) {
        this.gameEventRepository = params.gameEventRepository;
        this.messageQueue = params.messageQueue;
        this.appConfig = params.appConfig;
        this.logger = params.logger;
        this.wsDispatcher = params.wsDispatcher;
    }

    async createGameEvent(data: GameEventParams): Promise<GameEvent> {
        const gameEvent = new GameEvent(data)
        return await this.gameEventRepository.create(gameEvent).then((res: any) => {
            this.wsDispatcher.dispatchData(WebsocketPayloadDataType.GAME_EVENT, gameEvent)
            return res
        });

    }

    async fetchMultipleGameEvents(filterParams?: any, sortParams?: any, expansionParams?: any): Promise<GameEvent[]> {
        return await this.gameEventRepository.fetchMultiple(filterParams, sortParams, expansionParams);
    }

    async fetchSingleGameEvent(id: string, filterParams?: any, expansionParams?: any): Promise<GameEvent> {
        return await this.gameEventRepository.fetchSingle({_id: id, ...filterParams}, false, expansionParams);
    }

    async updateGameEvent(id: string, data: any, filterParams?: any): Promise<GameEvent> {
        return await this.gameEventRepository.update({_id: id, ...filterParams}, data);
    }

    async deleteGameEvent(id: string, filterParams?: any) {
        return await this.gameEventRepository.delete({_id: id, ...filterParams});
    }
}