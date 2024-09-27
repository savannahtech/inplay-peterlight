import mongoose, {Document, Schema} from 'mongoose';
import {UserTransactionTypeEnum} from "../enums";

// Define the UserTransaction document interface
export interface UserTransactionInterface extends Document {
    userId: string;
    amount: number;
    type: UserTransactionTypeEnum;
    createdAt: Date;
}

// Define the UserTransaction schema
const UserTransactionSchema: Schema<UserTransactionInterface> = new Schema({
    // @ts-ignore
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    // @ts-ignore
    type: {type: String, enum: Object.values(UserTransactionTypeEnum), required: true},
    // @ts-ignore
    amount: {type: Schema.Types.Decimal128, required: true},
    createdAt: {type: Date, default: Date.now},
});

// Create and export the UserTransaction model
export default mongoose.model<UserTransactionInterface>('UserTransaction', UserTransactionSchema);
