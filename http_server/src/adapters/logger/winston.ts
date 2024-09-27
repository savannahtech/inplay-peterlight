import winston from 'winston';
import {LoggerPort} from "../../ports/logger";

export class WinstonLogger implements LoggerPort {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info', // Set the default log level
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({timestamp, level, message, stack}) => {
                    return stack
                        ? `${timestamp} [${level}]: ${message} - ${stack}`
                        : `${timestamp} [${level}]: ${message}`;
                })
            ),
            transports: [
                // General logs (info, warn, etc.) to combined.log
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    level: 'info', // Everything above 'info' (info, warn)
                }),

                // Error logs go to error.log
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error', // Only 'error' logs
                }),

                // Output all logs to the console as well
                new winston.transports.Console()
            ],
        });
    }

    info(message: string): void {
        this.logger.info(message);
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    error(message: string | Error): void {
        if (message instanceof Error) {
            this.logger.error(message.message, {stack: message.stack});
        } else {
            this.logger.error(message);
        }
    }
}
