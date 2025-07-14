# Image Generation API

## POST /v1/images/generations

This endpoint generates an image from a text prompt using a diffusion model.

### Features
- Adjustable resolution and style guidance
- Supports negative prompts and deterministic seed
- Image format: b64_json, png, and (soon) url

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | The input text description |
| `negative_prompt` | string | No | "" | Penalize undesired concepts |
| `size` | string | No | "512x512" | Controls output resolution (e.g., "512x512", "1024x1024") |
| `width` | number | No | - | Image width in pixels |
| `height` | number | No | - | Image height in pixels |
| `guidance_scale` | number | No | 7.5 | How strongly the model adheres to the prompt |
| `num_inference_steps` | number | No | 25 | Affects generation quality/speed |
| `response_format` | string | No | "b64_json" | Response format: "b64_json", "png", or "url" |
| `model` | string | No | "flux" | The backend model to use |
| `n` | number | No | 1 | Number of images to generate |

### Example Request

```json
{
  "prompt": "A futuristic cityscape at night with glowing neon lights",
  "n": 1,
  "size": "512x512",
  "guidance_scale": 7.5,
  "num_inference_steps": 25,
  "response_format": "b64_json",
  "model": "flux"
}
```

### Example Response

```json
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

### Usage in Frontend

The ColomboAI interface includes an Image Generation focus mode that uses this endpoint. Users can:

1. Select "Image Generation" from the focus modes
2. Enter a text prompt describing the desired image
3. Optionally add a negative prompt
4. Choose image size and other parameters
5. View both the generated image and raw API response data

### Error Responses

- `400`: Missing API configuration
- `500`: Internal server error during generation

This endpoint is ideal for building creative tools, mockup generators, or illustrative assistants.