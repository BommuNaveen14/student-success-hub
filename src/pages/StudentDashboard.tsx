import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useStudentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, FileText, Trophy, LogOut, User, Upload, Trash2, Eye, Download } from 'lucide-react';
import { Achievement, AchievementType, DocumentType, StudentDocument } from '@/types';
import { toast } from 'sonner';

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
  const { currentUser, logout } = useAuthStore();
  const {
    getStudentById,
    getAchievementsByStudentId,
    getDocumentsByStudentId,
    addAchievement,
    deleteAchievement,
    addDocument,
    deleteDocument,
  } = useStudentStore();

  const [achForm, setAchForm] = useState({
    title: '', description: '', type: '' as AchievementType,
    academicYear: '', semester: 1, date: '', organization: '', position: '',
  });

  const [docForm, setDocForm] = useState({ type: '' as DocumentType, name: '', fileUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/student/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;
  const student = getStudentById(currentUser.id);
  if (!student) return null;

  const achievements = getAchievementsByStudentId(student.id);
  const documents = getDocumentsByStudentId(student.id);

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    const achievement: Achievement = {
      id: crypto.randomUUID(),
      studentId: student.id,
      ...achForm,
      createdAt: new Date().toISOString(),
    };
    addAchievement(achievement);
    setAchForm({ title: '', description: '', type: '' as AchievementType, academicYear: '', semester: 1, date: '', organization: '', position: '' });
    toast.success('Achievement added!');
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !docForm.fileUrl) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    let fileUrl = docForm.fileUrl || '#';
    let fileName = docForm.name || selectedFile?.name || 'Untitled';

    if (selectedFile) {
      // Convert file to base64 data URL for local storage
      fileUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
    }

    const doc: StudentDocument = {
      id: crypto.randomUUID(),
      studentId: student.id,
      type: docForm.type,
      name: fileName,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      verified: false,
    };
    addDocument(doc);
    setDocForm({ type: '' as DocumentType, name: '', fileUrl: '' });
    setSelectedFile(null);
    // Reset the file input
    const fileInput = document.getElementById('doc-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setUploading(false);
    toast.success('Document uploaded!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-accent" />
            <div>
              <h1 className="font-display font-bold text-primary-foreground text-lg">Student Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm">{student.firstName} {student.lastName} — {student.registrationNumber}</p>
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

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Name" value={`${student.firstName} ${student.lastName}`} />
                  <InfoRow label="Email" value={student.email} />
                  <InfoRow label="Phone" value={student.phone} />
                  <InfoRow label="Date of Birth" value={student.dateOfBirth} />
                  <InfoRow label="Gender" value={student.gender} />
                  <InfoRow label="Address" value={`${student.address}, ${student.city}, ${student.state} - ${student.pincode}`} />
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Academic Information</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Reg. Number" value={student.registrationNumber} />
                  <InfoRow label="Program" value={student.program} />
                  <InfoRow label="Branch" value={student.branch} />
                  <InfoRow label="Admission Category" value={student.admissionCategory} />
                  <InfoRow label="Year of Admission" value={String(student.yearOfAdmission)} />
                  <InfoRow label="Current Year / Semester" value={`Year ${student.currentYear} / Sem ${student.currentSemester}`} />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36">Status</span>
                    <Badge variant={student.status === 'approved' ? 'default' : 'secondary'}>{student.status}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Parent / Guardian</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Name" value={student.parentName} />
                  <InfoRow label="Phone" value={student.parentPhone} />
                  <InfoRow label="Email" value={student.parentEmail || 'N/A'} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
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
                    <Label>Upload File (PDF, Image, Document) *</Label>
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
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{doc.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{documentTypes.find(t => t.value === doc.type)?.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { deleteDocument(doc.id); toast.info('Document removed'); }}>
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

          {/* Achievements Tab */}
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
                        {ach.academicYear && <p className="text-xs text-muted-foreground">{ach.academicYear} — Sem {ach.semester}</p>}
                        {ach.description && <p className="text-sm mt-2">{ach.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { deleteAchievement(ach.id); toast.info('Achievement removed'); }}>
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
