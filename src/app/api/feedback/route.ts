import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messageId, chatId, type, action } = await request.json();
    
    // In a real implementation, save to database
    console.log(`${action === 'add' ? 'Added' : 'Removed'} ${type} for message ${messageId} in chat ${chatId}`);
    
    return NextResponse.json({
      success: true,
      messageId,
      chatId,
      type,
      action
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}