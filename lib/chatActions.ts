// lib/chatActions.ts

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'; // System role might be needed for some models
  content: string;
}

export interface StreamChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  // stream is handled by the proxy, no need to pass it here
}

export async function streamChatCompletion(
  params: StreamChatCompletionParams
): Promise<ReadableStream<Uint8Array>> {
  const proxyUrl = '/api/chat-completion-proxy';

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream', // Client explicitly accepts event-stream
      },
      body: JSON.stringify(params), // Send all params to the proxy
    });

    if (!response.ok) {
      // Attempt to parse error response from proxy if possible
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Not JSON, use text
        errorData = { error: await response.text() };
      }
      throw new Error(
        `Failed to stream chat completion. Status: ${response.status}. Error: ${errorData.error || 'Unknown error from proxy'}`
      );
    }

    if (!response.body) {
      throw new Error('Response body is null from chat completion stream.');
    }

    return response.body; // This is a ReadableStream<Uint8Array>

  } catch (error: any) {
    console.error('Error in streamChatCompletion:', error);
    // Re-throw to be caught by the calling component (e.g., ChatWindow)
    // This allows UI to display specific error messages.
    throw error;
  }
}
