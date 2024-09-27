//Listening
import server, {logger, serverPort, startApp} from "./app";
import container from "./infrastructure/container";
import {startWorker} from "./worker";

startApp().then(() => {
    const cache = container.resolve('cache')
    const appConfig = container.resolve('appConfig')
    const notifyEvents = container.resolve("notifyEvents")
    startWorker(cache, appConfig, logger, notifyEvents)
    server.listen(serverPort, () => {
        logger.info(`Server listening on port ${serverPort}`)
    })
})