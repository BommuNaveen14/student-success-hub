import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useStudentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, LogOut, Search, CheckCircle, XCircle, Users, Clock, UserCheck, FileText, Trophy, Eye, Download } from 'lucide-react';
import { Student } from '@/types';
import { toast } from 'sonner';

const achievementTypeLabels: Record<string, string> = {
  hackathon: 'Hackathon', internship: 'Internship', research: 'Research',
  technical: 'Technical', cultural: 'Cultural', sports: 'Sports',
  workshop: 'Workshop', seminar: 'Seminar', other: 'Other',
};

const docTypeLabels: Record<string, string> = {
  mark_memo: 'Mark Memo', aadhaar: 'Aadhaar', pan: 'PAN Card',
  voter_id: 'Voter ID', apaar_abc: 'APAAR/ABC', other: 'Other',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const {
    getAllStudents, getPendingStudents, approveStudent, rejectStudent,
    getAchievementsByStudentId, getDocumentsByStudentId,
  } = useStudentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') navigate('/admin/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const allStudents = getAllStudents();
  const pendingStudents = getPendingStudents();

  const searchResults = searchQuery.trim()
    ? allStudents.filter(
        (s) =>
          s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleApprove = (id: string) => {
    approveStudent(id);
    toast.success('Student approved!');
  };

  const handleReject = (id: string) => {
    rejectStudent(id);
    toast.info('Student rejected.');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const viewStudent = (student: Student) => setSelectedStudent(student);

  const studentAchievements = selectedStudent ? getAchievementsByStudentId(selectedStudent.id) : [];
  const studentDocuments = selectedStudent ? getDocumentsByStudentId(selectedStudent.id) : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-accent px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-accent-foreground" />
            <h1 className="font-display font-bold text-accent-foreground text-lg">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-accent-foreground hover:text-accent-foreground/80">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-display font-bold">{allStudents.length}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-display font-bold">{pendingStudents.length}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-display font-bold">{allStudents.filter(s => s.status === 'approved').length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedStudent ? (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setSelectedStudent(null)}>← Back to list</Button>
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                  <Badge variant={selectedStudent.status === 'approved' ? 'default' : selectedStudent.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {selectedStudent.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <InfoRow label="Reg. Number" value={selectedStudent.registrationNumber} />
                    <InfoRow label="Email" value={selectedStudent.email} />
                    <InfoRow label="Phone" value={selectedStudent.phone} />
                    <InfoRow label="DOB" value={selectedStudent.dateOfBirth} />
                    <InfoRow label="Gender" value={selectedStudent.gender} />
                    <InfoRow label="Address" value={`${selectedStudent.address}, ${selectedStudent.city}, ${selectedStudent.state} - ${selectedStudent.pincode}`} />
                  </div>
                  <div className="space-y-1">
                    <InfoRow label="Program" value={selectedStudent.program} />
                    <InfoRow label="Branch" value={selectedStudent.branch} />
                    <InfoRow label="Category" value={selectedStudent.admissionCategory} />
                    <InfoRow label="Year" value={`Year ${selectedStudent.currentYear} / Sem ${selectedStudent.currentSemester}`} />
                    <InfoRow label="Parent" value={`${selectedStudent.parentName} (${selectedStudent.parentPhone})`} />
                  </div>
                </div>
                {selectedStudent.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => { handleApprove(selectedStudent.id); setSelectedStudent({ ...selectedStudent, status: 'approved' }); }}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button variant="destructive" onClick={() => { handleReject(selectedStudent.id); setSelectedStudent({ ...selectedStudent, status: 'rejected' }); }}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            {studentDocuments.length > 0 && (
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg"><FileText className="h-5 w-5 inline mr-2" />Documents ({studentDocuments.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {studentDocuments.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-3">
                        <p className="font-medium text-sm">{doc.name}</p>
                        <Badge variant="secondary" className="text-xs mt-1">{docTypeLabels[doc.type] || doc.type}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        {doc.fileUrl && doc.fileUrl !== '#' && (
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                const w = window.open();
                                if (w) {
                                  w.document.write(`<iframe src="${doc.fileUrl}" style="width:100%;height:100%;border:none;" />`);
                                  w.document.title = doc.name;
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = doc.fileUrl;
                                a.download = doc.name;
                                a.click();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" /> Download
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {studentAchievements.length > 0 && (
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg"><Trophy className="h-5 w-5 inline mr-2" />Achievements ({studentAchievements.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {studentAchievements.map((ach) => (
                    <div key={ach.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{ach.title}</h4>
                        <Badge variant="secondary">{achievementTypeLabels[ach.type]}</Badge>
                        {ach.position && <Badge className="bg-accent text-accent-foreground">{ach.position}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{ach.organization} • {ach.date}</p>
                      {ach.description && <p className="text-sm mt-1">{ach.description}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending"><Clock className="h-4 w-4 mr-2" />Pending ({pendingStudents.length})</TabsTrigger>
              <TabsTrigger value="search"><Search className="h-4 w-4 mr-2" />Search Students</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {pendingStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending registrations.</p>
              ) : (
                pendingStudents.map((s) => (
                  <Card key={s.id} className="card-elevated">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-display font-semibold">{s.firstName} {s.lastName}</p>
                        <p className="text-sm text-muted-foreground">{s.registrationNumber} • {s.program} — {s.branch}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => viewStudent(s)}>View</Button>
                        <Button size="sm" onClick={() => handleApprove(s.id)}><CheckCircle className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(s.id)}><XCircle className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Search by registration number or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Button variant="secondary"><Search className="h-4 w-4" /></Button>
              </div>
              {searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No students found.</p>
              )}
              {searchResults.map((s) => (
                <Card key={s.id} className="card-elevated cursor-pointer" onClick={() => viewStudent(s)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold">{s.firstName} {s.lastName}</p>
                      <p className="text-sm text-muted-foreground">{s.registrationNumber} • {s.program} — {s.branch}</p>
                    </div>
                    <Badge variant={s.status === 'approved' ? 'default' : s.status === 'rejected' ? 'destructive' : 'secondary'}>{s.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <span className="text-muted-foreground w-28 shrink-0">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default AdminDashboard;
