import {HTTPResponseStatusCode} from "../definitions/response";

type CustomExceptionParams = {
    message: string,
    errors: string[],
    status_code: HTTPResponseStatusCode
}

export default class CustomException extends Error {
    message: string;
    errors?: string[];
    status_code?: number

    constructor(params: CustomExceptionParams) {
        super(params.message)
        this.errors = params.errors;
        this.message = params.message
        this.status_code = params.status_code
    }

    static assert(condition: any, data: CustomExceptionParams) {
        if (!condition) {
            throw new CustomException(data)
        }
    }
}



