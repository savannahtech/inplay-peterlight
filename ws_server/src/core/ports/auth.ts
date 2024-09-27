export interface AuthUserDetails {
    _id: string;
    username: string;
    email: string;
}

export interface AuthServicePort {
    authenticate(token: string): Promise<AuthUserDetails | null>;
}

