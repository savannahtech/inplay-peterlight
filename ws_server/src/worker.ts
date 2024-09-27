import {Worker} from "bullmq";
import {LoggerPort} from "./core/ports/logger";
import {WebsocketPayloadDataType} from "./core/usecases/data_types";
import {NotifyEvents} from "./core/usecases/notify_events";
import {BGWorkerEventsHandler} from "./core/ports/bg_jobs/worker";
import {CachePort} from "./core/ports/cache";


export const startWorker = (redisClient: CachePort, appConfig: any, logger: LoggerPort, notifyEvent: NotifyEvents) => {
    // Worker for receiving event from HTTP server over a message queue
    BGWorkerEventsHandler(new Worker(appConfig.MESSAGE_QUEUE_NAME_WEBSOCKET_SERVICE, async job => {
        logger.info(`Processing job ${job.id}: ${job.name} -> ${JSON.stringify(job.data)}`);
        const {type, data} = job.data;
        if (type === WebsocketPayloadDataType.LEADERBOARD) {
            notifyEvent.notifyLeaderBoardItem(data)
        } else if (type === WebsocketPayloadDataType.GAME) {
            notifyEvent.notifyGameItem(data)
        } else if (type === WebsocketPayloadDataType.GAME_EVENT) {
            notifyEvent.notifyGameEventItem(data)
        }
    }, {connection: redisClient.client}));
}
