-- Add missing order status email templates

-- 1. Order Processing
INSERT INTO public.email_templates (template_key, template_name, subject_template, html_template, description, is_active)
VALUES
(
    'order_processing',
    'Order Processing',
    'Your khulnaCart order #{{order_number}} is being processed',
    '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: left; margin-bottom: 30px;">
      <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block;">
    </div>
    <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px;">Order Processing</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">We are now processing your order #{{order_number}}. We''ll let you know once it has been shipped.</p>
    
    <div style="background-color: #222; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; border-left: 4px solid #F59E0B;">
      আপনার অর্ডারটি প্রসেসিং করা হচ্ছে। শীঘ্রই এটি ডেলিভারির জন্য পাঠানো হবে। KhulnaCart-এর সাথে থাকার জন্য ধন্যবাদ!
    </div>

    <h2 style="color: #F59E0B; font-size: 20px; margin-bottom: 15px;">Order summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="border-bottom: 1px solid #333; text-align: left;">
          <th style="padding: 10px 0; color: #F59E0B;">Product</th>
          <th style="padding: 10px 0; color: #F59E0B; text-align: center;">Quantity</th>
          <th style="padding: 10px 0; color: #F59E0B; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        {{order_items}}
      </tbody>
      <tfoot>
        <tr style="font-size: 18px; font-weight: bold;">
          <td colspan="2" style="padding: 15px 0; text-align: left; color: #F59E0B;">Total:</td>
          <td style="padding: 15px 0; text-align: right; color: #F59E0B;">৳{{total}}</td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>',
    'Sent automatically when an order''s status changes to processing.',
    true
)
ON CONFLICT (template_key) DO NOTHING;

-- 2. Order Confirmed
INSERT INTO public.email_templates (template_key, template_name, subject_template, html_template, description, is_active)
VALUES
(
    'order_confirmed',
    'Order Confirmed',
    'Your khulnaCart order #{{order_number}} has been confirmed',
    '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: left; margin-bottom: 30px;">
      <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block;">
    </div>
    <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px;">Order Confirmed</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">Great news! Your order #{{order_number}} has been confirmed. We are preparing it for shipment.</p>
    
    <div style="background-color: #222; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; border-left: 4px solid #F59E0B;">
      আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে। আমরা দ্রুত এটি পাঠানোর ব্যবস্থা করছি।
    </div>

    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>',
    'Sent automatically when an order''s status changes to confirmed.',
    true
)
ON CONFLICT (template_key) DO NOTHING;

-- 3. Order Delivered
INSERT INTO public.email_templates (template_key, template_name, subject_template, html_template, description, is_active)
VALUES
(
    'order_delivered',
    'Order Delivered',
    'Your khulnaCart order #{{order_number}} has been delivered',
    '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: left; margin-bottom: 30px;">
      <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block;">
    </div>
    <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px;">Order Delivered</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">Your order #{{order_number}} has been delivered. We hope you enjoy your purchase!</p>
    
    <div style="background-color: #222; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; border-left: 4px solid #F59E0B;">
      আপনার অর্ডারটি সফলভাবে ডেলিভারি করা হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ!
    </div>

    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>',
    'Sent automatically when an order''s status changes to delivered.',
    true
)
ON CONFLICT (template_key) DO NOTHING;

-- 4. Order Cancelled
INSERT INTO public.email_templates (template_key, template_name, subject_template, html_template, description, is_active)
VALUES
(
    'order_cancelled',
    'Order Cancelled',
    'Update regarding your khulnaCart order #{{order_number}}',
    '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: left; margin-bottom: 30px;">
      <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block;">
    </div>
    <h1 style="color: #EF4444; font-size: 28px; font-weight: bold; margin-bottom: 10px;">Order Cancelled</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">Your order #{{order_number}} has been cancelled. If you have any questions, please contact our support team.</p>
    
    <div style="background-color: #222; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; border-left: 4px solid #EF4444;">
      আপনার অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।
    </div>

    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>',
    'Sent automatically when an order''s status changes to cancelled.',
    true
)
ON CONFLICT (template_key) DO NOTHING;
