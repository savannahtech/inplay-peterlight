import mongoose, {Document, Schema} from 'mongoose';
import {BetPickEnum, BetStateEnum, BetTypeEnum} from "../enums";

// Define the Bet document interface
export interface BetInterface extends Document {
    userId: string;
    gameId: string;
    betType: BetTypeEnum;
    betPick: BetPickEnum;
    state: BetStateEnum;
    amount: number;
    odds: number;
    createdAt: Date;
    updatedAt: Date;
}

// Define the Bet schema
const BetSchema: Schema<BetInterface> = new Schema({
    // @ts-ignore
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    // @ts-ignore
    gameId: {type: Schema.Types.ObjectId, ref: 'Game', required: true},
    betType: {type: String, enum: Object.values(BetTypeEnum), required: true},
    betPick: {type: String, enum: Object.values(BetPickEnum), required: true},
    state: {type: String, enum: Object.values(BetStateEnum), required: true},
    // @ts-ignore
    amount: {type: Schema.Types.Decimal128, required: true},
    odds: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now, update: true},
});

// Create and export the Bet model
export default mongoose.model<BetInterface>('Bet', BetSchema);
