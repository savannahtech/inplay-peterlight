import {DateTimeFilterField, StringFilterField} from "../fields";

export default class UserFilterFields {
    static get filter() {
        return {
            "email": StringFilterField,
            "username": StringFilterField,
            "createdAt": DateTimeFilterField
        }
    }

    static get search() {
        return ["email", "username"]
    }

    static get ordering() {
        return ["email", "username", "createdAt"]
    }
}