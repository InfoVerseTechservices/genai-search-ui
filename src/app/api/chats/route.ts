import connectDB from '@/lib/db';
import { Chat } from '@/lib/db/schema';

export const GET = async (req: Request) => {
  try {
    await connectDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    let query = {};
    if (userId) {
      query = { userId };
    }
    
    const chats = await Chat.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(limit);
    
    return Response.json({ chats }, { status: 200 });
  } catch (err) {
    console.error('Error in getting chats: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    await connectDB();
    const { id, title, focusMode, files, userId } = await req.json();
    
    const newChat = new Chat({
      id,
      title,
      userId,
      focusMode,
      files: files || [],
      updatedAt: new Date()
    });
    
    await newChat.save();
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Error creating chat: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
