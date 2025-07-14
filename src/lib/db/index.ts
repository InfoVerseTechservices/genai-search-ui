import mongoose from 'mongoose';
import { getMongoDbUri } from '../config';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoUri = getMongoDbUri();
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in config');
    }
    
    await mongoose.connect(mongoUri, {
      dbName: 'colomboai_chat'
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
