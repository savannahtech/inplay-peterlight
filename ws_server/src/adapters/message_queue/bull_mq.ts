import {Queue} from "bullmq";
import {LoggerPort} from "../../core/ports/logger";
import {CachePort} from "../../core/ports/cache";
import {MessageQueuePort} from "../../core/ports/message_queue";

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
        return new Queue(queueName, {connection: this.cache.client});
    }
}
