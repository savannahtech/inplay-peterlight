import {asClass, asValue, AwilixContainer, createContainer} from 'awilix';
import UserRepository from "../adapters/repository/user";
import AuthService from "../adapters/service/auth";
import UserService from "../core/user/service";
import UserController from '../ports/controllers/user';
import GameController from "../ports/controllers/game";
import GameService from "../core/game/service";
import GameRepository from "../adapters/repository/game";
import AppConfig from "../config";
import {MessageQueuePort} from "../ports/message_queue";
import {LoggerPort} from "../ports/logger";
import {WinstonLogger} from "../adapters/logger/winston";
import BGJobController from "../ports/bg_jobs/controller";
import BGJobCaller from "../ports/bg_jobs/caller";
import {CachePort} from "../ports/cache";
import {RedisAdapter} from "../adapters/cache/redis";
import {BullMQAdapter} from "../adapters/message_queue/bull_mq";
import GameEventService from "../core/game/event/service";
import GameEventRepository from "../adapters/repository/game_event";
import BetRepository from "../adapters/repository/bet";
import BetService from "../core/bet/service";
import UserTransactionRepository from "../adapters/repository/user_transaction";
import UserTransactionService from "../core/user/user_transaction/service";
import WSDispatcher from "../ports/ws/dispatcher";

type ContainerDependencies = {
    userRepository: UserRepository;
    gameRepository: GameRepository;
    gameEventRepository: GameEventRepository;
    betRepository: BetRepository;
    userTransactionRepository: UserTransactionRepository;
    authService: AuthService;
    userService: UserService;
    gameService: GameService;
    gameEventService: GameEventService;
    betService: BetService;
    userTransactionService: UserTransactionService;
    userController: UserController;
    gameController: GameController;
    appConfig: any,
    messageQueue: MessageQueuePort,
    logger: LoggerPort,
    BGJobController: BGJobController,
    BGJobCaller: BGJobCaller,
    cache: CachePort,
    wsDispatcher: WSDispatcher
}
AppConfig.initiate()
const container: AwilixContainer<ContainerDependencies> = createContainer<ContainerDependencies>();


container.register({
    userRepository: asClass(UserRepository).singleton(),
    gameRepository: asClass(GameRepository).singleton(),
    gameEventRepository: asClass(GameEventRepository).singleton(),
    userTransactionRepository: asClass(UserTransactionRepository).singleton(),
    betRepository: asClass(BetRepository).singleton(),
    authService: asClass(AuthService).singleton(),
    userService: asClass(UserService).singleton(),
    gameService: asClass(GameService).singleton(),
    gameEventService: asClass(GameEventService).singleton(),
    betService: asClass(BetService).singleton(),
    userTransactionService: asClass(UserTransactionService).singleton(),
    userController: asClass(UserController,).singleton(),
    gameController: asClass(GameController,).singleton(),
    appConfig: asValue(AppConfig),
    messageQueue: asClass(BullMQAdapter).singleton(),
    logger: asClass(WinstonLogger).singleton(),
    BGJobController: asClass(BGJobController,).singleton(),
    BGJobCaller: asClass(BGJobCaller).singleton(),
    cache: asClass(RedisAdapter,).singleton(),
    wsDispatcher: asClass(WSDispatcher).singleton()
});


export default container