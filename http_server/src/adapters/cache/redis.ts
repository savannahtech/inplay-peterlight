import {LoggerPort} from "../../ports/logger";
import Redis from 'ioredis';
import {CachePort} from "../../ports/cache";

type RedisAdapterParams = {
    appConfig: any
    logger: LoggerPort
}

export class RedisAdapter implements CachePort {
    private appConfig;
    private logger;
    public client: Redis | any;


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

    // Set a key-value pair
    async setValue(key: string, value: any): Promise<void> {
        // @ts-ignore
        await this.client.set(key, JSON.stringify(value));
        this.logger.info(`Redis: Set ${key} = ${value}`);
    }

    async addKeyToSet(key: string, setKey: string): Promise<void> {
        // @ts-ignore
        await this.client.sadd(setKey, key);
        this.logger.info(`Redis: Added ${key} to ${setKey}`);
    }

    async retrieveSetMembers(setKey: string): Promise<any[]> {
        // @ts-ignore
        return await this.client.smembers(setKey);
    }

    // Get the value of a key
    async getValue(key: string): Promise<any> {
        // @ts-ignore
        const value = await this.client.get(key);
        if (value) {
            this.logger.info(`Redis: Retrieved ${key} = ${value}`);
            return JSON.parse(value);
        } else {
            this.logger.info(`Redis: Key ${key} does not exist`);
        }
    }

    // Delete a key
    async deleteKey(key: string): Promise<void> {
        // @ts-ignore
        const result = await this.client.del(key);
        if (result) {
            this.logger.info(`Redis: Deleted key: ${key}`);
        } else {
            this.logger.info(`Redis: Key ${key} does not exist or was already deleted`);
        }
    }

    async deleteSetKey(key: string, setKey: string): Promise<void> {
        // @ts-ignore
        const result = await this.client.srem(setKey, key);
        if (result > 0) {
            console.log(`Redis: Deleted ${key} from ${setKey}`);
        } else {
            console.log(`Redis: ${key} does not exist in ${setKey}`);
        }
    }


}
