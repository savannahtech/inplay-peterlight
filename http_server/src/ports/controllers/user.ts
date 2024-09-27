import {NextFunction, Request, Response} from "express";
import {HTTPResponseStatusCode} from "../helpers/definitions/response";
import UserService from "../../core/user/service";
import ExceptionsHelper from "../helpers/exceptions";

export type UserControllerParams = {
    userService: any;
};

export default class UserController {
    private userService: UserService;

    constructor(params: UserControllerParams) {
        this.userService = params.userService;
    }

    async registerUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {email, username, password} = req.body;
        const user = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.registerUser({
                    email, username, password
                }
            )), on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json({
            id: user?.data.id, email, username
        });
    }

    async loginUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {email, password} = req.body;
        const token = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.authenticateUser({
                    email, password
                }
            )), on_error: next
        });
        // @ts-ignore
        return token.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(
            token?.data
        );
    }

    async refreshUserToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {refresh_token} = req.body;
        const token = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.refreshUserToken({
                    refreshToken: refresh_token
                }
            )), on_error: next
        });
        // @ts-ignore
        return token.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(
            token?.data
        );
    }

    async fetchProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const user = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.userService.fetchSingleUser(req?.user?._id)),
            on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(
            user?.data
        );
    }

    async fetchUserProfileByAccessToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {access_token} = req.body;
        const user = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.fetchUserProfileByAccessToken({
                    accessToken: access_token
                }
            )), on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(
            user?.data
        );
    }

    async fetchUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const user = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.userService.fetchSingleUser(req.params.id)),
            on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(user.data);
    }

    async fetchUserMultiple(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const user = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.userService.fetchMultipleUsers()),
            on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(user.data);
    }

    async fundUserAccount(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const {amount} = req.body;
        const user = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.userService.fundUserAccount(req?.user?._id, amount)),
            on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json({"message": "Operation Successful"});
    }

    async fetchLeaderBoard(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const leaderBoard = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.userService.fetchLeaderBoard()),
            on_error: next
        });
        // @ts-ignore
        return leaderBoard.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(leaderBoard.data);
    }
}
