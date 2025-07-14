import { getModelForFunction, getAllAvailableModels, getModelsByCapability } from '@/lib/modelSelector';

export async function GET() {
  try {
    const testResults = {
      webSearch: getModelForFunction('webSearch'),
      imageGeneration: getModelForFunction('generate_image'),
      toolingGeneration: getModelForFunction('toolingGeneration'),
      unknownFunction: getModelForFunction('unknownFunction'),
      allModels: getAllAvailableModels(),
      toolCapableModels: getModelsByCapability('tools'),
      multimodalModels: getModelsByCapability('multimodal'),
    };

    return Response.json({
      message: 'Model selection test results',
      results: testResults,
    });
  } catch (error) {
    console.error('Error testing models:', error);
    return Response.json(
      { error: 'Failed to test model selection' },
      { status: 500 }
    );
  }
}