import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  ShieldCheck, Activity, HeartPulse, Users, Brain, BarChart3, 
  Bell, AlertTriangle, Info, CheckCircle, ArrowRight, Building2, TrendingUp
} from 'lucide-react';

/* ─── Shared animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  transition: { duration: 0.7, delay },
});

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`py-24 lg:py-32 ${className}`}>{children}</div>;
}

/* ─── 1. INTRO ─── */
function IntroBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <Section>
      <div ref={ref} className="container mx-auto px-6 lg:px-12 text-center relative">
        {/* Orbital decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full border border-border/20 rotate-slow opacity-20" />
          <div className="absolute inset-8 rounded-full border border-primary/10 rotate-slow opacity-30" style={{ animationDirection: 'reverse', animationDuration: '45s' }} />
        </div>

        <motion.span
          {...fadeUp()}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-caption uppercase tracking-[0.25em] text-primary block mb-4"
        >
          Healthcare Intelligence
        </motion.span>

        <motion.h2
          {...fadeUp(0.1)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-headline mb-6 max-w-3xl mx-auto"
        >
          Extending care beyond
          <span className="text-gradient-teal"> clinical settings</span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.2)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-body max-w-2xl mx-auto"
        >
          aiOn connects everyday health signals with care teams — enabling continuous visibility, earlier intervention, and better outcomes.
        </motion.p>
      </div>
    </Section>
  );
}

/* ─── 2. USE CASES ─── */
const useCases = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Preventive Care',
    bullets: ['Identify early deviations from baseline', 'Enable proactive outreach'],
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'Remote Patient Monitoring',
    bullets: ['Continuous visibility outside clinical settings', 'Real-world health patterns'],
  },
  {
    icon: <HeartPulse className="w-6 h-6" />,
    title: 'Post-Discharge Monitoring',
    bullets: ['Track recovery trends', 'Reduce readmission risk'],
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Elderly & High-Risk Care',
    bullets: ['Passive monitoring with no friction', 'Daily health awareness'],
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Chronic Condition Awareness',
    bullets: ['Cardiovascular & metabolic trends', 'Stress and recovery signals'],
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Care Management Optimization',
    bullets: ['Prioritize individuals needing attention', 'Focus resources efficiently'],
  },
];

function UseCasesBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <Section className="bg-card/30">
      <div ref={ref} className="container mx-auto px-6 lg:px-12">
        <motion.h3
          {...fadeUp()}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-headline text-center mb-16"
        >
          Provider <span className="text-gradient-teal">use cases</span>
        </motion.h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              {...fadeUp(0.1 + i * 0.07)}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="card-glass p-8 group hover:border-primary/30 transition-colors duration-500"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors duration-500">
                {uc.icon}
              </div>
              <h4 className="text-lg font-light text-foreground mb-3">{uc.title}</h4>
              <ul className="space-y-2">
                {uc.bullets.map((b) => (
                  <li key={b} className="text-body text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 3. DASHBOARD MOCKUP ─── */
const mockPatients = [
  { name: 'E. Thompson', age: 68, status: 'high-risk' as const },
  { name: 'M. Chen', age: 54, status: 'watchlist' as const },
  { name: 'S. Patel', age: 72, status: 'stable' as const },
  { name: 'J. Williams', age: 61, status: 'stable' as const },
  { name: 'A. Garcia', age: 45, status: 'watchlist' as const },
  { name: 'R. Kim', age: 77, status: 'high-risk' as const },
];

const statusColors = {
  'stable': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'watchlist': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'high-risk': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  'stable': 'Stable',
  'watchlist': 'Watchlist',
  'high-risk': 'High Risk',
};

/* Simple sparkline SVG */
function Sparkline({ data, color = 'hsl(var(--aion-teal))' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const selectedPatient = mockPatients[0];

  const hrData = [72, 74, 71, 78, 82, 79, 85, 88, 84, 80, 76, 73];
  const bpData = [120, 122, 118, 125, 130, 128, 132, 129, 126, 124, 121, 119];
  const glucoseData = [95, 110, 105, 130, 120, 115, 108, 102, 98, 105, 112, 100];
  const sleepData = [6.5, 7.2, 5.8, 6.0, 7.5, 6.8, 7.0, 5.5, 6.2, 7.1, 6.9, 7.3];

  return (
    <Section>
      <div ref={ref} className="container mx-auto px-6 lg:px-12">
        <motion.div {...fadeUp()} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <h3 className="text-headline mb-4">
            Unified Care Team <span className="text-gradient-teal">Dashboard</span>
          </h3>
          <p className="text-body max-w-2xl mx-auto">
            A single view to understand who is stable, who is changing, and who needs attention.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.2)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="card-glass overflow-hidden border border-border/40"
        >
          <div className="grid lg:grid-cols-[280px_1fr] min-h-[480px]">
            {/* Patient list */}
            <div className="border-r border-border/30 p-4 space-y-1">
              <div className="text-caption uppercase tracking-widest mb-3 px-2">Patients</div>
              {mockPatients.map((p, i) => (
                <div
                  key={p.name}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${
                    i === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
                  }`}
                >
                  <div>
                    <div className="text-sm font-light text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Age {p.age}</div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xl font-light text-foreground">{selectedPatient.name}</h4>
                  <p className="text-caption">Age {selectedPatient.age} · Last sync 12 min ago</p>
                </div>
                <span className={`text-xs uppercase tracking-wider px-3 py-1 rounded-full border ${statusColors[selectedPatient.status]}`}>
                  {statusLabels[selectedPatient.status]}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { label: 'Heart Rate', value: '73 bpm', trend: 'Elevated trend', data: hrData, color: 'hsl(var(--aion-teal))' },
                  { label: 'Blood Pressure', value: '128/82', trend: 'Rising trend', data: bpData, color: 'hsl(187, 100%, 70%)' },
                  { label: 'Glucose', value: '105 mg/dL', trend: 'Variable', data: glucoseData, color: 'hsl(45, 90%, 60%)' },
                  { label: 'Sleep & Recovery', value: '6.8 hrs', trend: 'Below baseline', data: sleepData, color: 'hsl(270, 60%, 65%)' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-secondary/30 rounded-xl p-4 border border-border/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-caption">{metric.label}</span>
                      <span className="text-xs text-muted-foreground">{metric.trend}</span>
                    </div>
                    <div className="text-lg font-light text-foreground mb-2">{metric.value}</div>
                    <Sparkline data={metric.data} color={metric.color} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 4. NOTIFICATIONS ─── */
const alertLevels = [
  { icon: <AlertTriangle className="w-4 h-4" />, level: 'Critical', color: 'text-red-400', examples: ['Sustained deviation from baseline', 'Combined stress and sleep deterioration'] },
  { icon: <TrendingUp className="w-4 h-4" />, level: 'Moderate', color: 'text-amber-400', examples: ['Recovery trend below expected range', 'Elevated resting heart rate pattern'] },
  { icon: <Info className="w-4 h-4" />, level: 'Informational', color: 'text-primary', examples: ['Weekly trend summary available', 'Baseline recalibrated'] },
];

function NotificationsBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <Section className="bg-card/30">
      <div ref={ref} className="container mx-auto px-6 lg:px-12">
        <motion.div {...fadeUp()} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <h3 className="text-headline mb-4">
            Intelligent Notifications. <span className="text-gradient-teal">Meaningful Action.</span>
          </h3>
          <p className="text-body max-w-2xl mx-auto">
            aiOn delivers context-aware signals — not noisy alerts. Based on patterns, not thresholds. Multi-signal insights, not isolated readings.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {alertLevels.map((al, i) => (
            <motion.div
              key={al.level}
              {...fadeUp(0.1 + i * 0.1)}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="card-glass p-6"
            >
              <div className={`flex items-center gap-2 mb-4 ${al.color}`}>
                {al.icon}
                <span className="text-sm font-medium uppercase tracking-wider">{al.level}</span>
              </div>
              <ul className="space-y-3">
                {al.examples.map((ex) => (
                  <li key={ex} className="text-body text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                    {ex}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 5. CARE WORKFLOW ─── */
const workflowSteps = [
  { label: 'Signal', icon: <Activity className="w-5 h-5" /> },
  { label: 'Insight', icon: <Brain className="w-5 h-5" /> },
  { label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Care Action', icon: <CheckCircle className="w-5 h-5" /> },
];

function WorkflowBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <Section>
      <div ref={ref} className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div {...fadeUp()} animate={inView ? { opacity: 1, y: 0 } : {}} className="max-w-3xl mx-auto mb-14">
          <h3 className="text-headline mb-4">
            From signal to <span className="text-gradient-teal">care action</span>
          </h3>
          <p className="text-body">
            AI identifies patterns, surfaces insights, and enables timely intervention.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.2)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-0"
        >
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4 md:gap-0">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  {step.icon}
                </div>
                <span className="text-sm font-light text-foreground">{step.label}</span>
              </div>
              {i < workflowSteps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground mx-4 hidden md:block" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 6. VALUE ─── */
function ValueBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const columns = [
    {
      title: 'For Providers',
      items: ['Continuous patient visibility', 'Better prioritization', 'Reduced alert fatigue'],
    },
    {
      title: 'For Systems',
      items: ['Scalable care management', 'Preventive care enablement', 'Improved operational efficiency'],
    },
  ];

  return (
    <Section className="bg-card/30">
      <div ref={ref} className="container mx-auto px-6 lg:px-12 text-center">
        <motion.h3
          {...fadeUp()}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-headline mb-14"
        >
          From reactive care to <span className="text-gradient-teal">continuous intelligence</span>
        </motion.h3>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {columns.map((col, ci) => (
            <motion.div
              key={col.title}
              {...fadeUp(0.1 + ci * 0.15)}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="card-glass p-8 text-left"
            >
              <h4 className="text-lg font-light text-foreground mb-5 flex items-center gap-2">
                {ci === 0 ? <HeartPulse className="w-5 h-5 text-primary" /> : <Building2 className="w-5 h-5 text-primary" />}
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="text-body text-sm flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 7. TRUST ─── */
function TrustBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          {...fadeUp()}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground/60 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-caption uppercase tracking-widest">Positioning</span>
          </div>
          <p className="text-body text-sm italic">
            "aiOn provides insight into patterns and trends and supports care decisions. It does not diagnose or replace clinical judgment."
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── MAIN EXPORT ─── */
export function HealthcareIntelligenceSection() {
  return (
    <section id="healthcare-intelligence" className="relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial-glow opacity-20 pointer-events-none" />

      <IntroBlock />
      <UseCasesBlock />
      <DashboardBlock />
      <NotificationsBlock />
      <WorkflowBlock />
      <ValueBlock />
      <TrustBlock />
    </section>
  );
}
