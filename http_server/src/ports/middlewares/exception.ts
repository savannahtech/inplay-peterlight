import express from 'express'
import CustomException from "../helpers/exceptions/custom_exception";
import {HTTPResponseStatusCode} from "../helpers/definitions/response";
import CoreExceptionModelItemNotFoundException from "../../core/exception";
import {LoggerPort} from "../logger";

export const exceptionHandlerMiddleware = async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // @ts-ignore
    const logger: LoggerPort = req.container.resolve<LoggerPort>('logger');
    if (err instanceof CustomException) {
        // @ts-ignore
        return res.status(err.status_code).json({
            message: err.message,
            errors: err.errors
        })
    } else if (err instanceof CoreExceptionModelItemNotFoundException) {
        // @ts-ignore
        return res.status(HTTPResponseStatusCode.NOT_FOUND).json({
            message: err.message,
            errors: err.errors
        })
    } else {
        // @ts-ignore
        logger.error(err)
        // @ts-ignore
        return res.status(HTTPResponseStatusCode.INTERNAL_SERVER_ERROR).json({
            message: "An unknown error was encountered",
            errors: ["internal_server_error"]
        })
    }

}