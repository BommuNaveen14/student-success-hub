import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      await supabase.auth.signOut();
      toast.error('You are not an admin.');
      setLoading(false);
      return;
    }

    toast.success('Welcome, Admin!');
    navigate('/admin/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: 'Administrator' } },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (!data.user) { toast.error('Signup failed'); setLoading(false); return; }

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role: 'admin' as const });

    if (roleError) { toast.error('Failed to assign admin role'); setLoading(false); return; }

    toast.success('Admin account created! You can now log in.');
    setTab('login');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto gradient-accent p-3 rounded-xl w-fit mb-3">
            <Shield className="h-8 w-8 text-accent-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Portal</CardTitle>
          <CardDescription>Sign in or create an admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Admin Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to Home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
