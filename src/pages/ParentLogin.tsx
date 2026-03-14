import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore, useStudentStore } from '@/store';
import { toast } from 'sonner';

const ParentLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { generateOTP, verifyOTP, getStudentByParentPhone } = useStudentStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOtp = generateOTP(phone);
    if (!generatedOtp) {
      toast.error('No approved student found with this parent phone number.');
      return;
    }
    setOtpSent(true);
    // In a real app, send via SMS. For demo, show in toast.
    toast.success(`OTP sent! (Demo OTP: ${generatedOtp})`);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const student = verifyOTP(phone, otp);
    if (!student) {
      toast.error('Invalid or expired OTP.');
      return;
    }
    login('parent', student.id, student.parentName);
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
              <Button type="submit" className="w-full">Send OTP</Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} required />
              </div>
              <Button type="submit" className="w-full">Verify & Login</Button>
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
