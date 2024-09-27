import {NextFunction, Request, Response} from 'express'
import AuthService from "../../adapters/service/auth";
import UserRepository from "../../adapters/repository/user";
import {DateTimeHelpers} from "../helpers/commons/date_time";
import {HTTPResponseStatusCode} from "../helpers/definitions/response";
import User from "../../core/user";
import ExceptionsHelper from "../helpers/exceptions";
import container from "../../infrastructure/container";


export const JWTAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            const authService = container.resolve<AuthService>('authService');
            const userRepository = container.resolve<UserRepository>('userRepository');
            let decoded = ExceptionsHelper.executeCallbackSync({
                callback: () => authService.decodeToken(token)
            })
            if (decoded.is_success) {
                decoded = decoded.data
                if (decoded?.type === "ACCESS" && DateTimeHelpers.currentTimeInSecs() < decoded?.exp) {
                    const user = await userRepository.findByEmail(decoded.email)
                    if (!user) {
                        // @ts-ignore
                        return res.status(HTTPResponseStatusCode.NOT_AUTHENTICATED).json({
                            message: "Invalid authentication credentials",
                            errors: ["authentication error"]
                        })
                    }
                    // @ts-ignore
                    req.user = new User(user)
                }
            }
        }
        next();
    } catch (err) {
        next(err)
    }
};