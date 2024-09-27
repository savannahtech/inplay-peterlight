import Redis from 'ioredis';
import {LoggerPort} from "../../core/ports/logger";
import {CachePort} from "../../core/ports/cache";

type RedisAdapterParams = {
    appConfig: any
    logger: LoggerPort
}

export class RedisAdapter implements CachePort {
    private appConfig;
    private logger;
    client: Redis | any;


    constructor(params: RedisAdapterParams) {
        this.appConfig = params.appConfig;
        this.logger = params.logger;
        this.client = null;
    }

    async connectAndInitializeClient(): Promise<void> {
        this.client = new Redis(this.appConfig.REDIS_URL, {maxRetriesPerRequest: null});

        // Handle connection errors
        this.client.on('error', (err: Error) => this.logger.error(err));

        // Wait for the connection to be established
        await this.client.ping(); // Optionally ping the server to check if it's ready
        this.logger.info(`Redis: Successfully connected to redis database`)

    }
}
