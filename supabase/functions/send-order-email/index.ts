import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import nodemailer from "npm:nodemailer@6.9.15";

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
  template_key?: string;
  recipient?: string;
  variables?: Record<string, string>;
  is_test_send?: boolean;
  test_recipient?: string;
  test_subject?: string;
  test_body?: string;
  customer_email?: string | null;
}

async function sendViaResend(
  resend: Resend,
  from: string,
  to: string[],
  subject: string,
  html: string
) {
  return await resend.emails.send({ from, to, subject, html });
}

async function sendViaGmail(
  gmailUser: string,
  gmailPass: string,
  fromName: string,
  to: string[],
  subject: string,
  html: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  return await transporter.sendMail({
    from: `"${fromName}" <${gmailUser}>`,
    to: to.join(", "),
    subject,
    html,
  });
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
        "email_provider",
        "resend_api_key",
        "gmail_address",
        "gmail_app_password",
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
      email_provider: "resend",
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

    const provider = settingsMap.email_provider || "resend";
    const emailEnabled = settingsMap.email_enabled === "true";
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

      console.log(`Sending test email via ${provider} to: ${testRecipient}`);
      const htmlContent = testBody.includes("<") ? testBody : `<div style="font-family: Arial; padding: 20px;">${testBody.replace(/\n/g, "<br>")}</div>`;

      let emailResponse;
      if (provider === "gmail") {
        const gmailUser = settingsMap.gmail_address;
        const gmailPass = settingsMap.gmail_app_password;
        if (!gmailUser || !gmailPass) {
          return new Response(JSON.stringify({ success: false, message: "Gmail credentials not configured" }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        emailResponse = await sendViaGmail(gmailUser, gmailPass, settingsMap.email_sender_name, [testRecipient], testSubject, htmlContent);
      } else {
        const resendApiKey = settingsMap.resend_api_key;
        if (!resendApiKey) {
          return new Response(JSON.stringify({ success: false, message: "Resend API key not configured" }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const resend = new Resend(resendApiKey);
        const from = `${settingsMap.email_sender_name} <${settingsMap.email_sender_address}>`;
        emailResponse = await sendViaResend(resend, from, [testRecipient], testSubject, htmlContent);
      }

      await supabase.from("email_logs").insert({
        recipient_email: testRecipient,
        subject: testSubject,
        body: testBody,
        status: "sent",
        provider_response: emailResponse,
      });

      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isLegacyOrderNotification = !body.template_key && body.order_number && settingsMap.order_notification_enabled === "true";

    // 2. Send Admin Alert if enabled
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

        if (provider === "gmail") {
          const gmailUser = settingsMap.gmail_address;
          const gmailPass = settingsMap.gmail_app_password;
          if (gmailUser && gmailPass) {
            await sendViaGmail(gmailUser, gmailPass, settingsMap.email_sender_name, [settingsMap.notification_email], `🔔 New Order #${body.order_number} - ৳${(body.total || 0).toFixed(2)}`, adminEmailHtml);
          }
        } else {
          const resendApiKey = settingsMap.resend_api_key;
          if (resendApiKey) {
            const resend = new Resend(resendApiKey);
            await sendViaResend(resend, `Store Alerts <${settingsMap.email_sender_address}>`, [settingsMap.notification_email], `🔔 New Order #${body.order_number} - ৳${(body.total || 0).toFixed(2)}`, adminEmailHtml);
          }
        }
      } catch (ownerNotifError) {
        console.error("Failed to send owner notification email:", ownerNotifError);
      }
    }

    // 3. Send Customer Email
    if (!emailEnabled) {
      console.log("Customer email automations are globally disabled.");
      return new Response(JSON.stringify({ success: true, message: "Admin alert sent. Customer emails disabled." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let templateKey = body.template_key;
    const recipient = body.recipient || body.customer_email;

    if (!recipient) {
      console.log("No recipient email provided. Exiting.");
      return new Response(JSON.stringify({ success: true, message: "No recipient provided. Skipping customer email." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify auto-send rules
    if (templateKey === "welcome" && settingsMap.email_auto_send_welcome !== "true") {
      return new Response(JSON.stringify({ success: true, message: "Welcome email auto-send disabled." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (templateKey === "order_placed" && settingsMap.email_auto_send_order_placed !== "true") {
      return new Response(JSON.stringify({ success: true, message: "Order placed receipt auto-send disabled." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (templateKey?.startsWith("order_") && templateKey !== "order_placed" && settingsMap.email_auto_send_status_change !== "true") {
      return new Response(JSON.stringify({ success: true, message: "Order status change email auto-send disabled." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!templateKey) {
      return new Response(JSON.stringify({ success: false, message: "template_key is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Construct variables
    const vars: Record<string, string> = {
      site_name: settingsMap.email_sender_name || "Khulna Cart",
      site_url: supabaseUrl.replace("kphkbmwycreriandedis", "khulnacart"),
      support_phone: "+880 1234-567890",
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString('en-GB'),
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

    if (body.items && body.items.length > 0) {
      vars["order_items"] = body.items.map(item => `
        <tr style="border-bottom: 1px solid #333;">
          <td style="padding: 15px 0; text-align: left;">
            <div style="display: flex; align-items: center;">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;">` : ""}
              <span style="font-size: 14px; color: #ffffff;">${item.name}</span>
            </div>
          </td>
          <td style="padding: 15px 0; text-align: center; color: #ffffff;">
            ×${item.quantity}
          </td>
          <td style="padding: 15px 0; text-align: right; color: #ffffff; font-weight: bold;">
            ৳${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `).join("");
    } else {
      vars["order_items"] = "";
    }

    if (body.variables?.discount && parseFloat(body.variables.discount) > 0) {
      vars["discount_row"] = `
        <tr>
          <td colspan="2" style="padding: 5px 0; text-align: left; color: #aaaaaa;">Discount:</td>
          <td style="padding: 5px 0; text-align: right; color: #EF4444;">-৳${parseFloat(body.variables.discount).toFixed(2)}</td>
        </tr>
      `;
    } else {
      vars["discount_row"] = "";
    }

    let subject = template.subject_template;
    let bodyHtml = template.html_template;

    for (const [key, val] of Object.entries(vars)) {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(placeholder, val);
      bodyHtml = bodyHtml.replace(placeholder, val);
    }

    console.log(`Sending email via ${provider} to: ${recipient} with template: ${templateKey}`);

    let emailResponse;
    if (provider === "gmail") {
      const gmailUser = settingsMap.gmail_address;
      const gmailPass = settingsMap.gmail_app_password;
      if (!gmailUser || !gmailPass) {
        throw new Error("Gmail credentials not configured");
      }
      emailResponse = await sendViaGmail(gmailUser, gmailPass, settingsMap.email_sender_name, [recipient], subject, bodyHtml);
    } else {
      const resendApiKey = settingsMap.resend_api_key;
      if (!resendApiKey) {
        throw new Error("Resend API key not configured");
      }
      const resend = new Resend(resendApiKey);
      const from = `${settingsMap.email_sender_name} <${settingsMap.email_sender_address}>`;
      emailResponse = await sendViaResend(resend, from, [recipient], subject, bodyHtml);
    }

    console.log("Email dispatch completed:", JSON.stringify(emailResponse));

    await supabase.from("email_logs").insert({
      recipient_email: recipient,
      subject: subject,
      body: bodyHtml,
      template_key: templateKey,
      order_id: body.order_id || null,
      status: "sent",
      provider_response: emailResponse,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("send-order-email error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});