import Joi from "joi";
import {BetPickEnum, BetTypeEnum} from "../../../core/bet/enums";

export const GamePlaceBet = Joi.object({
    amount: Joi.number()
        .min(10)
        .required(),
    betType: Joi.string().trim().valid(...Object.values(BetTypeEnum)).required(),
    betPick: Joi.string().trim().valid(...Object.values(BetPickEnum)).required(),
})