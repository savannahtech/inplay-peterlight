import {MessageQueuePort} from "../../ports/message_queue";
import {LoggerPort} from "../../ports/logger";
import {CachePort} from "../../ports/cache";
import {Queue} from "bullmq";

type BullMQAdapterParams = {
    appConfig: any,
    logger: LoggerPort,
    cache: CachePort
}

export class BullMQAdapter implements MessageQueuePort {
    private appConfig;
    private logger;
    private cache: CachePort;


    constructor(params: BullMQAdapterParams) {
        this.appConfig = params.appConfig;
        this.logger = params.logger;
        this.cache = params.cache;
    }

    getQueue(queueName: string): Queue {
        // @ts-ignore
        return new Queue(queueName, {connection: this.cache.client});
    }

    async addJobToQueue(queue: Queue, jobName: string, data: any, delay?: number, jobId?: string): Promise<void> {
        const job = await queue.add(jobName, data, {
            delay: (delay || 0) * 1000,
            jobId: jobId,
            removeOnComplete: true
        })
        this.logger.info(`Message Queue:  Job added with ID: ${job.id} : Name: ${job.name} : Queue ${queue.name} : Delay ${delay}secs`);
    }
}
