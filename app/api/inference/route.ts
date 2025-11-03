import { HfInference } from '@huggingface/inference';
import { NextRequest, NextResponse } from 'next/server';

// Initialize HuggingFace client
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

export async function POST(request: NextRequest) {
  try {
    const { model, input, demoType } = await request.json();

    if (!process.env.HUGGINGFACE_API_TOKEN) {
      return NextResponse.json(
        { error: 'HuggingFace API token not configured' },
        { status: 500 }
      );
    }

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    let result;

    // Handle different demo types
    switch (demoType) {
      case 'text-to-text':
        // Text summarization or generation
        result = await hf.summarization({
          model: model || 'facebook/bart-large-cnn',
          inputs: input,
          parameters: {
            max_length: 150,
            min_length: 30,
          },
        });
        return NextResponse.json({
          output: result.summary_text,
          model: model || 'facebook/bart-large-cnn',
          type: 'text',
        });

      case 'image-to-text':
        // Image captioning
        if (!input.startsWith('http')) {
          return NextResponse.json(
            { error: 'Please provide a valid image URL' },
            { status: 400 }
          );
        }
        result = await hf.imageToText({
          model: model || 'Salesforce/blip-image-captioning-large',
          data: await fetch(input).then(res => res.blob()),
        });
        return NextResponse.json({
          output: result.generated_text,
          model: model || 'Salesforce/blip-image-captioning-large',
          type: 'text',
        });

      case 'text-to-image':
        // Text to image generation
        const imageResult = await hf.textToImage({
          model: model || 'stabilityai/stable-diffusion-2',
          inputs: input,
        });
        // Convert blob to base64
        const arrayBuffer = await (imageResult as unknown as Blob).arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return NextResponse.json({
          output: `data:image/png;base64,${base64}`,
          model: model || 'stabilityai/stable-diffusion-2',
          type: 'image',
        });

      case 'sentiment-analysis':
        // Sentiment analysis
        result = await hf.textClassification({
          model: model || 'distilbert-base-uncased-finetuned-sst-2-english',
          inputs: input,
        });
        return NextResponse.json({
          output: result,
          model: model || 'distilbert-base-uncased-finetuned-sst-2-english',
          type: 'classification',
        });

      case 'question-answering':
        // Question answering (requires context)
        const { context, question } = JSON.parse(input);
        result = await hf.questionAnswering({
          model: model || 'deepset/roberta-base-squad2',
          inputs: {
            question: question,
            context: context,
          },
        });
        return NextResponse.json({
          output: result.answer,
          score: result.score,
          model: model || 'deepset/roberta-base-squad2',
          type: 'text',
        });

      default:
        // Default to text generation
        result = await hf.textGeneration({
          model: model || 'gpt2',
          inputs: input,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
          },
        });
        return NextResponse.json({
          output: result.generated_text,
          model: model || 'gpt2',
          type: 'text',
        });
    }
  } catch (error: any) {
    console.error('Inference error:', error);
    
    // Handle specific HuggingFace errors
    if (error.message?.includes('Model') && error.message?.includes('is currently loading')) {
      return NextResponse.json(
        { error: 'Model is loading. Please try again in a few seconds.' },
        { status: 503 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Inference failed. Please try again.' },
      { status: 500 }
    );
  }
}
