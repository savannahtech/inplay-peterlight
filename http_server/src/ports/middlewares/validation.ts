import {ObjectSchema} from 'joi'
import {NextFunction, Request, Response} from 'express'
import {HTTPResponseStatusCode} from "../helpers/definitions/response";

type ValidationResponseType = {
    status: boolean,
    data?: any
}

const validateRequestData = (schema: ObjectSchema, data: {}): ValidationResponseType => {
    const {error, value} = schema.validate(data);
    if (error) {
        return {
            status: false,
            data: error.details.map((item) => ({
                message: item.message,
                errors: error?.details[0].path
            }))
        }
    } else {
        return {
            status: true,
            data: value
        }
    }

}

export const validateRequestBodyMiddleware = (validationSchema: ObjectSchema) => ((req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const validationResponse = validateRequestData(validationSchema, req.body)
    if (validationResponse.status) {
        // @ts-ignore
        req.body = {...(req.body || {}), ...validationResponse.data};
        return next()
    } else {
        // @ts-ignore
        return res.status(HTTPResponseStatusCode.BAD_REQUEST).json(
            validationResponse.data
        )
    }
})