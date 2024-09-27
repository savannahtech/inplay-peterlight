import {LoggerPort} from "../logger";
import morgan from "morgan";

export const morganMiddleware = (logger: LoggerPort) => {
    const morganStream = {
        write: (message: string) => {
            logger.info(message.trim());
        },
    };

    return morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream });
};