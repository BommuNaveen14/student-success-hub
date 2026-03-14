import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useStudentStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, LogOut, User, FileText, Trophy, Eye, Download } from 'lucide-react';

const achievementTypeLabels: Record<string, string> = {
  hackathon: 'Hackathon', internship: 'Internship', research: 'Research',
  technical: 'Technical', cultural: 'Cultural', sports: 'Sports',
  workshop: 'Workshop', seminar: 'Seminar', other: 'Other',
};

const docTypeLabels: Record<string, string> = {
  mark_memo: 'Mark Memo', aadhaar: 'Aadhaar', pan: 'PAN Card',
  voter_id: 'Voter ID', apaar_abc: 'APAAR/ABC', other: 'Other',
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { getStudentById, getAchievementsByStudentId, getDocumentsByStudentId } = useStudentStore();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'parent') navigate('/parent/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;
  const student = getStudentById(currentUser.id);
  if (!student) return null;

  const achievements = getAchievementsByStudentId(student.id);
  const documents = getDocumentsByStudentId(student.id);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-accent" />
            <div>
              <h1 className="font-display font-bold text-primary-foreground text-lg">Parent Portal</h1>
              <p className="text-primary-foreground/70 text-sm">Viewing: {student.firstName} {student.lastName}</p>
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
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-2" />Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="achievements"><Trophy className="h-4 w-4 mr-2" />Achievements ({achievements.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Student Information</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Name" value={`${student.firstName} ${student.lastName}`} />
                  <InfoRow label="Reg. Number" value={student.registrationNumber} />
                  <InfoRow label="Email" value={student.email} />
                  <InfoRow label="Phone" value={student.phone} />
                  <InfoRow label="DOB" value={student.dateOfBirth} />
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader><CardTitle className="font-display text-lg">Academic Details</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Program" value={student.program} />
                  <InfoRow label="Branch" value={student.branch} />
                  <InfoRow label="Category" value={student.admissionCategory} />
                  <InfoRow label="Year / Sem" value={`Year ${student.currentYear} / Sem ${student.currentSemester}`} />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-28">Status</span>
                    <Badge>{student.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            {documents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="card-elevated">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{doc.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{docTypeLabels[doc.type] || doc.type}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No documents uploaded.</p>
            )}
          </TabsContent>

          <TabsContent value="achievements">
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((ach) => (
                  <Card key={ach.id} className="card-elevated">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold">{ach.title}</h4>
                        <Badge variant="secondary">{achievementTypeLabels[ach.type]}</Badge>
                        {ach.position && <Badge className="bg-accent text-accent-foreground">{ach.position}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{ach.organization} • {ach.date}</p>
                      {ach.academicYear && <p className="text-xs text-muted-foreground">{ach.academicYear} — Sem {ach.semester}</p>}
                      {ach.description && <p className="text-sm mt-2">{ach.description}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No achievements recorded.</p>
            )}
          </TabsContent>
        </Tabs>
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

export default ParentDashboard;
