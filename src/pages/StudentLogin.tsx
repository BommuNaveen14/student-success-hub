import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }

    // Verify student role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('role', 'student')
      .single();

    if (!roleData) {
      await supabase.auth.signOut();
      toast.error('No student account found for this email.');
      setLoading(false);
      return;
    }

    // Check student approval status
    const { data: student } = await supabase
      .from('students')
      .select('status')
      .eq('user_id', data.user.id)
      .single();

    if (student?.status === 'pending') {
      await supabase.auth.signOut();
      toast.warning('Your account is pending admin approval.');
      setLoading(false);
      return;
    }
    if (student?.status === 'rejected') {
      await supabase.auth.signOut();
      toast.error('Your registration has been rejected. Contact admin.');
      setLoading(false);
      return;
    }

    toast.success('Welcome back!');
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto gradient-primary p-3 rounded-xl w-fit mb-3">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Student Login</CardTitle>
          <CardDescription>Enter your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/student/register" className="text-primary font-medium hover:underline">Register here</Link>
          </div>
          <div className="mt-2 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to Home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;
