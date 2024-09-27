import {NextFunction, Request, Response} from 'express'
import {HTTPResponseStatusCode} from "../helpers/definitions/response";
import CustomException from "../helpers/exceptions/custom_exception";
import ExceptionsHelper from "../helpers/exceptions";
import AppConfig from "../../config";


export const permissionIsAuthenticatedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const response = await ExceptionsHelper.executeCallbackSync({
        callback: () => CustomException.assert(
            // @ts-ignore
            req.user,
            {
                status_code: HTTPResponseStatusCode.NOT_AUTHENTICATED,
                message: "Authentication credentials not found",
                errors: ["authentication_required"]
            }
        ), on_error: next
    });
    if (response.is_success) {
        return next()
    } else {
        return response.error
    }
};


export const permissionIsAuthenticatedByPrivateEndpointServerSecretMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const secret_key = req.header('secret-key')?.trim();
    const response = await ExceptionsHelper.executeCallbackSync({
        callback: () => CustomException.assert(
            // @ts-ignore
            secret_key && (AppConfig.PRIVATE_ENDPOINT_SECRET_KEY === secret_key),
            {
                status_code: HTTPResponseStatusCode.NOT_AUTHENTICATED,
                message: "Private endpoint authorization failed",
                errors: ["authorization_failed"]
            }
        ), on_error: next
    });
    if (response.is_success) {
        return next()
    } else {
        return response.error
    }
};