import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import toml from 'toml';

interface ApiConfig {
  apiKey: string;
  apiUrl: string;
  modelName: string; // Though not directly used by proxy, good to fetch all
}

async function getServerSideConfig(): Promise<ApiConfig> {
  const configPath = path.join(process.cwd(), 'config.toml');
  const rawToml = await fs.readFile(configPath, 'utf-8');
  const config = toml.parse(rawToml);

  const customOpenAIConfig = config?.MODELS?.CUSTOM_OPENAI;
  if (!customOpenAIConfig || !customOpenAIConfig.API_KEY || !customOpenAIConfig.API_URL || !customOpenAIConfig.MODEL_NAME) {
    throw new Error("Invalid or incomplete [MODELS.CUSTOM_OPENAI] configuration in config.toml");
  }
  return {
    apiKey: customOpenAIConfig.API_KEY,
    apiUrl: customOpenAIConfig.API_URL,
    modelName: customOpenAIConfig.MODEL_NAME,
  };
}

export async function POST(request: Request) {
  console.log("PROXY_ROUTE_LOG: /api/generate-video-proxy called");
  try {
    const clientRequestBody = await request.json();
    const apiConfig = await getServerSideConfig();

    const externalApiResponse = await fetch(`${apiConfig.apiUrl}videos/generations`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify(clientRequestBody),
    });

    const responseData = await externalApiResponse.json();

    if (!externalApiResponse.ok) {
      console.error("PROXY_ROUTE_LOG: Error from external API:", responseData);
      return NextResponse.json(responseData, { status: externalApiResponse.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error("PROXY_ROUTE_LOG: Error in proxy route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred in the proxy.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}