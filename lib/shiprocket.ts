import { Order } from './types';

// In-memory cache for token to avoid logging in for every request
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials missing. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env');
  }

  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error('Shiprocket auth failed');
  }

  const data = await res.json();
  cachedToken = data.token;
  // Token usually valid for 10 days, but we cache for 24 hours to be safe
  tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  return data.token;
}

export async function createShiprocketOrder(order: Order): Promise<string | null> {
  try {
    const token = await getShiprocketToken();

    const orderItems = order.items.map(i => ({
      name: i.product.name,
      sku: i.product.id.substring(0, 8),
      units: i.quantity,
      selling_price: i.product.price, // or discount_price
    }));

    const payload = {
      order_id: order.order_number,
      order_date: new Date().toISOString(),
      pickup_location: "Primary", // Requires a pickup location configured in Shiprocket dashboard
      billing_customer_name: order.shipping_address.name,
      billing_last_name: "",
      billing_address: order.shipping_address.line1,
      billing_address_2: order.shipping_address.line2 || "",
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.pincode,
      billing_state: order.shipping_address.state,
      billing_country: "India",
      billing_email: order.user_email,
      billing_phone: order.shipping_address.phone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.status === 'paid' ? 'Prepaid' : 'COD',
      sub_total: order.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/ad-hoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Shiprocket order creation failed:', data);
      return null;
    }

    return data.shipment_id?.toString() || null;
  } catch (error) {
    console.error('Shiprocket error:', error);
    return null;
  }
}
