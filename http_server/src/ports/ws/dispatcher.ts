import {WebsocketPayloadDataType} from "./data_types";
import container from "../../infrastructure/container";

export type WSDispatcherParams = {};


export default class WSDispatcher {

    constructor(params: WSDispatcherParams) {
    }

    async dispatchData(dataType: WebsocketPayloadDataType, payload: any) {
        const BGJobCaller = container.resolve("BGJobCaller")
        BGJobCaller.sendToWebsocketMessageQueue(dataType, payload)
    }
}

