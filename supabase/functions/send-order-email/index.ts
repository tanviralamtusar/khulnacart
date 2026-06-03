import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
}

interface OrderEmailRequest {
  // Original legacy properties (kept for backwards compatibility)
  order_id?: string;
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal?: number;
  shipping_cost?: number;
  total?: number;
  items?: Array<OrderItem>;
  notes?: string | null;

  // New automation properties
  template_key?: string;      // e.g. 'welcome', 'order_placed', 'order_shipped', etc.
  recipient?: string;         // Customer email
  variables?: Record<string, string>; // Dynamic variables mapping

  // Test send properties
  is_test_send?: boolean;
  test_recipient?: string;
  test_subject?: string;
  test_body?: string;

  // Added dynamically from place-order or other flows
  customer_email?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase configuration");
      return new Response(JSON.stringify({ success: false, message: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Fetch email settings from admin_settings
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", [
        "resend_api_key",
        "notification_email",
        "order_notification_enabled",
        "email_sender_name",
        "email_sender_address",
        "email_enabled",
        "email_auto_send_welcome",
        "email_auto_send_order_placed",
        "email_auto_send_status_change",
      ]);

    const settingsMap: Record<string, string> = {
      email_sender_name: "Khulna Cart",
      email_sender_address: "onboarding@resend.dev",
      email_enabled: "true",
      email_auto_send_welcome: "true",
      email_auto_send_order_placed: "true",
      email_auto_send_status_change: "true",
    };

    settings?.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });

    const resendApiKey = settingsMap.resend_api_key;
    if (!resendApiKey) {
      console.log("Missing Resend API key");
      return new Response(JSON.stringify({ success: false, message: "Email API not configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const body: OrderEmailRequest = await req.json();

    // 1. Handle Test Send from Admin UI
    if (body.is_test_send) {
      const testRecipient = body.test_recipient;
      const testSubject = body.test_subject || "Test Email from Khulna Cart";
      const testBody = body.test_body || "This is a test message to confirm your email integration is working.";

      if (!testRecipient) {
        return new Response(JSON.stringify({ success: false, message: "Recipient is required for test send" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Sending test email to: ${testRecipient}`);

      const emailResponse = await resend.emails.send({
        from: `${settingsMap.email_sender_name} <${settingsMap.email_sender_address}>`,
        to: [testRecipient],
        subject: testSubject,
        html: testBody.includes("<") ? testBody : `<div style="font-family: Arial; padding: 20px;">${testBody.replace(/\n/g, "<br>")}</div>`,
      });

      // Log the test send
      await supabase.from("email_logs").insert({
        recipient_email: testRecipient,
        subject: testSubject,
        body: testBody,
        status: "sent",
        provider_response: emailResponse,
      });

      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine the template key and recipient
    let templateKey = body.template_key;
    let recipient = body.recipient || body.customer_email;
    let orderId = body.order_id || null;

    // Detect legacy place-order webhook payload (no template_key, but contains order details)
    const isLegacyOrderNotification = !templateKey && body.order_number && settingsMap.order_notification_enabled === "true";

    if (isLegacyOrderNotification) {
      console.log("Handling legacy order notification to owner and customer...");
      templateKey = "order_placed";
    }

    // 2. Send Admin Alert if a new order comes in and admin alerts are enabled
    if (isLegacyOrderNotification && settingsMap.order_notification_enabled === "true" && settingsMap.notification_email) {
      try {
        console.log(`Sending new order notification to store owner: ${settingsMap.notification_email}`);
        
        const itemsHtml = (body.items || []).map(item => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">৳${(item.price || 0).toFixed(2)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">৳${((item.price || 0) * item.quantity).toFixed(2)}</td>
          </tr>
        `).join("");

        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🔔 New Order Received!</h1>
              <p style="margin: 5px 0 0; opacity: 0.9;">Order #${body.order_number}</p>
            </div>
            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
              <h2>Customer Details</h2>
              <p><strong>Name:</strong> ${body.customer_name}<br><strong>Phone:</strong> ${body.customer_phone}<br><strong>Address:</strong> ${body.customer_address}</p>
              ${body.notes ? `<p><strong>Customer Notes:</strong> ${body.notes}</p>` : ""}
              <h2>Order Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #eee;"><th style="padding: 8px; text-align: left;">Product</th><th style="padding: 8px; text-align: center;">Qty</th><th style="padding: 8px; text-align: right;">Price</th><th style="padding: 8px; text-align: right;">Total</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <p style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 15px;">Total: ৳${(body.total || 0).toFixed(2)}</p>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: `Store Alerts <${settingsMap.email_sender_address}>`,
          to: [settingsMap.notification_email],
          subject: `🔔 New Order #${body.order_number} - ৳${(body.total || 0).toFixed(2)}`,
          html: adminEmailHtml,
        });
      } catch (ownerNotifError) {
        console.error("Failed to send owner notification email:", ownerNotifError);
      }
    }

    // 3. Send Customer Email if template and recipient are configured
    if (!settingsMap.email_enabled || settingsMap.email_enabled !== "true") {
      console.log("Customer email automations are globally disabled.");
      return new Response(JSON.stringify({ success: true, message: "Admin alert sent. Customer emails disabled." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip if no recipient email is available
    if (!recipient) {
      console.log("No recipient email provided for template send. Exiting.");
      return new Response(JSON.stringify({ success: true, message: "No recipient provided. Skipping customer email." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify auto-send rules
    if (templateKey === "welcome" && settingsMap.email_auto_send_welcome !== "true") {
      console.log("Welcome emails auto-send is disabled.");
      return new Response(JSON.stringify({ success: true, message: "Welcome email auto-send disabled." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (templateKey === "order_placed" && settingsMap.email_auto_send_order_placed !== "true") {
      console.log("Order confirmation receipts auto-send is disabled.");
      return new Response(JSON.stringify({ success: true, message: "Order placed receipt auto-send disabled." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (templateKey?.startsWith("order_") && templateKey !== "order_placed" && settingsMap.email_auto_send_status_change !== "true") {
      console.log(`Order status change email auto-send is disabled for key: ${templateKey}`);
      return new Response(JSON.stringify({ success: true, message: "Order status change email auto-send disabled." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!templateKey) {
      return new Response(JSON.stringify({ success: false, message: "template_key is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the email template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_key", templateKey)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      console.log(`No active email template found for key: ${templateKey}`);
      return new Response(JSON.stringify({ success: false, message: `Active template not found for key: ${templateKey}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Construct the context variables dictionary
    const vars: Record<string, string> = {
      site_name: settingsMap.email_sender_name || "Khulna Cart",
      site_url: supabaseUrl.replace("kphkbmwycreriandedis", "khulnacart"), // fallback/best-effort
      support_phone: "+880 1234-567890",
      current_year: new Date().getFullYear().toString(),
      customer_name: body.customer_name || "Customer",
      customer_phone: body.customer_phone || "",
      customer_address: body.customer_address || "",
      order_number: body.order_number || "",
      subtotal: body.subtotal ? body.subtotal.toFixed(2) : "",
      shipping_cost: body.shipping_cost ? body.shipping_cost.toFixed(2) : "",
      total: body.total ? body.total.toFixed(2) : "",
      tracking_number: "",
      reset_url: "",
      ...(body.variables || {}),
    };

    // If order details are provided, compile order items table
    if (body.items && body.items.length > 0) {
      const itemsHtml = body.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">
            ${item.name}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ৳${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `).join("");
      vars["order_items"] = itemsHtml;
    } else {
      vars["order_items"] = "";
    }

    vars["discount_row"] = ""; // Optional discount placeholder row

    // Interpolate subject and html body
    let subject = template.subject_template;
    let bodyHtml = template.html_template;

    for (const [key, val] of Object.entries(vars)) {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(placeholder, val);
      bodyHtml = bodyHtml.replace(placeholder, val);
    }

    console.log(`Sending email to: ${recipient} with template: ${templateKey}`);

    const emailResponse = await resend.emails.send({
      from: `${settingsMap.email_sender_name} <${settingsMap.email_sender_address}>`,
      to: [recipient],
      subject: subject,
      html: bodyHtml,
    });

    console.log("Email dispatch completed:", JSON.stringify(emailResponse));

    // Log the transaction
    await supabase.from("email_logs").insert({
      recipient_email: recipient,
      subject: subject,
      body: bodyHtml,
      template_key: templateKey,
      order_id: orderId,
      status: "sent",
      provider_response: emailResponse,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("send-order-email error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});