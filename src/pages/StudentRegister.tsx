import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AdmissionCategory = Database['public']['Enums']['admission_category'];

const StudentRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    registrationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    admissionCategory: '' as AdmissionCategory,
    program: '',
    branch: '',
    yearOfAdmission: new Date().getFullYear(),
    currentYear: 1,
    currentSemester: 1,
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: `${form.firstName} ${form.lastName}` } },
    });

    if (authError || !authData.user) {
      toast.error(authError?.message || 'Registration failed');
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Assign student role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'student' as const });

    if (roleError) {
      toast.error('Failed to assign role: ' + roleError.message);
      setLoading(false);
      return;
    }

    // 3. Create student record
    const { error: studentError } = await supabase.from('students').insert({
      user_id: userId,
      registration_number: form.registrationNumber,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.dateOfBirth,
      gender: form.gender,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      parent_name: form.parentName,
      parent_phone: form.parentPhone,
      parent_email: form.parentEmail || null,
      admission_category: form.admissionCategory,
      program: form.program,
      branch: form.branch,
      year_of_admission: form.yearOfAdmission,
      current_year: form.currentYear,
      current_semester: form.currentSemester,
    });

    if (studentError) {
      toast.error('Failed to create student record: ' + studentError.message);
      setLoading(false);
      return;
    }

    // Sign out after registration (pending approval)
    await supabase.auth.signOut();
    toast.success('Registration successful! Await admin approval.');
    navigate('/student/login');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="card-elevated">
          <CardHeader className="text-center">
            <div className="mx-auto gradient-primary p-3 rounded-xl w-fit mb-3">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Student Registration</CardTitle>
            <CardDescription>Fill in your details to create an account. Admin will verify and approve.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 text-primary">Personal Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Registration Number *</Label>
                    <Input value={form.registrationNumber} onChange={(e) => updateField('registrationNumber', e.target.value)} placeholder="21B01A0501" required />
                  </div>
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91XXXXXXXXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address *</Label>
                    <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input value={form.state} onChange={(e) => updateField('state', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 text-primary">Parent / Guardian Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parent Name *</Label>
                    <Input value={form.parentName} onChange={(e) => updateField('parentName', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Phone *</Label>
                    <Input value={form.parentPhone} onChange={(e) => updateField('parentPhone', e.target.value)} placeholder="+91XXXXXXXXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Email</Label>
                    <Input type="email" value={form.parentEmail} onChange={(e) => updateField('parentEmail', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 text-primary">Academic Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admission Category *</Label>
                    <Select value={form.admissionCategory} onValueChange={(v) => updateField('admissionCategory', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['VSAT', 'EAMCET', 'JEE', 'Management', 'Sports', 'Other'].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Program *</Label>
                    <Input value={form.program} onChange={(e) => updateField('program', e.target.value)} placeholder="B.Tech" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch *</Label>
                    <Input value={form.branch} onChange={(e) => updateField('branch', e.target.value)} placeholder="Computer Science" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Admission *</Label>
                    <Input type="number" value={form.yearOfAdmission} onChange={(e) => updateField('yearOfAdmission', parseInt(e.target.value))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Year *</Label>
                    <Select value={String(form.currentYear)} onValueChange={(v) => updateField('currentYear', parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((y) => (
                          <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Semester *</Label>
                    <Select value={String(form.currentSemester)} onValueChange={(v) => updateField('currentSemester', parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 text-primary">Set Password</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password *</Label>
                    <Input type="password" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} required />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/student/login" className="text-primary font-medium hover:underline">Login here</Link>
            </div>
            <div className="mt-2 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to Home</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentRegister;
