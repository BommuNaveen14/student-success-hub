import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const portalCards = [
  {
    role: 'student' as const,
    title: 'Student Portal',
    description: 'Register, manage your profile, upload achievements and documents',
    icon: GraduationCap,
    path: '/student/login',
    gradient: 'gradient-primary',
  },
  {
    role: 'admin' as const,
    title: 'Admin Portal',
    description: 'Verify students, manage records, and oversee the system',
    icon: Shield,
    path: '/admin/login',
    gradient: 'gradient-accent',
  },
  {
    role: 'parent' as const,
    title: 'Parent Portal',
    description: "View your child's profile, achievements, and academic progress",
    icon: Users,
    path: '/parent/login',
    gradient: 'gradient-hero',
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="gradient-hero py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-accent" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
              Student Achievement Portal
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Centralized Student Achievement and Profile Management System — 
            maintaining complete digital records throughout the student lifecycle.
          </p>
        </div>
      </header>

      {/* Portal Cards */}
      <main className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {portalCards.map((card) => (
            <div
              key={card.role}
              className="bg-card rounded-lg overflow-hidden card-elevated"
            >
              <div className={`${card.gradient} p-6 flex items-center gap-3`}>
                <card.icon className="h-8 w-8 text-primary-foreground" />
                <h2 className="text-xl font-display font-bold text-primary-foreground">
                  {card.title}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm">{card.description}</p>
                <Button
                  className="w-full"
                  onClick={() => navigate(card.path)}
                >
                  Enter {card.title}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <section className="mt-16 mb-12 text-center">
          <h2 className="text-2xl font-display font-bold mb-8">System Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Digital Portfolio', desc: 'Complete student digital records' },
              { title: 'Document Vault', desc: 'Secure document storage & verification' },
              { title: 'Achievement Tracking', desc: 'Organized by year, semester & type' },
              { title: 'Admin Oversight', desc: 'Search, verify & approve students' },
            ].map((f) => (
              <div key={f.title} className="bg-card p-5 rounded-lg card-elevated">
                <h3 className="font-display font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
