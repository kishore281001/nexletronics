import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderEmail } from '@/lib/store';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not set!');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify signature using Razorpay official package
    const isValid = Razorpay.validateWebhookSignature(rawBody, signature, secret);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payload = event.payload.payment.entity;
      const razorpay_order_id = payload.order_id;
      const payment_id = payload.id;

      // 1. Mark order as paid in DB
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_id })
        .eq('razorpay_order_id', razorpay_order_id)
        .select()
        .single();
      
      if (error || !order) {
        console.error('Webhook: Failed to update order', error);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // 2. Decrement Stock
      for (const item of order.items) {
        const { data: prod } = await supabaseAdmin.from('products').select('stock_qty').eq('id', item.product.id).single();
        if (prod) {
          const newQty = Math.max(0, (prod.stock_qty || 0) - item.quantity);
          await supabaseAdmin.from('products').update({ stock_qty: newQty }).eq('id', item.product.id);
        }
      }

      // 3. Fire Email (runs in background)
      sendOrderEmail(order).catch(console.error);
      
      // 4. Trigger Shiprocket Fulfillment (runs in background)
      createShiprocketOrder(order).then(async (tracking_id) => {
        if (tracking_id) {
          await supabaseAdmin.from('orders').update({ tracking_id }).eq('id', order.id);
        }
      }).catch(console.error);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
