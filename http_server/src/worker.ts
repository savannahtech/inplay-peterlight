import container from "./infrastructure/container";
import {BGWorkerEventsHandler} from "./ports/bg_jobs/worker";
import {Worker} from "bullmq";
import {BGJobType} from "./ports/bg_jobs/job_types";
import {CachePort} from "./ports/cache";
import {LoggerPort} from "./ports/logger";
import {startApp} from "./app";


startApp().then(() => {
    const redisClient: CachePort = container.resolve<CachePort>('cache');
    const BGJobController = container.resolve('BGJobController');
    const logger = container.resolve<LoggerPort>('logger')


// Worker for processing game end after 90 mins
    BGWorkerEventsHandler(new Worker(BGJobType.END_GAME_STATE, async job => {
        logger.info(`Processing job ${job.id}: ${job.name} -> ${JSON.stringify(job.data)}`);
        await BGJobController.endGameState(job.data)
    }, {connection: redisClient.client}));


    // Worker for processing game live odds and events
    BGWorkerEventsHandler(new Worker(BGJobType.UPDATE_LIVE_GAME, async job => {
        logger.info(`Processing job ${job.id}: ${job.name} -> ${JSON.stringify(job.data)}`);
        await BGJobController.updateLiveGame(job.data)
    }, {connection: redisClient.client}));


    // Worker for updating user account balance
    BGWorkerEventsHandler(new Worker(BGJobType.UPDATE_USER_ACCOUNT_BALANCE, async job => {
        logger.info(`Processing job ${job.id}: ${job.name} -> ${JSON.stringify(job.data)}`);
        await BGJobController.updateUserAccountBalance(job.data)
    }, {connection: redisClient.client}));
})
