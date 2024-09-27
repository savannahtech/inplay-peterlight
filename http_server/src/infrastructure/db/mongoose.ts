import mongoose from 'mongoose';
import AppConfig from "../../config";
import {LoggerPort} from "../../ports/logger";

export const connectToDatabase = async (logger: LoggerPort) => {
    try {
        await mongoose.connect(AppConfig.DATABASE_URL as string, {
            // @ts-ignore
            serverSelectionTimeoutMS: 30000, // 30 seconds
        });
        logger.info('Successfully connected to the database');
    } catch (error) {
        logger.error("Error connecting to database")
        logger.error(error as string | Error);
    }
};

export const disconnectFromDatabase = async (logger: LoggerPort) => {
    await mongoose.connection.close();
    logger.info('Successfully disconnected to the database');
};