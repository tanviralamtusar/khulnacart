-- Professional Dark Gold Theme for Email Templates (Borders matching client's exact mockup)
-- 20260604162000_professional_gold_dark_email_templates.sql

-- 1. Welcome Email
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 20px; line-height: 1.2;">Welcome to khulnaCart</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6; color: #FBBF24;">Thanks for creating an account on khulnaCart. Here''s a copy of your user details.</p>
      
      <div style="border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 15px 0; margin-bottom: 25px;">
        <p style="font-size: 16px; margin: 0; color: #FBBF24;"><strong>Username:</strong> <span style="color: #F59E0B; font-weight: bold;">{{customer_name}}</span></p>
      </div>
      
      <p style="font-size: 14px; color: #aaaaaa; line-height: 1.6; margin-bottom: 20px;">You can access your account area to view orders, change your password, and more at: <a href="{{site_url}}/my-account" style="color: #F59E0B; text-decoration: none; font-weight: bold; border-bottom: 1px solid #F59E0B;">{{site_url}}/my-account</a></p>
      
      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'welcome';

-- 2. Order Placed
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px; line-height: 1.2;">Thank you for your order</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6; color: #FBBF24;">Just to let you know — we''ve received your order, and it is now being processed. Here''s a reminder of what you''ve ordered:</p>
      
      <div style="background-color: #111111; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; color: #FBBF24; border-left: 4px solid #F59E0B;">
        আপনার অর্ডারটি সফলভাবে নেওয়া হয়েছে। পণ্যটি ডেলিভারি পাওয়ার পর দয়া করে মূল টাকাটি ডেলিভারি রাইডারের কাছে বুঝিয়ে দিন। KhulnaCart-এর সাথে থাকার জন্য ধন্যবাদ!
      </div>

      <h2 style="color: #F59E0B; font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 10px;">Order summary</h2>
      <p style="font-size: 14px; margin-bottom: 20px; color: #FBBF24;">Order #{{order_number}} ({{current_date}})</p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="border-bottom: 1px solid #333; text-align: left;">
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold;">Product</th>
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold; text-align: center;">Quantity</th>
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{order_items}}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 15px 0 5px; text-align: left; color: #FBBF24; font-size: 14px;">Subtotal:</td>
            <td style="padding: 15px 0 5px; text-align: right; color: #FBBF24; font-size: 14px;">৳{{subtotal}}</td>
          </tr>
          {{discount_row}}
          <tr>
            <td colspan="2" style="padding: 5px 0; text-align: left; color: #FBBF24; font-size: 14px;">Shipping:</td>
            <td style="padding: 5px 0; text-align: right; color: #FBBF24; font-size: 14px;">৳49.00</td>
          </tr>
          <tr style="font-size: 18px; font-weight: bold;">
            <td colspan="2" style="padding: 15px 0; text-align: left; color: #F59E0B;">Total:</td>
            <td style="padding: 15px 0; text-align: right; color: #F59E0B;">৳{{total}}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 5px 0; text-align: left; color: #FBBF24; font-size: 14px;">Payment method:</td>
            <td style="padding: 5px 0; text-align: right; color: #FBBF24; font-size: 14px;">Cash on delivery</td>
          </tr>
        </tfoot>
      </table>

      <h2 style="color: #F59E0B; font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">Billing address</h2>
      <div style="background-color: #111111; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #FBBF24; border: 1px solid #333;">
        {{customer_name}}<br>
        {{customer_address}}<br>
        {{customer_phone}}<br>
        {{customer_email}}
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
        <p style="font-size: 15px; margin-bottom: 10px; color: #FBBF24;">Thanks again! If you need any help with your order, please contact us at <a href="mailto:khulnacart.info@gmail.com" style="color: #F59E0B; text-decoration: none; font-weight: bold; border-bottom: 1px solid #F59E0B;">khulnacart.info@gmail.com</a>.</p>
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'order_placed';

-- 3. Order Shipped
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px; line-height: 1.2;">Good things are heading your way!</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6; color: #FBBF24;">We have finished processing your order. Here''s a reminder of what you''ve ordered:</p>
      
      <div style="background-color: #111111; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; color: #FBBF24; border-left: 4px solid #F59E0B;">
        আপনার অর্ডারটি সফলভাবে নেওয়া হয়েছে। পণ্যটি ডেলিভারি পাওয়ার পর দয়া করে মূল টাকাটি ডেলিভারি রাইডারের কাছে বুঝিয়ে দিন। KhulnaCart-এর সাথে থাকার জন্য ধন্যবাদ!
      </div>

      <div style="background-color: #111111; border: 1px dashed #F59E0B; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 18px; text-align: center; color: #F59E0B; font-weight: bold;">
        Tracking Number: {{tracking_number}}
      </div>

      <h2 style="color: #F59E0B; font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 10px;">Order summary</h2>
      <p style="font-size: 14px; margin-bottom: 20px; color: #FBBF24;">Order #{{order_number}} ({{current_date}})</p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="border-bottom: 1px solid #333; text-align: left;">
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold;">Product</th>
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold; text-align: center;">Quantity</th>
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold; text-align: right;">Price</th>
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
        <p style="font-size: 15px; margin-bottom: 10px; color: #FBBF24;">Thanks again! If you need any help with your order, please contact us at <a href="mailto:khulnacart.info@gmail.com" style="color: #F59E0B; text-decoration: none; font-weight: bold; border-bottom: 1px solid #F59E0B;">khulnacart.info@gmail.com</a>.</p>
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'order_shipped';

-- 4. Password Reset
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 20px; line-height: 1.2;">Reset Your Password</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.6; color: #FBBF24;">We received a request to reset your khulnaCart password. Click the button below to set a new password:</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{reset_url}}" style="background-color: #F59E0B; color: #121212; padding: 15px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">Reset Password</a>
      </div>

      <p style="font-size: 14px; color: #aaaaaa; line-height: 1.6;">If you didn''t request a password reset, you can safely ignore this email.</p>
      
      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'password_reset';

-- 5. Order Processing
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px; line-height: 1.2;">Order Processing</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6; color: #FBBF24;">We are now processing your order #{{order_number}}. We''ll let you know once it has been shipped.</p>
      
      <div style="background-color: #111111; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; color: #FBBF24; border-left: 4px solid #F59E0B;">
        আপনার অর্ডারটি প্রসেসিং করা হচ্ছে। শীঘ্রই এটি ডেলিভারির জন্য পাঠানো হবে। KhulnaCart-এর সাথে থাকার জন্য ধন্যবাদ!
      </div>

      <h2 style="color: #F59E0B; font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 10px;">Order summary</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="border-bottom: 1px solid #333; text-align: left;">
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold;">Product</th>
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold; text-align: center;">Quantity</th>
            <th style="padding: 10px 0; color: #F59E0B; font-size: 14px; font-weight: bold; text-align: right;">Price</th>
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
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'order_processing';

-- 6. Order Confirmed
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px; line-height: 1.2;">Order Confirmed</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6; color: #FBBF24;">Great news! Your order #{{order_number}} has been confirmed. We are preparing it for shipment.</p>
      
      <div style="background-color: #111111; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; color: #FBBF24; border-left: 4px solid #F59E0B;">
        আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে। আমরা দ্রুত এটি পাঠানোর ব্যবস্থা করছি। KhulnaCart-এর সাথে থাকার জন্য ধন্যবাদ!
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'order_confirmed';

-- 7. Order Delivered
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px; line-height: 1.2;">Order Delivered</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6; color: #FBBF24;">Your order #{{order_number}} has been delivered. We hope you enjoy your purchase!</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="{{site_url}}/order/{{order_number}}/review" style="background-color: #F59E0B; color: #121212; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">Leave a Review</a>
      </div>
      
      <div style="background-color: #111111; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; color: #FBBF24; border-left: 4px solid #F59E0B;">
        আপনার অর্ডারটি সফলভাবে ডেলিভারি করা হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ!
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'order_delivered';

-- 8. Order Cancelled
UPDATE public.email_templates
SET html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #F59E0B; border-radius: 16px; padding: 24px 8px 8px 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #000000; border-radius: 12px; padding: 40px 20px; color: #FBBF24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="{{site_logo}}" alt="khulnaCart" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
      <h1 style="color: #EF4444; font-size: 28px; font-weight: bold; margin-bottom: 10px; line-height: 1.2;">Order Cancelled</h1>
      <p style="font-size: 16px; margin-bottom: 15px; color: #FBBF24;">Hi {{customer_name}},</p>
      <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6; color: #FBBF24;">Your order #{{order_number}} has been cancelled. If you have any questions, please contact our support team.</p>
      
      <div style="background-color: #111111; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; color: #FBBF24; border-left: 4px solid #EF4444;">
        আপনার অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
        <p style="font-size: 12px; color: #666; margin: 0;">© {{current_year}} khulnaCart. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>'
WHERE template_key = 'order_cancelled';
