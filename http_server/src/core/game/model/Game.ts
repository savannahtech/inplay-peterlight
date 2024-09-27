import mongoose, {Document, Schema} from 'mongoose';

// Define the Game document interface
export interface GameInterface extends Document {
    homeTeam: string;
    awayTeam: string;
    defaultOddsHomeWin: number;
    defaultOddsAwayWin: number;
    defaultOddsDraw: number;
    isOngoing: boolean;
    startedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Define the Game schema
const GameSchema: Schema<GameInterface> = new Schema({
    homeTeam: {type: String, required: true},
    awayTeam: {type: String, required: true},
    defaultOddsHomeWin: {type: Number, required: true},
    defaultOddsAwayWin: {type: Number, required: true},
    defaultOddsDraw: {type: Number, required: true},
    isOngoing: {type: Boolean, default: false},
    startedAt: {type: Date, default: Date.now},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now, update: true},
});

// Create and export the Game model
export default mongoose.model<GameInterface>('Game', GameSchema);
