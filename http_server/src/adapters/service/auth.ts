import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../../core/user";
import AppConfig from "../../config";

export type AuthServiceDecodeTokenResType = {
    id: string,
    email: string,
    exp: number,
    type: "ACCESS" | "REFRESH"
}

export default class AuthService {
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    generateToken(user: User, type: "ACCESS" | "REFRESH", expiresIn?: string): string {
        // @ts-ignore
        return jwt.sign({id: user.id, email: user.email, type}, AppConfig.SECRET_KEY, {expiresIn: expiresIn || '1h'});
    }

    decodeToken(token: string): AuthServiceDecodeTokenResType {
        return jwt.verify(token, AppConfig.SECRET_KEY) as AuthServiceDecodeTokenResType;
    }
}

