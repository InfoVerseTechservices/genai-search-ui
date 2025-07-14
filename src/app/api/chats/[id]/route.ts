import connectDB from '@/lib/db';
import { Chat, Message } from '@/lib/db/schema';

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await connectDB();
    const { id } = await params;
    console.log('Looking for chat with id:', id);

    const chatExists = await Chat.findOne({ id });
    console.log('Chat found:', chatExists ? 'Yes' : 'No');

    if (!chatExists) {
      console.log('Chat not found, returning 404');
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    const chatMessages = await Message.find({ chatId: id }).sort({ createdAt: 1 });
    console.log('Messages found:', chatMessages.length);

    return Response.json(
      {
        chat: chatExists,
        messages: chatMessages,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in getting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await connectDB();
    const { id } = await params;

    // Try to find by custom id field first, then by MongoDB _id
    let chatExists = await Chat.findOne({ id });
    if (!chatExists) {
      chatExists = await Chat.findById(id);
    }

    if (!chatExists) {
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    // Delete using the same method we found the chat
    if (chatExists.id) {
      await Chat.deleteOne({ id: chatExists.id });
      await Message.deleteMany({ chatId: chatExists.id });
    } else {
      await Chat.findByIdAndDelete(id);
      await Message.deleteMany({ chatId: id });
    }

    return Response.json(
      { message: 'Chat deleted successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in deleting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
