-- Update email templates to match the high-fidelity dark mode design from the images

-- 1. Welcome Email
UPDATE public.email_templates
SET subject_template = 'Your khulnaCart account has been created!',
    html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #F59E0B; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; line-height: 80px; text-align: center;">
        <span style="color: #000000; font-size: 40px; font-weight: bold; font-family: serif;">kC</span>
      </div>
    </div>
    <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 20px;">Welcome to khulnaCart</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5;">Thanks for creating an account on khulnaCart. Here''s a copy of your user details.</p>
    <div style="border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 20px 0; margin-bottom: 30px;">
      <p style="font-size: 16px; margin: 0;"><strong>Username:</strong> {{customer_name}}</p>
    </div>
    <p style="font-size: 14px; color: #aaaaaa; line-height: 1.5;">You can access your account area to view orders, change your password, and more at: <a href="{{site_url}}/my-account" style="color: #F59E0B; text-decoration: none;">{{site_url}}/my-account</a></p>
    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>'
WHERE template_key = 'welcome';

-- 2. Order Confirmation
UPDATE public.email_templates
SET subject_template = 'Your khulnaCart order has been received!',
    html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #F59E0B; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; line-height: 80px; text-align: center;">
        <span style="color: #000000; font-size: 40px; font-weight: bold; font-family: serif;">kC</span>
      </div>
    </div>
    <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px;">Thank you for your order</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">Just to let you know — we''ve received your order, and it is now being processed. Here''s a reminder of what you''ve ordered:</p>
    
    <div style="background-color: #222; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; border-left: 4px solid #F59E0B;">
      আপনার অর্ডারটি সফলভাবে নেওয়া হয়েছে। পণ্যটি ডেলিভারি পাওয়ার পর দয়া করে মূল টাকাটি ডেলিভারি রাইডারের কাছে বুঝিয়ে দিন। KhulnaCart-এর সাথে থাকার জন্য ধন্যবাদ!
    </div>

    <h2 style="color: #F59E0B; font-size: 20px; margin-bottom: 15px;">Order summary</h2>
    <p style="font-size: 14px; margin-bottom: 20px; color: #aaaaaa;">Order #{{order_number}} ({{current_date}})</p>

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
        <tr>
          <td colspan="2" style="padding: 20px 0 5px; text-align: left; color: #aaaaaa;">Subtotal:</td>
          <td style="padding: 20px 0 5px; text-align: right;">৳{{subtotal}}</td>
        </tr>
        {{discount_row}}
        <tr>
          <td colspan="2" style="padding: 5px 0; text-align: left; color: #aaaaaa;">Shipping:</td>
          <td style="padding: 5px 0; text-align: right;">৳{{shipping_cost}}</td>
        </tr>
        <tr style="font-size: 18px; font-weight: bold;">
          <td colspan="2" style="padding: 15px 0; text-align: left; color: #F59E0B;">Total:</td>
          <td style="padding: 15px 0; text-align: right; color: #F59E0B;">৳{{total}}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 5px 0; text-align: left; color: #aaaaaa;">Payment method:</td>
          <td style="padding: 5px 0; text-align: right;">Cash on delivery</td>
        </tr>
      </tfoot>
    </table>

    <h2 style="color: #F59E0B; font-size: 20px; margin-bottom: 15px;">Billing address</h2>
    <div style="background-color: #222; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #dddddd;">
      {{customer_name}}<br>
      {{customer_address}}<br>
      {{customer_phone}}<br>
      {{customer_email}}
    </div>

    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
      <p style="font-size: 16px; margin-bottom: 10px;">Thanks again! If you need any help with your order, please contact us at <a href="mailto:khulnacart.info@gmail.com" style="color: #F59E0B; text-decoration: none;">khulnacart.info@gmail.com</a>.</p>
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>'
WHERE template_key = 'order_placed';

-- 3. Order Shipped
UPDATE public.email_templates
SET subject_template = 'Good things are heading your way!',
    html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #F59E0B; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; line-height: 80px; text-align: center;">
        <span style="color: #000000; font-size: 40px; font-weight: bold; font-family: serif;">kC</span>
      </div>
    </div>
    <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 10px;">Good things are heading your way!</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">We have finished processing your order and it has been shipped. Here''s a reminder of what you''ve ordered:</p>
    
    <div style="background-color: #222; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 18px; text-align: center; border: 1px dashed #F59E0B; color: #F59E0B;">
      <strong>Tracking Number:</strong> {{tracking_number}}
    </div>

    <h2 style="color: #F59E0B; font-size: 20px; margin-bottom: 15px;">Order summary</h2>
    <p style="font-size: 14px; margin-bottom: 20px; color: #aaaaaa;">Order #{{order_number}} ({{current_date}})</p>

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
      <p style="font-size: 16px; margin-bottom: 10px;">Thanks again! If you need any help with your order, please contact us at <a href="mailto:khulnacart.info@gmail.com" style="color: #F59E0B; text-decoration: none;">khulnacart.info@gmail.com</a>.</p>
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>'
WHERE template_key = 'order_shipped';

-- 4. Password Reset
UPDATE public.email_templates
SET subject_template = 'Reset your khulnaCart password',
    html_template = '<div style="background-color: #111111; padding: 20px; font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-left: 8px solid #F59E0B; border-right: 8px solid #F59E0B; padding: 40px 20px; color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #F59E0B; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; line-height: 80px; text-align: center;">
        <span style="color: #000000; font-size: 40px; font-weight: bold; font-family: serif;">kC</span>
      </div>
    </div>
    <h1 style="color: #F59E0B; font-size: 28px; font-weight: bold; margin-bottom: 20px;">Reset Your Password</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">Hi {{customer_name}},</p>
    <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5;">We received a request to reset your khulnaCart password. Click the button below to set a new password:</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{reset_url}}" style="background-color: #F59E0B; color: #000000; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block;">Reset Password</a>
    </div>

    <p style="font-size: 14px; color: #aaaaaa; line-height: 1.5;">If you didn''t request a password reset, you can safely ignore this email.</p>
    
    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
      <p style="font-size: 12px; color: #666;">© {{current_year}} khulnaCart. All rights reserved.</p>
    </div>
  </div>
</div>'
WHERE template_key = 'password_reset';
