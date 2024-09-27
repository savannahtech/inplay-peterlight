import mongoose, {Document, Schema} from 'mongoose';
import {GameEventTeamEnum, GameEventTypeEnum} from "../enums";

// Define the Game event document interface
export interface GameEventInterface extends Document {
    gameId: string;
    type: GameEventTypeEnum;
    team: GameEventTeamEnum;
    player: string;
    minute: number;
    createdAt: Date;
    updatedAt: Date;
}

// Define the Game event schema
const GameSchema: Schema<GameEventInterface> = new Schema({
    // @ts-ignore
    gameId: {type: Schema.Types.ObjectId, ref: 'Game', required: true},
    type: {type: String, enum: Object.values(GameEventTypeEnum), required: true},
    team: {type: String, enum: Object.values(GameEventTeamEnum), required: true},
    player: {type: String, required: true},
    minute: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now, update: true},
});

// Create and export the Game event model
export default mongoose.model<GameEventInterface>('GameEvent', GameSchema);
