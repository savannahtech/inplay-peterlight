import Redis from 'ioredis';


export interface CachePort {
    client: Redis

    connectAndInitializeClient(): Promise<void>

    setValue(key: string, value: any): Promise<void>;

    addKeyToSet(key: string, setKey: string): Promise<void>;

    retrieveSetMembers(setKey: string): Promise<any[]>;

    getValue(key: string): Promise<any>;

    deleteKey(key: string): Promise<void>;


    deleteSetKey(key: string, setKey: string): Promise<void>;


}
