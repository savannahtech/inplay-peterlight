import mongoose, {Document, Schema} from 'mongoose';

// Define the User document interface
export interface UserInterface extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define the User schema
const UserSchema: Schema<UserInterface> = new Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now, update: true},
});
// Create and export the User model
export default mongoose.model<UserInterface>('User', UserSchema);
