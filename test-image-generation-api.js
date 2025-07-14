const testImageGeneration = async () => {
  const testPayload = {
    prompt: "A futuristic cityscape at night with glowing neon lights",
    n: 1,
    size: "512x512",
    guidance_scale: 7.5,
    num_inference_steps: 25,
    response_format: "b64_json",
    model: "flux"
  };

  try {
    const response = await fetch('http://localhost:3000/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data[0] && data.data[0].b64_json) {
      console.log('✅ Image generation successful - base64 data received');
    } else {
      console.log('❌ Image generation failed or no image data');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testImageGeneration();