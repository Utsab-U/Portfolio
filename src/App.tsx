import { useState, useEffect, useRef } from "react";
import {FiX} from "react-icons/fi"
import { profile, positions, skills, education, certifications } from "./data/portfolio";
import profilePhoto from "./assets/profile.jpg";
import { motion, AnimatePresence } from "framer-motion";
// ── Utility ──────────────────────────────────────────────────────────────────
const skillCategory: Record<string, { color: string; bg: string; border: string }> = {
  security: {
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/40",
  },
  tech: {
    color: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
  },
  management: {
    color: "text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/40",
  },
};

// ── Animated Terminal Line ────────────────────────────────────────────────────
function TerminalLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span className="block font-mono text-sm text-cyan-300">
      <span className="text-green-400">$ </span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="animate-pulse">▋</span>
      )}
    </span>
  );
}

// ── Particle Background ───────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: {
      x: number; y: number; vx: number; vy: number; size: number; opacity: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.opacity})`;
        ctx.fill();
      });

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

// ── Section Wrapper ───────────────────────────────────────────────────────────
function Section({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-3xl">{icon}</span>
          <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
        </div>
        {children}
      </div>
    </section>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ active }: { active: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Education" },
    { id: "certifications", label: "Certs" },
    { id: "contact", label: "Contact" },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b border-blue-500/20 shadow-lg shadow-blue-500/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-mono text-cyan-400 font-bold text-lg tracking-widest hover:text-cyan-300 transition-colors"
        >
          &lt;UTSAB UPRETI/&gt;
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active === l.id
                  ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-md border-b border-blue-500/20 px-6 pb-4">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="block w-full text-left py-3 text-slate-300 hover:text-cyan-400 border-b border-slate-800 last:border-0 text-sm font-medium"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedCert, setSelectedCert] = useState(null)

  useEffect(() => {
    const sections = ["about", "experience", "skills", "education", "certifications", "contact"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <ParticleCanvas />
      <Navbar active={activeSection} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center z-10"
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-mono mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              AVAILABLE FOR OPPORTUNITIES
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">
              <span className="block text-white">{profile.firstName}</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                {profile.lastName}
              </span>
            </h1>

            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="h-px w-8 bg-cyan-500" />
              <p className="text-cyan-400 font-mono text-sm md:text-base font-semibold tracking-widest uppercase">
                {profile.headline}
              </p>
              <div className="h-px w-8 bg-cyan-500" />
            </div>

            <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
              {profile.tagline}
            </p>

            {/* Terminal box */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 mb-10 max-w-md mx-auto lg:mx-0 backdrop-blur-sm">
              <div className="flex gap-1.5 mb-3">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="flex-1 text-center text-xs text-slate-600 font-mono">terminal</span>
              </div>
              <TerminalLine text={`whoami → ${profile.displayName}`} delay={300} />
              <TerminalLine text="role   → System Security Analyst" delay={1200} />
              <TerminalLine text="loc    → Kathmandu, Nepal 🇳🇵" delay={2100} />
              <TerminalLine text="status → Securing Digital Assets" delay={3000} />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <a
                href={`mailto:${profile.email}`}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                Hire Me
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                LinkedIn ↗
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-slate-600 text-slate-300 hover:bg-white/5 hover:border-slate-400 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                GitHub ↗
              </a>
            </div>
          </div>

          {/* Profile photo */}
          <div className="relative flex-shrink-0">
            {/* Animated ring */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-blue-600 opacity-20 animate-spin-slow blur-sm" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-40" />
            <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-cyan-400/30">
              <img
                src={profilePhoto}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Shield badge */}
            <div className="absolute -bottom-3 -right-3 bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="text-xs font-bold text-cyan-400">Security</p>
                <p className="text-xs text-slate-500">Analyst</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
          <span className="text-xs font-mono">scroll</span>
          <div className="w-5 h-8 border-2 border-slate-700 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-slate-600 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <Section id="about" title="About Me" icon="👤">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
              <p className="text-slate-300 leading-relaxed text-lg">
                {profile.summary}
              </p>
              <p className="text-slate-400 leading-relaxed mt-4">
                With expertise in <span className="text-cyan-400 font-semibold">threat detection</span>,{" "}
                <span className="text-cyan-400 font-semibold">log analysis</span>, and{" "}
                <span className="text-cyan-400 font-semibold">IT operations</span>, I bridge the gap between
                technical security and organizational strategy. My dual background in HR and security
                gives me a unique lens — understanding that people are both the greatest asset and the
                first line of defense.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: "📍", label: "Location", value: profile.location },
                { icon: "🏭", label: "Industry", value: profile.industry },
                { icon: "📧", label: "Email", value: profile.email, href: `mailto:${profile.email}` },
                { icon: "🔗", label: "LinkedIn", value: "utsab-upreti", href: profile.linkedin },
                { icon: "🐙", label: "GitHub", value: "UK1211KING", href: profile.github },
                { icon: "📱", label: "Contact Number", value: "+977 9813788742", href: profile.github },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl px-5 py-4 hover:border-blue-500/30 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-cyan-400 font-medium truncate block transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── EXPERIENCE ───────────────────────────────────────────────────── */}
        <Section id="experience" title="Experience" icon="💼">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/60 via-cyan-500/30 to-transparent hidden md:block" />

            <div className="flex flex-col gap-8">
              {positions.map((pos, i) => (
                <div key={i} className="relative md:pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-6 w-5 h-5 rounded-full border-2 border-cyan-400 bg-slate-950 hidden md:flex items-center justify-center -translate-x-1/2">
                    {pos.current && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm group">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {pos.title}
                        </h3>
                        <p className="text-blue-400 font-semibold">{pos.company}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                            pos.current
                              ? "bg-green-500/10 text-green-400 border border-green-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {pos.current && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                          {pos.startedOn} — {pos.finishedOn}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">📍 {pos.location}</p>
                      </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{pos.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── SKILLS ───────────────────────────────────────────────────────── */}
        <Section id="skills" title="Skills & Expertise" icon="⚡">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {skills.map((skill) => {
              const cat = skillCategory[skill.category] || skillCategory.tech;
              return (
                <div
                  key={skill.name}
                  className={`${cat.bg} ${cat.border} border rounded-xl px-5 py-4 flex items-center gap-3 hover:scale-105 transition-transform duration-200 backdrop-blur-sm`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    skill.category === "security" ? "bg-cyan-400" :
                    skill.category === "tech" ? "bg-blue-400" : "bg-indigo-400"
                  }`} />
                  <span className={`font-semibold ${cat.color}`}>{skill.name}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { label: "Security", color: "bg-cyan-400", border: "border-cyan-500/40", text: "text-cyan-400" },
              { label: "Technical", color: "bg-blue-400", border: "border-blue-500/40", text: "text-blue-400" },
              { label: "Management", color: "bg-indigo-400", border: "border-indigo-500/40", text: "text-indigo-400" },
            ].map((leg) => (
              <div key={leg.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${leg.border} bg-slate-900/40`}>
                <span className={`w-2 h-2 rounded-full ${leg.color}`} />
                <span className={`text-xs font-mono ${leg.text}`}>{leg.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── EDUCATION ────────────────────────────────────────────────────── */}
        <Section id="education" title="Education" icon="🎓">
          <div className="flex flex-col gap-6">
            {education.map((edu, i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-center gap-6 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  🎓
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{edu.school}</h3>
                  <p className="text-cyan-400 font-semibold">{edu.degree}</p>
                  {edu.startDate && (
                    <p className="text-slate-500 text-sm mt-1">
                      {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ""}
                    </p>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-mono">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CERTIFICATIONS ───────────────────────────────────────────────── */}
        <Section id="certifications" title="Certifications" icon="🏆">
          <div className="grid sm:grid-cols-2 gap-6">
            {certifications.map((cert, i) => (
              <button
                key={i}
                onClick={()=> setSelectedCert(cert)}
                rel="noopener noreferrer"
                className="block bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 backdrop-blur-sm group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    🏅
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm leading-tight group-hover:text-cyan-400 transition-colors mb-1">
                      {cert.name}
                    </h3>
                    <p className="text-blue-400 text-sm font-semibold">{cert.authority}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs text-slate-500 font-mono bg-slate-800/60 px-2 py-1 rounded-md">
                        📅 {cert.startedOn}
                        {cert.finishedOn ? ` → ${cert.finishedOn}` : ""}
                      </span>
                      {cert.licenseNumber && (
                        <span className="text-xs text-slate-600 font-mono bg-slate-800/40 px-2 py-1 rounded-md truncate max-w-full">
                          🔑 {cert.licenseNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-cyan-600 group-hover:text-cyan-400 transition-colors font-mono">
                  View Certificate ↗
                </div>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {selectedCert && (
              <motion.div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setSelectedCert(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition"
                    aria-label="Close certificate preview"
                  >
                    <FiX size={22} />
                  </button>

                  {/* Modal Header */}
                  <div className="mb-5 pr-12">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {selectedCert.name}
                    </h3>

                    <p className="text-sm text-cyan-400 mt-1">
                      {selectedCert.issuer} • {selectedCert.year}
                    </p>
                  </div>

                  {/* Certificate Image */}
                  <div className="bg-slate-950/70 rounded-xl border border-slate-700/50 p-3">
                    {selectedCert && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 rounded-2xl p-6 max-w-3xl w-full border border-slate-700 relative">

      {/* Close button */}
      <button
        onClick={() => setSelectedCert(null)}
        className="absolute top-4 right-4 text-slate-400 hover:text-white"
      >
        ✕
      </button>

      {/* 🔗 LINK (TOP) */}
      <a
        href={selectedCert.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:underline text-sm block mb-4"
      >
        🔗 View Official Certificate
      </a>

      {/* 🖼 IMAGE (BOTTOM) */}
      <img
        src={selectedCert.image}
        alt={selectedCert.name}
        className="w-full rounded-lg border border-slate-700"
      />

    </div>
  </div>
)}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── CONTACT ──────────────────────────────────────────────────────── */}
        <Section id="contact" title="Get In Touch" icon="📡">
          <div className="text-center mb-12">
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Whether you have a security challenge, an opportunity, or just want to connect —
              I'm always open to a conversation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: "📧",
                label: "Email",
                value: profile.email,
                href: `mailto:${profile.email}`,
                color: "from-blue-600/20 to-cyan-600/20",
                border: "border-blue-500/20",
                hover: "hover:border-blue-500/50",
              },
              {
                icon: "💼",
                label: "LinkedIn",
                value: "Connect with me",
                href: profile.linkedin,
                color: "from-blue-700/20 to-blue-500/20",
                border: "border-blue-600/20",
                hover: "hover:border-blue-500/50",
              },
              {
                icon: "🐙",
                label: "GitHub",
                value: "UK1211KING",
                href: profile.github,
                color: "from-slate-700/30 to-slate-600/20",
                border: "border-slate-600/30",
                hover: "hover:border-slate-500/50",
              },
              {
                icon: "📱",
                label: "Contact Number",
                value: "+977 9813788742",
                href: "tel:+977 9813788742",
                color: "from-slate-700/30 to-slate-600/20",
                border: "border-slate-600/30",
                hover: "hover:border-slate-500/50",
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-3 p-8 bg-gradient-to-br ${item.color} border ${item.border} ${item.hover} rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-1">{item.label}</p>
                  <p className="text-white font-semibold text-sm">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </Section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-slate-800/60 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500/50" />
            <span className="font-mono text-cyan-500 font-bold text-lg">&lt;UTSAB UPRETI/&gt;</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500/50" />
          </div>
          <p className="text-slate-600 text-sm font-mono">
            © {new Date().getFullYear()} {profile.displayName} · Built with passion & precision
          </p>
          <p className="text-slate-700 text-xs mt-2 font-mono">
            System Security Officer · Kathmandu, Nepal 🇳🇵
          </p>
        </footer>
      </div>
    </div>
  );
}
