import { NextRequest, NextResponse } from 'next/server';

// POST /api/send-order-email
// Sends order confirmation email to admin and customer using Resend
export async function POST(request: NextRequest) {
  try {
    const { order, adminEmail } = await request.json();

    if (!order || !adminEmail) {
      return NextResponse.json({ error: 'Missing order or adminEmail' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — skipping email');
      return NextResponse.json({ skipped: true, reason: 'No API key' });
    }

    const itemsHtml = order.items.map((item: { product: { name: string; price: number }; quantity: number }) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333">${item.product.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;color:#333">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;color:#333">₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    ).join('');

    const addr = order.shipping_address;
    const addressHtml = `${addr.name}<br>${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}<br>${addr.city}, ${addr.state} — ${addr.pincode}<br>📞 ${addr.phone}`;

    const emailHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0a0a1a,#1a1a3a);padding:28px 24px;text-align:center">
        <h1 style="margin:0;font-size:22px;color:#00D4FF;letter-spacing:1px">⚡ NEXLETRONICS</h1>
        <p style="margin:6px 0 0;color:#8892B0;font-size:13px">Order Confirmation</p>
      </div>

      <!-- Order Info -->
      <div style="padding:24px">
        <div style="background:#f8f9fc;border-radius:8px;padding:16px;margin-bottom:20px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="color:#666;font-size:13px;padding:4px 0">Order Number</td>
              <td style="text-align:right;font-weight:700;color:#0a0a1a;font-size:14px">${order.order_number}</td>
            </tr>
            <tr>
              <td style="color:#666;font-size:13px;padding:4px 0">Status</td>
              <td style="text-align:right;font-weight:600;color:#00B37E;font-size:13px;text-transform:uppercase">${order.status}</td>
            </tr>
            <tr>
              <td style="color:#666;font-size:13px;padding:4px 0">Customer</td>
              <td style="text-align:right;color:#333;font-size:13px">${order.user_name} (${order.user_email})</td>
            </tr>
            ${order.payment_id ? `<tr>
              <td style="color:#666;font-size:13px;padding:4px 0">Payment ID</td>
              <td style="text-align:right;color:#333;font-size:13px">${order.payment_id}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Items -->
        <h3 style="font-size:15px;color:#0a0a1a;margin:0 0 12px">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr style="background:#f0f2f5">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#666;font-weight:600;text-transform:uppercase">Product</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#666;font-weight:600;text-transform:uppercase">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#666;font-weight:600;text-transform:uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="background:#f8f9fc;border-radius:8px;padding:14px 16px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="color:#666;font-size:13px">Subtotal</span>
            <span style="color:#333;font-size:13px">₹${order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#666;font-size:13px">Shipping</span>
            <span style="color:#333;font-size:13px">${order.shipping === 0 ? 'FREE' : '₹' + order.shipping.toLocaleString('en-IN')}</span>
          </div>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0">
          <div style="display:flex;justify-content:space-between">
            <span style="font-weight:700;color:#0a0a1a;font-size:16px">Total</span>
            <span style="font-weight:700;color:#00D4FF;font-size:16px">₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Shipping Address -->
        <h3 style="font-size:15px;color:#0a0a1a;margin:0 0 8px">📦 Shipping To</h3>
        <div style="background:#f8f9fc;border-radius:8px;padding:14px 16px;font-size:13px;color:#555;line-height:1.7">
          ${addressHtml}
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f0f2f5;padding:16px 24px;text-align:center;border-top:1px solid #e5e5e5">
        <p style="margin:0;font-size:12px;color:#999">Thank you for shopping with Nexletronics! ⚡</p>
      </div>
    </div>`;

    // Send to admin
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Nexletronics <orders@nexletronics.in>',
        to: [adminEmail],
        subject: `🛒 New Order ${order.order_number} — ₹${order.total.toLocaleString('en-IN')}`,
        html: emailHtml,
      }),
    });

    // Send to customer
    if (order.user_email && !order.user_email.includes('@guest.')) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Nexletronics <orders@nexletronics.in>',
          to: [order.user_email],
          subject: `Order Confirmed! ${order.order_number} ⚡`,
          html: emailHtml,
        }),
      });
    }

    const result = await adminRes.json();
    return NextResponse.json({ sent: true, result });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
