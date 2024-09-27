type ExecuteCallbackParams = {
    callback: () => any,
    on_error?: (e: any) => any
}

type ExecuteCallbackResType = {
    [key: string]: any,
    is_success: boolean
}

export default class ExceptionsHelper {
    static async executeCallbackAsync(
        params: ExecuteCallbackParams
    ): Promise<ExecuteCallbackResType> {
        try {
            return {data: await params.callback(), is_success: true}
        } catch (e) {
            return {is_success: false, error: params?.on_error && params.on_error(e)}
        }
    }

    static executeCallbackSync(
        params: ExecuteCallbackParams
    ): ExecuteCallbackResType {
        try {
            return {data: params.callback(), is_success: true}
        } catch (e) {
            return {is_success: false, error: params?.on_error && params.on_error(e)}
        }
    }
}