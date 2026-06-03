import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Settings, History, Send, RefreshCw, Save, Pencil, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject_template: string;
  html_template: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  template_key: string | null;
  order_id: string | null;
  status: string;
  provider_response: any;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

interface EmailSettings {
  email_provider: string;
  resend_api_key: string;
  gmail_address: string;
  gmail_app_password: string;
  notification_email: string;
  order_notification_enabled: string;
  email_sender_name: string;
  email_sender_address: string;
  email_enabled: string;
  email_auto_send_welcome: string;
  email_auto_send_order_placed: string;
  email_auto_send_status_change: string;
}

const TEMPLATE_VARIABLES = [
  { key: "customer_name", description: "Customer full name" },
  { key: "order_number", description: "Order number (e.g., ORD-20241223-0001)" },
  { key: "total", description: "Order total amount (e.g., 2500)" },
  { key: "subtotal", description: "Order subtotal amount" },
  { key: "shipping_cost", description: "Shipping cost amount" },
  { key: "customer_phone", description: "Customer phone number" },
  { key: "customer_address", description: "Full shipping address" },
  { key: "tracking_number", description: "Delivery tracking number" },
  { key: "site_name", description: "Your store name" },
  { key: "site_url", description: "Store domain URL" },
  { key: "support_phone", description: "Store support contact number" },
];

export default function AdminEmail() {
  const [activeTab, setActiveTab] = useState("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<EmailSettings>({
    email_provider: "resend",
    resend_api_key: "",
    gmail_address: "",
    gmail_app_password: "",
    notification_email: "",
    order_notification_enabled: "false",
    email_sender_name: "Khulna Cart",
    email_sender_address: "onboarding@resend.dev",
    email_enabled: "false",
    email_auto_send_welcome: "true",
    email_auto_send_order_placed: "true",
    email_auto_send_status_change: "true",
  });
  
  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedHtml, setEditedHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  
  // Logs state
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  // Test Email state
  const [testTo, setTestTo] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testBody, setTestBody] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadSettings();
    loadTemplates();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      const newSettings: any = { ...settings };
      data?.forEach((item) => {
        newSettings[item.key] = item.value;
      });
      setSettings(newSettings);
    } catch (error) {
      console.error("Error loading email settings:", error);
      toast.error("Failed to load email settings");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_key");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load email templates");
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Failed to load email logs");
    } finally {
      setLogsLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from("admin_settings")
          .upsert({ key, value }, { onConflict: "key" });

        if (error) throw error;
      }
      toast.success("Email settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const openEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditedSubject(template.subject_template);
    setEditedHtml(template.html_template);
  };

  const updateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject_template: editedSubject,
          html_template: editedHtml,
        })
        .eq("id", editingTemplate.id);

      if (error) throw error;
      
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, subject_template: editedSubject, html_template: editedHtml } 
          : t
      ));
      setEditingTemplate(null);
      toast.success("Email template updated successfully");
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  const toggleTemplateActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      
      setTemplates(templates.map(t => 
        t.id === id ? { ...t, is_active: isActive } : t
      ));
      toast.success(`Template ${isActive ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling template:", error);
      toast.error("Failed to update template");
    }
  };

  const showHtmlPreview = (html: string) => {
    // Replace standard variables with mock data for realistic preview
    let preview = html
      .replace(/{{customer_name}}/g, "John Doe")
      .replace(/{{order_number}}/g, "ORD-20260603-0012")
      .replace(/{{subtotal}}/g, "1,500.00")
      .replace(/{{shipping_cost}}/g, "120.00")
      .replace(/{{total}}/g, "1,620.00")
      .replace(/{{customer_phone}}/g, "01712345678")
      .replace(/{{customer_address}}/g, "House 12, Road 5, Khulna")
      .replace(/{{tracking_number}}/g, "STEAD-987654321")
      .replace(/{{site_name}}/g, settings.email_sender_name || "Khulna Cart")
      .replace(/{{site_url}}/g, "https://khulnacart.com")
      .replace(/{{site_logo}}/g, "https://ahgwjwhaegwtvczqthrh.supabase.co/storage/v1/object/public/shop-assets/email.png")
      .replace(/{{support_phone}}/g, "+880 1234-567890")
      .replace(/{{current_year}}/g, "2026")
      .replace(/{{current_date}}/g, new Date().toLocaleDateString('en-GB'))
      .replace(/{{reset_url}}/g, "https://khulnacart.com/reset-password?token=mock_token")
      .replace(/{{order_items}}/g, `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">Premium Cotton Saree (Blue)</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">1</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">৳1,500.00</td>
        </tr>
      `)
      .replace(/{{discount_row}}/g, "");

    setPreviewHtml(preview);
    setPreviewOpen(true);
  };

  const sendTestEmail = async () => {
    if (!testTo || !testSubject || !testBody) {
      toast.error("Please enter recipient, subject, and body");
      return;
    }

    setSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-order-email", {
        body: {
          test_recipient: testTo,
          test_subject: testSubject,
          test_body: testBody,
          is_test_send: true
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Test email sent successfully!");
        setTestSubject("");
        setTestBody("");
        loadLogs();
      } else {
        toast.error(data.message || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Management
          </h1>
          <p className="text-muted-foreground">
            Configure transaction emails, welcome messages, and delivery status alerts
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Test Email
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2" onClick={loadLogs}>
              <History className="h-4 w-4" />
              Email Logs
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Provider Configuration</CardTitle>
                <CardDescription>
                  Choose between Resend or Gmail SMTP for sending transactional emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Email Automations</Label>
                    <p className="text-sm text-muted-foreground">
                      Master switch to enable/disable all automatic customer emails
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_enabled === "true"}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, email_enabled: checked ? "true" : "false" })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Provider</Label>
                  <Select
                    value={settings.email_provider}
                    onValueChange={(value) => setSettings({ ...settings, email_provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="gmail">Gmail SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.email_provider === "resend" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Resend API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="re_..."
                        value={settings.resend_api_key}
                        onChange={(e) => setSettings({ ...settings, resend_api_key: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Get an API key from your <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">Resend Dashboard</a>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="senderName">Sender Display Name</Label>
                        <Input
                          id="senderName"
                          placeholder="e.g., Khulna Cart"
                          value={settings.email_sender_name}
                          onChange={(e) => setSettings({ ...settings, email_sender_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senderAddress">Sender Email Address</Label>
                        <Input
                          id="senderAddress"
                          placeholder="e.g., info@yourdomain.com"
                          value={settings.email_sender_address}
                          onChange={(e) => setSettings({ ...settings, email_sender_address: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be a verified domain in Resend, or use onboarding@resend.dev for testing.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {settings.email_provider === "gmail" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="gmailAddress">Gmail Address</Label>
                      <Input
                        id="gmailAddress"
                        placeholder="yourstore@gmail.com"
                        value={settings.gmail_address}
                        onChange={(e) => setSettings({ ...settings, gmail_address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gmailAppPassword">Gmail App Password</Label>
                      <Input
                        id="gmailAppPassword"
                        type="password"
                        placeholder="16-character app password"
                        value={settings.gmail_app_password}
                        onChange={(e) => setSettings({ ...settings, gmail_app_password: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Generate an app password in your Google Account Settings.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="senderName">Sender Display Name</Label>
                      <Input
                        id="senderName"
                        placeholder="e.g., Khulna Cart"
                        value={settings.email_sender_name}
                        onChange={(e) => setSettings({ ...settings, email_sender_name: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notifEmail">Notification Recipient Email</Label>
                  <Input
                    id="notifEmail"
                    placeholder="e.g., owner@yourdomain.com"
                    value={settings.notification_email}
                    onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Where store owner receives internal alerts.
                  </p>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Automated Triggers</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Registration Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">Automatically email new customers</p>
                    </div>
                    <Switch
                      checked={settings.email_auto_send_welcome === "true"}
                      onCheckedChange={(checked) => setSettings({ ...settings, email_auto_send_welcome: checked ? "true" : "false" })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Customer Order Receipt</Label>
                      <p className="text-sm text-muted-foreground">Send automated receipt after purchase</p>
                    </div>
                    <Switch
                      checked={settings.email_auto_send_order_placed === "true"}
                      onCheckedChange={(checked) => setSettings({ ...settings, email_auto_send_order_placed: checked ? "true" : "false" })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Delivery & Status Updates</Label>
                      <p className="text-sm text-muted-foreground">Send updates on order status changes</p>
                    </div>
                    <Switch
                      checked={settings.email_auto_send_status_change === "true"}
                      onCheckedChange={(checked) => setSettings({ ...settings, email_auto_send_status_change: checked ? "true" : "false" })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Admin Notifications</Label>
                      <p className="text-sm text-muted-foreground">Email owner whenever a new order is received</p>
                    </div>
                    <Switch
                      checked={settings.order_notification_enabled === "true"}
                      onCheckedChange={(checked) => setSettings({ ...settings, order_notification_enabled: checked ? "true" : "false" })}
                    />
                  </div>
                </div>

                <Button onClick={saveSettings} disabled={saving} className="w-full">
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Configurations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Customization</CardTitle>
                <CardDescription>Modify transaction email designs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Supported Dynamic Placeholders:</h4>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATE_VARIABLES.map((v) => (
                      <Badge key={v.key} variant="secondary" className="font-mono text-[10px]" title={v.description}>
                        {`{{${v.key}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg">{template.template_name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => toggleTemplateActive(template.id, checked)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditTemplate(template)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit Template
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => showHtmlPreview(template.html_template)}>
                          <Eye className="h-4 w-4 mr-2" /> Preview Design
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Email Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Transactional Test Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Email</Label>
                  <Input placeholder="customer@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Hello!" value={testSubject} onChange={(e) => setTestSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Message Body</Label>
                  <Textarea placeholder="Test notification" value={testBody} onChange={(e) => setTestBody(e.target.value)} rows={6} />
                </div>
                <Button onClick={sendTestEmail} disabled={sendingTest || !testTo || !testSubject || !testBody} className="w-full">
                  {sendingTest ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Dispatch Test Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Delivery History</CardTitle>
                <Button variant="outline" size="sm" onClick={loadLogs} disabled={logsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${logsLoading ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">No logs found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap text-xs">{format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                            <TableCell className="font-mono text-xs">{log.recipient_email}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-xs">{log.subject}</TableCell>
                            <TableCell><Badge variant={log.status === "sent" ? "default" : "destructive"}>{log.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Template Dialog */}
        <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Edit Email: {editingTemplate?.template_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>Subject Template</Label>
                <Input value={editedSubject} onChange={(e) => setEditedSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>HTML Content</Label>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => showHtmlPreview(editedHtml)}>
                    <Eye className="h-3 w-3 mr-1" /> Preview Rendered
                  </Button>
                </div>
                <Textarea value={editedHtml} onChange={(e) => setEditedHtml(e.target.value)} rows={15} className="font-mono text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
              <Button onClick={updateTemplate}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* HTML Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
            <DialogHeader><DialogTitle>Design Preview</DialogTitle></DialogHeader>
            <div className="border rounded-md bg-white overflow-auto flex-1 h-[60vh]">
              <iframe srcDoc={previewHtml} title="Email Preview" className="w-full h-full min-h-[50vh] border-0" />
            </div>
            <div className="flex justify-end border-t pt-4">
              <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}