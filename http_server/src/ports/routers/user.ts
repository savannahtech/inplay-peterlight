import express from "express";
import UserController from '../controllers/user';
import {validateRequestBodyMiddleware} from "../middlewares/validation";
import {
    UserFundAccount,
    UserLogin,
    UserRefreshToken,
    UserRegister,
    UserRetrieveProfileByAccessToken
} from "../validators/schema/user";
import {
    permissionIsAuthenticatedByPrivateEndpointServerSecretMiddleware,
    permissionIsAuthenticatedMiddleware
} from "../middlewares/permission";
import {filtersParserFromQueryParamsMiddleware} from "../middlewares/filters";
import UserFilterFields from "../controllers/filters/user";
import container from "../../infrastructure/container";


const router = express.Router()
const userController = container.resolve<UserController>('userController');
// @ts-ignore
router.post('/private/token/access/profile', [permissionIsAuthenticatedByPrivateEndpointServerSecretMiddleware, validateRequestBodyMiddleware(UserRetrieveProfileByAccessToken)], (req, res, next) => userController.fetchUserProfileByAccessToken(req, res, next))
router.post('/register', [validateRequestBodyMiddleware(UserRegister),
        filtersParserFromQueryParamsMiddleware({
            filterFields: UserFilterFields.filter,
            searchFields: UserFilterFields.search,
            orderingFields: UserFilterFields.ordering
        })],
// @ts-ignore
    (req, res, next) => userController.registerUser(req, res, next))
// @ts-ignore
router.post('/login', [validateRequestBodyMiddleware(UserLogin)], (req, res, next) => userController.loginUser(req, res, next))
// @ts-ignore
router.get('/leaderboard', [permissionIsAuthenticatedMiddleware], (req, res, next) => userController.fetchLeaderBoard(req, res, next))
// @ts-ignore
router.get('/me', [permissionIsAuthenticatedMiddleware], (req, res, next) => userController.fetchProfile(req, res, next))
// @ts-ignore
router.post('/me/fund_account', [permissionIsAuthenticatedMiddleware, validateRequestBodyMiddleware(UserFundAccount)], (req, res, next) => userController.fundUserAccount(req, res, next))

// @ts-ignore
router.get('/all', [permissionIsAuthenticatedMiddleware], (req, res, next) => userController.fetchUserMultiple(req, res, next))
// @ts-ignore
router.get('/:id', [permissionIsAuthenticatedMiddleware], (req, res, next) => userController.fetchUser(req, res, next))

// @ts-ignore
router.post('/token/refresh', [validateRequestBodyMiddleware(UserRefreshToken)], (req, res, next) => userController.refreshUserToken(req, res, next))


export {router as UserRouter};