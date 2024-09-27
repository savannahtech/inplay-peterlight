import User, {UserInterface} from "../../core/user/model/User";
import {BaseRepository} from './index';

export default class UserRepository extends BaseRepository<UserInterface> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<UserInterface | null> {
        return await this.fetchSingle({email}, true);
    }

    async findByUserName(username: string): Promise<UserInterface | null> {
        return await this.fetchSingle({username}, true);
    }

    async fetchMultiple(where?: { [key: string]: any }, order_by?: { [key: string]: 1 | -1 }, projection: null | string[] = null) {
        // @ts-ignore
        return await this.applyProjection(this.model.find(where as Record<string, any>).select("-password").sort(order_by), projection).exec();
    }
}
