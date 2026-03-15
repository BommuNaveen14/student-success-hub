
-- OTP records are managed by edge functions with service role key, 
-- but add a policy to satisfy linter
CREATE POLICY "No direct access to OTP records" ON public.otp_records FOR SELECT USING (false);
