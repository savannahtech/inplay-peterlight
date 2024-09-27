//Listening
import app, {logger, serverPort, startApp} from "./app";

startApp().then(() => {
    app.listen(serverPort, () => {
        logger.info(`Server listening on port ${serverPort}`)
    })
})