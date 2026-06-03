-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_key text NOT NULL,
    template_name text NOT NULL,
    subject_template text NOT NULL,
    html_template text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_templates_pkey PRIMARY KEY (id),
    CONSTRAINT email_templates_template_key_key UNIQUE (template_key)
);

-- Enable RLS for email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates
CREATE POLICY "Admins can manage email templates" ON public.email_templates
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create trigger for updating updated_at on email_templates
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON public.email_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at();

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_email text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    template_key text,
    order_id uuid,
    status text NOT NULL,
    provider_response jsonb,
    error_message text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_logs_pkey PRIMARY KEY (id),
    CONSTRAINT email_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL
);

-- Enable RLS for email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email_logs
CREATE POLICY "Admins can view all email logs" ON public.email_logs
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Seed default templates
INSERT INTO public.email_templates (template_key, template_name, subject_template, html_template, description, is_active)
VALUES
(
    'welcome',
    'Welcome Email',
    'Welcome to {{site_name}}, {{customer_name}}!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to {{site_name}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Welcome, {{customer_name}}! 🎉</h1>
    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Thank you for registering at {{site_name}}.</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi {{customer_name}},</p>
    <p>We are absolutely thrilled to welcome you to our community! Your account has been successfully created.</p>
    <p>Here is what you can do next:</p>
    <ul style="padding-left: 20px; margin-bottom: 25px;">
      <li style="margin-bottom: 10px;">🛍️ <strong>Browse Products:</strong> Check out our latest arrivals and exclusive collections.</li>
      <li style="margin-bottom: 10px;">📋 <strong>Track Orders:</strong> Easily keep tabs on your current and past orders in your dashboard.</li>
      <li style="margin-bottom: 10px;">❤️ <strong>Wishlist:</strong> Save your favorite products to buy them later.</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{site_url}}/products" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">Start Shopping</a>
    </div>
    
    <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #777;">
      If you have any questions, feel free to reply to this email or contact our support team at {{support_phone}}.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
    <p>&copy; {{current_year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
    'Sent automatically to a new user after successful registration.',
    true
),
(
    'order_placed',
    'Order Confirmation',
    '🛒 Order Confirmed! - {{order_number}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 26px;">🛒 Thank You for Your Order!</h1>
    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">We''ve received order #{{order_number}}</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi {{customer_name}},</p>
    <p>Your order has been successfully placed. We are processing it and will let you know once it ships!</p>
    
    <h2 style="color: #444; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Shipping Details</h2>
    <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #666; width: 100px;"><strong>Recipient:</strong></td>
        <td style="padding: 6px 0;">{{customer_name}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666;"><strong>Phone:</strong></td>
        <td style="padding: 6px 0;">{{customer_phone}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666;"><strong>Address:</strong></td>
        <td style="padding: 6px 0;">{{customer_address}}</td>
      </tr>
    </table>

    <h2 style="color: #444; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Order Summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <thead>
        <tr style="background: #eee; text-align: left;">
          <th style="padding: 8px;">Product</th>
          <th style="padding: 8px; text-align: center;">Qty</th>
          <th style="padding: 8px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        {{order_items}}
      </tbody>
    </table>

    <table style="width: 100%; border-top: 1px solid #ddd; padding-top: 10px; font-size: 14px; text-align: right;">
      <tr>
        <td style="padding: 6px 0; color: #666;">Subtotal:</td>
        <td style="padding: 6px 0; font-weight: bold; width: 120px;">৳{{subtotal}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666;">Shipping:</td>
        <td style="padding: 6px 0; font-weight: bold;">৳{{shipping_cost}}</td>
      </tr>
      {{discount_row}}
      <tr style="font-size: 18px; font-weight: bold; color: #10B981;">
        <td style="padding: 10px 0; border-top: 2px solid #ddd;">Total:</td>
        <td style="padding: 10px 0; border-top: 2px solid #ddd;">৳{{total}}</td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 35px 0 20px;">
      <a href="{{site_url}}/my-account" style="background: #10B981; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">View Order History</a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
    <p>This is an automated receipt from your store. Need help? Contact us at {{support_phone}}.</p>
    <p>&copy; {{current_year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
    'Sent automatically to a customer immediately after successful checkout.',
    true
),
(
    'order_shipped',
    'Order Shipped',
    '🚚 Your Order #{{order_number}} has been Shipped!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Shipped</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 26px;">🚚 On Its Way!</h1>
    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Order #{{order_number}} is on the move</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi {{customer_name}},</p>
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #1e3a8a;"><strong>Tracking Information:</strong></p>
      <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #2563eb; font-family: monospace;">{{tracking_number}}</p>
    </div>

    <h2 style="color: #444; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Order Details</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <thead>
        <tr style="background: #eee; text-align: left;">
          <th style="padding: 8px;">Product</th>
          <th style="padding: 8px; text-align: center;">Qty</th>
          <th style="padding: 8px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        {{order_items}}
      </tbody>
    </table>

    <table style="width: 100%; border-top: 1px solid #ddd; padding-top: 10px; font-size: 14px; text-align: right;">
      <tr style="font-size: 16px; font-weight: bold;">
        <td style="padding: 6px 0;">Total Amount:</td>
        <td style="padding: 6px 0; width: 120px;">৳{{total}}</td>
      </tr>
    </table>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
    <p>Questions about delivery? Contact our customer support team at {{support_phone}}.</p>
    <p>&copy; {{current_year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
    'Sent automatically when an order''s status changes to shipped.',
    true
),
(
    'password_reset',
    'Reset Password',
    '🔑 Reset Your {{site_name}} Password',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 26px;">🔑 Reset Your Password</h1>
    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Need to recover your account credentials?</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi {{customer_name}},</p>
    <p>We received a request to reset the password for your {{site_name}} account. If you didn''t make this request, you can safely ignore this email.</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="{{reset_url}}" style="background: #EF4444; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">Reset My Password</a>
    </div>

    <p style="font-size: 14px; color: #666;">Alternatively, you can copy and paste the following link into your browser:</p>
    <p style="font-size: 12px; color: #3b82f6; word-break: break-all; background: #fff; padding: 10px; border: 1px dashed #ddd; border-radius: 4px; font-family: monospace;">{{reset_url}}</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
    <p>&copy; {{current_year}} {{site_name}}. All rights reserved.</p>
  </div>
</body>
</html>',
    'Sent automatically when a password recovery request is initiated.',
    true
)
ON CONFLICT (template_key) DO UPDATE
SET template_name = EXCLUDED.template_name,
    subject_template = EXCLUDED.subject_template,
    html_template = EXCLUDED.html_template,
    description = EXCLUDED.description;
