import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore, useStudentStore } from '@/store';
import { toast } from 'sonner';

const StudentLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const getStudentByRegNo = useStudentStore((s) => s.getStudentByRegNo);
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const student = getStudentByRegNo(regNo);
    if (!student) {
      toast.error('Student not found. Please check your registration number.');
      return;
    }
    if (student.password !== password) {
      toast.error('Invalid password.');
      return;
    }
    if (student.status === 'pending') {
      toast.warning('Your account is pending admin approval.');
      return;
    }
    if (student.status === 'rejected') {
      toast.error('Your registration has been rejected. Contact admin.');
      return;
    }
    login('student', student.id, `${student.firstName} ${student.lastName}`);
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
          <CardDescription>Enter your registration number and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regNo">Registration Number</Label>
              <Input id="regNo" value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="e.g. 21B01A0501" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Login</Button>
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
