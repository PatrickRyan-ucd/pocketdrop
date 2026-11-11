import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = body?.product;

    if (!product?.name || !product?.price) {
      return NextResponse.json({ error: 'Product data is required.' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Missing required environment variable: STRIPE_SECRET_KEY' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: String(product.currency || 'EUR').toLowerCase(),
            unit_amount: Math.round(Number(product.price) * 100),
            product_data: {
              name: product.name,
              description: String(product.description || 'PocketDrop purchase'),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
      metadata: {
        productName: product.name,
        sellerLabel: product.sellerLabel || 'Independent seller',
        collectionDetails: product.collectionDetails || 'Collection arranged with seller',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('create-checkout-session error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown Stripe error' },
      { status: 500 }
    );
  }
}
