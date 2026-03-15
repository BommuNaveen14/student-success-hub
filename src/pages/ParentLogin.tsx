import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ParentLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check if any approved student has this parent phone
    const { data: students } = await supabase.rpc('get_student_by_parent_phone', { _phone: phone });

    if (!students || students.length === 0) {
      toast.error('No approved student found with this parent phone number.');
      setLoading(false);
      return;
    }

    // Generate OTP locally (in production, send via SMS edge function)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    setOtpSent(true);
    toast.success(`OTP sent! (Demo OTP: ${otpCode})`);
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (otp !== generatedOtp) {
      toast.error('Invalid OTP.');
      setLoading(false);
      return;
    }

    // Get the student linked to this parent phone
    const { data: students } = await supabase.rpc('get_student_by_parent_phone', { _phone: phone });

    if (!students || students.length === 0) {
      toast.error('No student found.');
      setLoading(false);
      return;
    }

    const student = students[0];

    // Sign in as parent using a deterministic email/password based on phone
    // First try to sign in, if fails, create the account
    const parentEmail = `parent_${phone.replace(/[^0-9]/g, '')}@parent.local`;
    const parentPassword = `parent_${phone}_otp_verified`;

    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: parentEmail,
      password: parentPassword,
    });

    if (signInError) {
      // Create parent account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: parentEmail,
        password: parentPassword,
        options: { data: { display_name: student.parent_name } },
      });

      if (signUpError || !signUpData.user) {
        toast.error('Failed to create parent account.');
        setLoading(false);
        return;
      }

      // Assign parent role
      await supabase.from('user_roles').insert({ user_id: signUpData.user.id, role: 'parent' as const });

      signInData = signUpData as any;
    }

    // Store parent phone in session storage for dashboard lookup
    sessionStorage.setItem('parent_phone', phone);
    sessionStorage.setItem('parent_student_id', student.id);

    toast.success('Welcome!');
    navigate('/parent/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto gradient-hero p-3 rounded-xl w-fit mb-3">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Parent Portal</CardTitle>
          <CardDescription>Login using the phone number provided during student registration</CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label>Parent Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Checking...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setOtpSent(false)}>
                Change phone number
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to Home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentLogin;
