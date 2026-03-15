import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, FileText, Trophy, LogOut, User, Upload, Trash2, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';

type Student = Tables<'students'>;
type Achievement = Tables<'achievements'>;
type Document = Tables<'documents'>;
type AchievementType = Database['public']['Enums']['achievement_type'];
type DocumentType = Database['public']['Enums']['document_type'];

const achievementTypes: { value: AchievementType; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'internship', label: 'Internship' },
  { value: 'research', label: 'Research Publication' },
  { value: 'technical', label: 'Technical Competition' },
  { value: 'cultural', label: 'Cultural Achievement' },
  { value: 'sports', label: 'Sports Achievement' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'other', label: 'Other' },
];

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'mark_memo', label: 'Mark Memo' },
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'voter_id', label: 'Voter ID' },
  { value: 'apaar_abc', label: 'APAAR / ABC ID' },
  { value: 'other', label: 'Other Document' },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [achForm, setAchForm] = useState({
    title: '', description: '', type: '' as AchievementType,
    academicYear: '', semester: 1, date: '', organization: '', position: '',
  });

  const [docForm, setDocForm] = useState({ type: '' as DocumentType, name: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data: studentData } = await supabase.from('students').select('*').eq('user_id', user.id).single();
    if (studentData) {
      setStudent(studentData);
      const [achRes, docRes] = await Promise.all([
        supabase.from('achievements').select('*').eq('student_id', studentData.id).order('created_at', { ascending: false }),
        supabase.from('documents').select('*').eq('student_id', studentData.id).order('uploaded_at', { ascending: false }),
      ]);
      setAchievements(achRes.data || []);
      setDocuments(docRes.data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) { navigate('/student/login'); return; }
    fetchData();
  }, [user, navigate, fetchData]);

  if (loading || !student) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('achievements').insert({
      student_id: student.id,
      user_id: user!.id,
      title: achForm.title,
      description: achForm.description || null,
      type: achForm.type,
      academic_year: achForm.academicYear || null,
      semester: achForm.semester,
      date: achForm.date,
      organization: achForm.organization,
      position: achForm.position || null,
    });
    if (error) { toast.error(error.message); return; }
    setAchForm({ title: '', description: '', type: '' as AchievementType, academicYear: '', semester: 1, date: '', organization: '', position: '' });
    toast.success('Achievement added!');
    fetchData();
  };

  const handleDeleteAchievement = async (id: string) => {
    await supabase.from('achievements').delete().eq('id', id);
    toast.info('Achievement removed');
    fetchData();
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error('Please select a file'); return; }
    setUploading(true);

    const filePath = `${user!.id}/${Date.now()}_${selectedFile.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, selectedFile);

    if (uploadError) { toast.error('Upload failed: ' + uploadError.message); setUploading(false); return; }

    const { error } = await supabase.from('documents').insert({
      student_id: student.id,
      user_id: user!.id,
      type: docForm.type,
      name: docForm.name || selectedFile.name.replace(/\.[^/.]+$/, ''),
      file_path: filePath,
    });

    if (error) { toast.error(error.message); setUploading(false); return; }
    setDocForm({ type: '' as DocumentType, name: '' });
    setSelectedFile(null);
    const fileInput = document.getElementById('doc-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setUploading(false);
    toast.success('Document uploaded!');
    fetchData();
  };

  const handleDeleteDocument = async (id: string, filePath: string) => {
    await supabase.storage.from('documents').remove([filePath]);
    await supabase.from('documents').delete().eq('id', id);
    toast.info('Document removed');
    fetchData();
  };

  const getDocumentUrl = (filePath: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadDocument = async (filePath: string, name: string) => {
    const { data, error } = await supabase.storage.from('documents').download(filePath);
    if (error || !data) { toast.error('Download failed'); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewDocument = async (filePath: string, name: string) => {
    const { data, error } = await supabase.storage.from('documents').download(filePath);
    if (error || !data) { toast.error('Failed to load document'); return; }
    const url = URL.createObjectURL(data);
    window.open(url, '_blank');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-accent" />
            <div>
              <h1 className="font-display font-bold text-primary-foreground text-lg">Student Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm">{student.first_name} {student.last_name} — {student.registration_number}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" /> Profile</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-2" /> Documents</TabsTrigger>
            <TabsTrigger value="achievements"><Trophy className="h-4 w-4 mr-2" /> Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Name" value={`${student.first_name} ${student.last_name}`} />
                  <InfoRow label="Email" value={student.email} />
                  <InfoRow label="Phone" value={student.phone} />
                  <InfoRow label="Date of Birth" value={student.date_of_birth} />
                  <InfoRow label="Gender" value={student.gender} />
                  <InfoRow label="Address" value={`${student.address}, ${student.city}, ${student.state} - ${student.pincode}`} />
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Academic Information</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Reg. Number" value={student.registration_number} />
                  <InfoRow label="Program" value={student.program} />
                  <InfoRow label="Branch" value={student.branch} />
                  <InfoRow label="Admission Category" value={student.admission_category} />
                  <InfoRow label="Year of Admission" value={String(student.year_of_admission)} />
                  <InfoRow label="Current Year / Semester" value={`Year ${student.current_year} / Sem ${student.current_semester}`} />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36">Status</span>
                    <Badge variant={student.status === 'approved' ? 'default' : 'secondary'}>{student.status}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Parent / Guardian</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Name" value={student.parent_name} />
                  <InfoRow label="Phone" value={student.parent_phone} />
                  <InfoRow label="Email" value={student.parent_email || 'N/A'} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader><CardTitle className="font-display text-lg"><Upload className="h-5 w-5 inline mr-2" />Upload Document</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddDocument} className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <Select value={docForm.type} onValueChange={(v) => setDocForm(p => ({ ...p, type: v as DocumentType }))}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Document Name</Label>
                    <Input value={docForm.name} onChange={(e) => setDocForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Semester 1 Marks" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Upload File *</Label>
                    <Input
                      id="doc-file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file && !docForm.name) {
                          setDocForm(p => ({ ...p, name: file.name.replace(/\.[^/.]+$/, '') }));
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={!docForm.type || !selectedFile || uploading}>
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {documents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="card-elevated">
                    <CardContent className="p-4 flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium text-sm truncate">{doc.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{documentTypes.find(t => t.value === doc.type)?.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => viewDocument(doc.file_path, doc.name)}>
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadDocument(doc.file_path, doc.name)}>
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id, doc.file_path)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No documents uploaded yet.</p>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader><CardTitle className="font-display text-lg"><Trophy className="h-5 w-5 inline mr-2" />Add Achievement</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddAchievement} className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={achForm.title} onChange={(e) => setAchForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={achForm.type} onValueChange={(v) => setAchForm(p => ({ ...p, type: v as AchievementType }))}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {achievementTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Organization *</Label>
                    <Input value={achForm.organization} onChange={(e) => setAchForm(p => ({ ...p, organization: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input type="date" value={achForm.date} onChange={(e) => setAchForm(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Input value={achForm.academicYear} onChange={(e) => setAchForm(p => ({ ...p, academicYear: e.target.value }))} placeholder="2024-2025" />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={String(achForm.semester)} onValueChange={(v) => setAchForm(p => ({ ...p, semester: parseInt(v) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Position / Award</Label>
                    <Input value={achForm.position} onChange={(e) => setAchForm(p => ({ ...p, position: e.target.value }))} placeholder="e.g. 1st Place" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={achForm.description} onChange={(e) => setAchForm(p => ({ ...p, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={!achForm.title || !achForm.type || !achForm.organization || !achForm.date}>Add Achievement</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((ach) => (
                  <Card key={ach.id} className="card-elevated">
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <h4 className="font-display font-semibold">{ach.title}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="secondary">{achievementTypes.find(t => t.value === ach.type)?.label}</Badge>
                          {ach.position && <Badge className="bg-accent text-accent-foreground">{ach.position}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{ach.organization} • {ach.date}</p>
                        {ach.academic_year && <p className="text-xs text-muted-foreground">{ach.academic_year} — Sem {ach.semester}</p>}
                        {ach.description && <p className="text-sm mt-2">{ach.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAchievement(ach.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No achievements added yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <span className="text-muted-foreground w-36 shrink-0">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default StudentDashboard;
