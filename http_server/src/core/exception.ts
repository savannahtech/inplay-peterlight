
type CoreExceptionModelItemNotFoundParamsType = {
    modelName: string
}

export default class CoreExceptionModelItemNotFoundException extends Error {
    message:string
    errors?: string[];


    constructor(params: CoreExceptionModelItemNotFoundParamsType) {
        const message = `'${params.modelName.toLowerCase()}' could not be found`
        super(message)
        this.errors = ["item_not_found"];
        this.message = message
    }
}
