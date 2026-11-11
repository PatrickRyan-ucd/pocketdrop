import { NextResponse } from 'next/server';
import { getRequiredEnv } from '@/lib/env';
import type { ProductData } from '@/lib/types';

const systemPrompt = `You are an expert marketplace copywriter and sales analyst.
Extract a product listing from the seller's natural language description.
Return ONLY valid JSON with this exact shape:
{
  "name": string,
  "description": string,
  "price": number,
  "currency": string,
  "quantity": number,
  "collectionDetails": string,
  "imageEmoji": string,
  "category": string,
  "sellerLabel": string
}
Rules:
- Keep price as a number, not a string.
- Use a 3-letter ISO currency code like EUR, GBP, USD.
- Create a polished product name.
- Collection details should be a clear sentence.
- Provide a short professional product description (max 2 sentences).
- Use an emoji that matches the product.
- Use a category like "Campus merch", "Streetwear", "Food & drink" etc.
- Use seller label like "Student Society", "Independent seller", "Small business".
- If price or quantity are not explicit, infer a sensible estimate from the sentence.
- Return only JSON without markdown fences.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = String(body?.prompt || '').trim();

    if (!prompt) {
      return NextResponse.json({ error: 'A product description is required.' }, { status: 400 });
    }

    const apiKey = getRequiredEnv('OPENROUTER_API_KEY');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://pocketdrop.vercel.app',
        'X-Title': 'PocketDrop',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'OpenRouter request failed.';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response returned from OpenRouter.' }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const product: ProductData = {
      name: String(parsed.name || 'PocketDrop Product'),
      description: String(parsed.description || 'Freshly prepared for your community.'),
      price: Number(parsed.price || 0),
      currency: String(parsed.currency || 'EUR').toUpperCase(),
      quantity: Number(parsed.quantity || 1),
      collectionDetails: String(parsed.collectionDetails || 'Collection arranged directly with the seller.'),
      imageEmoji: String(parsed.imageEmoji || '✨'),
      category: String(parsed.category || 'Featured drop'),
      sellerLabel: String(parsed.sellerLabel || 'Independent seller'),
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error('parse-product error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse product information.' },
      { status: 500 }
    );
  }
}
