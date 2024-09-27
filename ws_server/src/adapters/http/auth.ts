import axios from "axios";
import {AuthServicePort, AuthUserDetails} from "../../core/ports/auth";

type AuthServiceAdapterParams = {
    appConfig: any
}


export class AuthServiceAdapter implements AuthServicePort {
    private appConfig;


    constructor(params: AuthServiceAdapterParams) {
        this.appConfig = params.appConfig;
    }

    private get endpoint_url(): string {
        return `${this.appConfig.HTTP_SERVER_BASE_URL}/user/private/token/access/profile`
    }

    async authenticate(token: string): Promise<AuthUserDetails | null> {
        console.log(this.endpoint_url, token, "ddddddddddddddddddddddddddd")
        const response = await axios.post(this.endpoint_url, {
            "access_token": token
        }, {
            headers: {
                "secret-key": this.appConfig.HTTP_SERVER_PRIVATE_ENDPOINT_SECRET_KEY,
            }
        });
        return response.data;
    }
}
