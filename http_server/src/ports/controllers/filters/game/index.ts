import {BooleanFilterField, DateTimeFilterField} from "../fields";


export default class GameFilterFields {
    static get filter() {
        return {
            "isOngoing": BooleanFilterField,
            "createdAt": DateTimeFilterField
        }
    }

    static get search() {
        return []
    }

    static get ordering() {
        return ["startedAt"]
    }

    static get expansion() {
        return []
    }
}