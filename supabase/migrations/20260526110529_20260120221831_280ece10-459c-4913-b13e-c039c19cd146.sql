CREATE POLICY "Public can read digital tarsel video setting"
ON public.admin_settings
FOR SELECT
TO public
USING (key = 'digital_tarsel_video_url');;
