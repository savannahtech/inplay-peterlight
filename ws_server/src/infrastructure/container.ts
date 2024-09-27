import {asClass, asValue, AwilixContainer, createContainer} from 'awilix';
import {SocketNotificationPort} from "../core/ports/socket_notification";
import {AuthServicePort} from "../core/ports/auth";
import {Server} from "socket.io";
import AppConfig from "../config";
import {SocketIoNotificationAdapter} from "../adapters/ws/socket_notification";
import {MessageQueuePort} from "../core/ports/message_queue";
import {AuthServiceAdapter} from "../adapters/http/auth";
import {LoggerPort} from "../core/ports/logger";
import {WinstonLogger} from "../adapters/logger/winston";
import {NotifyEvents} from "../core/usecases/notify_events";
import {RedisAdapter} from "../adapters/cache/redis";
import {BullMQAdapter} from "../adapters/message_queue/bull_mq";
import {CachePort} from "../core/ports/cache";

type ContainerDependencies = {
    notifyEvents: NotifyEvents;
    notificationPort: SocketNotificationPort;
    authServicePort: AuthServicePort;
    messageQueuePort: MessageQueuePort;
    cache: CachePort
    io: Server | null
    appConfig: any,
    logger: LoggerPort
}

AppConfig.initiate()


const container: AwilixContainer<ContainerDependencies> = createContainer<ContainerDependencies>();


container.register({
    notifyEvents: asClass(NotifyEvents).singleton(),
    notificationPort: asClass(SocketIoNotificationAdapter).singleton(),
    authServicePort: asClass(AuthServiceAdapter).singleton(),
    messageQueuePort: asClass(BullMQAdapter).singleton(),
    appConfig: asValue(AppConfig),
    io: asValue(null),// Placeholder, will be set in app.ts,
    logger: asClass(WinstonLogger).singleton(),
    cache: asClass(RedisAdapter).singleton(),
});

export default container;