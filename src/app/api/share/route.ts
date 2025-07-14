import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatId, messageId, content } = await request.json();
    
    // Generate a simple share ID
    const shareId = Math.random().toString(36).substring(2, 15);
    
    return NextResponse.json({
      shareId,
      sharedId: shareId,
      id: shareId,
      success: true
    });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}