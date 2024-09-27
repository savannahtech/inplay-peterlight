import Joi from "joi";

export const UserRegister = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .required(),
    email: Joi.string()
        .email()
        .trim()
        .min(3)
        .required(),
    password: Joi.string().regex(new RegExp('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$')).message(
        `
         Ensure password has at least two uppercase letters.\n
         Ensure password has at least one special character.\n
         Ensure password has at least two digits. \n
         Ensure password has at least three lowercase letters.
         Ensure password is of minimum length 8.
        `
    ).required()
})


export const UserLogin = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .min(3)
        .required(),
    password: Joi.string().trim().required()
})

export const UserFundAccount = Joi.object({
    amount: Joi.number()
        .min(0)
        .required()
})


export const UserRefreshToken = Joi.object({
    refresh_token: Joi.string().trim().required()
})

export const UserRetrieveProfileByAccessToken = Joi.object({
    access_token: Joi.string().trim().required()
})
