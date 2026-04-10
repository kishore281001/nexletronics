import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'placeholder',
      key_secret: process.env.RAZORPAY_SECRET || 'placeholder',
    });

    const { items, address, user_id, user_email, user_name, total, method } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Double check the prices in DB to prevent frontend spoofing
    let calculatedSubtotal = 0;
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('price, discount_price')
        .eq('id', item.product.id)
        .single();
      
      if (!product) return NextResponse.json({ error: `Product missing: ${item.product.name}` }, { status: 400 });
      calculatedSubtotal += (product.discount_price || product.price) * item.quantity;
    }
    
    // We assume shipping logic is simple here (free over 999 or 50)
    const calculatedShipping = calculatedSubtotal >= 999 ? 0 : 50;
    const calculatedTotal = calculatedSubtotal + calculatedShipping;

    // Reject if manipulated by > ₹1
    if (Math.abs(calculatedTotal - total) > 1) {
      return NextResponse.json({ error: 'Price mismatch. Please refresh.' }, { status: 400 });
    }

    // Generate internal order number
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const order_number = `NXT-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(4, '0')}`;

    if (method === 'cod') {
      // Direct insertion for COD, marking as pending
      const { data, error } = await supabase.from('orders').insert({
        order_number, user_id: user_id || 'guest', user_email, user_name,
        items, subtotal: calculatedSubtotal, shipping: calculatedShipping, total: calculatedTotal,
        status: 'pending', shipping_address: address
      }).select().single();

      if (error) throw error;

      // Decrement Stock
      try {
        for (const item of items) {
          const { data: prod } = await supabase.from('products').select('stock_qty').eq('id', item.product.id).single();
          if (prod) {
            const newQty = Math.max(0, (prod.stock_qty || 0) - item.quantity);
            await supabase.from('products').update({ stock_qty: newQty }).eq('id', item.product.id);
          }
        }
      } catch (e) {
        console.error('Stock decrement failed for COD', e);
      }

      // We can't import sendOrderEmail exactly the same way here if it uses Next.js fetch with relative URL on the server
      // so we will just trigger the external resend API or write to a queue if needed. But for now, returning the order is fine,
      // and we let the frontend trigger it exactly as before for COD.
      
      // Trigger Shiprocket Fulfillment (runs in background)
      createShiprocketOrder(data).then(async (tracking_id) => {
        if (tracking_id) {
          await supabase.from('orders').update({ tracking_id }).eq('id', data.id);
        }
      }).catch(console.error);

      return NextResponse.json({ order: data });
    }

    // 2. Create Razorpay Backend Order for online payment
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(calculatedTotal * 100), // Razorpay requires paise
      currency: 'INR',
      receipt: order_number,
    });

    // 3. Pre-create the order in DB as "pending" with razorpay_order_id
    const { data: nxtOrder, error } = await supabase.from('orders').insert({
      order_number, user_id: user_id || 'guest', user_email, user_name,
      items, subtotal: calculatedSubtotal, shipping: calculatedShipping, total: calculatedTotal,
      status: 'pending', shipping_address: address, razorpay_order_id: rzpOrder.id
    }).select().single();

    if (error) throw error;

    return NextResponse.json({
      order_number,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      db_id: nxtOrder.id
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
