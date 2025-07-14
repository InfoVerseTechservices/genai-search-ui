import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  chatId: { type: String, required: true },
  userId: { type: String, required: true },
  message: { type: String, required: true },
  userMessage: { type: String },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Favourite = mongoose.models.Favourite || mongoose.model('Favourite', favouriteSchema);

export async function POST(request: NextRequest) {
  try {
    const { messageId, chatId, message, userMessage, userId, action } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    if (action === 'add') {
      let title = 'Untitled';
      if (userMessage) {
        const words = userMessage.trim().split(/\s+/);
        title = words.slice(0, Math.min(5, words.length)).join(' ');
      }
      
      await Favourite.create({
        messageId,
        chatId,
        userId,
        message,
        userMessage,
        title
      });
    } else {
      await Favourite.deleteOne({ messageId, userId });
    }
    
    return NextResponse.json({
      success: true,
      messageId,
      chatId,
      action
    });
  } catch (error) {
    console.error('Favourite API error:', error);
    return NextResponse.json(
      { error: 'Failed to save favourite' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const favourites = await Favourite.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    return NextResponse.json({
      success: true,
      favourites: favourites.map(fav => ({
        chatId: fav.chatId,
        messageId: fav.messageId,
        title: fav.title,
        content: fav.message.substring(0, 100) + '...',
        type: 'text',
        createdAt: fav.createdAt
      }))
    });
  } catch (error) {
    console.error('Get favourites error:', error);
    return NextResponse.json(
      { error: 'Failed to get favourites' },
      { status: 500 }
    );
  }
}