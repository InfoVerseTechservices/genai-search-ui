import mongoose from 'mongoose';

interface File {
  name: string;
  fileId: string;
}

const messageSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  chatId: { type: String, required: true },
  content: { type: String, required: true },
  role: { type: String, enum: ['assistant', 'user'], required: true },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  userId: { type: String, required: false }, // Optional for backward compatibility
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  focusMode: { type: String, required: true },
  files: [{
    name: String,
    fileId: String
  }]
});

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
