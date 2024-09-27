import Redis from 'ioredis';


export interface CachePort {
    client: Redis

    connectAndInitializeClient(): Promise<void>
}
