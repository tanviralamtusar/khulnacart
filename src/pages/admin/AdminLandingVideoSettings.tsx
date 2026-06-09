import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, Video, Plus, Trash2, Tag } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

const AdminLandingVideoSettings = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cottonTarselVideo, setCottonTarselVideo] = useState('');
  const [digitalTarselVideo, setDigitalTarselVideo] = useState('');
  const [reyonCottonVideo, setReyonCottonVideo] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['cotton_tarsel_video_url', 'digital_tarsel_video_url', 'reyon_cotton_video_url']);

      if (error) throw error;

      data?.forEach((item) => {
        if (item.key === 'cotton_tarsel_video_url') setCottonTarselVideo(item.value);
        if (item.key === 'digital_tarsel_video_url') setDigitalTarselVideo(item.value);
        if (item.key === 'reyon_cotton_video_url') setReyonCottonVideo(item.value);
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'cotton_tarsel_video_url', value: cottonTarselVideo },
        { key: 'digital_tarsel_video_url', value: digitalTarselVideo },
        { key: 'reyon_cotton_video_url', value: reyonCottonVideo },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });

        if (error) throw error;
      }

      toast.success('সেটিংস সেভ হয়েছে!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const getEmbedPreview = (url: string) => {
    if (!url) return null;
    // Handle YouTube Shorts
    if (url.includes('/shorts/')) {
      const videoId = url.split('/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle regular YouTube links
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    // Handle youtu.be short links
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <BackButton fallbackPath="/admin" className="mb-2" />
            <h1 className="text-2xl font-bold">ল্যান্ডিং পেজ ভিডিও সেটিংস</h1>
            <p className="text-muted-foreground">ল্যান্ডিং পেজের ভিডিও লিংক পরিবর্তন করুন</p>
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            সেভ করুন
          </Button>
        </div>

        {/* Special Collections Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              স্পেশাল কালেকশন ভিডিও
            </CardTitle>
            <CardDescription>বিশেষ কালেকশন ল্যান্ডিং পেজের ভিডিও লিংক</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cotton Tarsel */}
            <div className="space-y-2">
              <Label>কটন টারসেল কালেকশন ভিডিও</Label>
              <p className="text-xs text-muted-foreground">URL: /cotton-tarsel-collection</p>
              <Input
                value={cottonTarselVideo}
                onChange={(e) => setCottonTarselVideo(e.target.value)}
                placeholder="ভিডিও লিংক বা iframe embed কোড..."
              />
            </div>
            {/* Digital Tarsel */}
            <div className="space-y-2">
              <Label>ডিজিটাল টারসেল কালেকশন ভিডিও</Label>
              <p className="text-xs text-muted-foreground">URL: /digital-tarsel-collection</p>
              <Input
                value={digitalTarselVideo}
                onChange={(e) => setDigitalTarselVideo(e.target.value)}
                placeholder="ভিডিও লিংক বা iframe embed কোড..."
              />
            </div>
            {/* Reyon Cotton */}
            <div className="space-y-2">
              <Label>রেয়ন কটন কালেকশন ভিডিও</Label>
              <p className="text-xs text-muted-foreground">URL: /reyon-cotton-collection</p>
              <Input
                value={reyonCottonVideo}
                onChange={(e) => setReyonCottonVideo(e.target.value)}
                placeholder="ভিডিও লিংক বা iframe embed কোড..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminLandingVideoSettings;
