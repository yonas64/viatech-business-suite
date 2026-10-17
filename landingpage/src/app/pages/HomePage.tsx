import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";


import {
   PhoneCall ,
  ArrowRight,
  Lightbulb,
  Cpu,
  Layers,
  Scissors,
  Sparkles,
  Zap,
  Box,
  ChevronRight,
  Star,
  ShieldCheck,
  Clock,
  Award,
  Router,
} from "lucide-react";

const MONO = "'JetBrains Mono', 'Space Mono', ui-monospace, monospace";
const HEAD = "Poppins, sans-serif";
const lightbox = new URL("../images/lightbox1.png", import.meta.url).href;
const neon = new URL("../images/neon2.avif", import.meta.url).href;
const shadowlight= new URL("../images/shadowlight1.jpeg", import.meta.url).href;
const laser = new URL("../images/laser.jpg", import.meta.url).href;
const cnc= new URL("../images/router.jpg", import.meta.url).href;
const material = new URL("../images/mica1.png", import.meta.url).href;
const heroBg = new URL("../images/hero-bg.jpeg", import.meta.url).href;
const whyviatech = new URL("../images/whyviatech.jpg", import.meta.url).href;
const services = [
  {
    code: "LB-01",
    icon: lightbox,
    title: "Light Box Signs",
    desc: "Single-sided, double-sided & round light boxes for maximum brand visibility.",
    color: "#1DA4E4",
    link: "/light-box",
    previewLabel: "Illuminated branding",
  },
  {
    code: "NL-02",
    icon: neon,
    title: "Neon Light Signage",
    desc: "Custom neon signs for indoor and outdoor use — vibrant, energy-efficient.",
    color: "#DF8B23",
    link: "/neon-light",
    previewLabel: "Bright visual impact",
  },
  {
    code: "SL-03",
    icon: shadowlight,
    title: "Shadow Light Acrylic",
    desc: "Premium acrylic shadow light signs that add depth and luxury to branding.",
    color: "#6A6A6A",
    link: "/shadow-light",
    previewLabel: "Luxury edge finish",
  },
  {
    code: "CR-04",
    icon: cnc,
    title: "CNC Router Cutting",
    desc: "Precision CNC router cutting for complex shapes and custom designs.",
    color: "#1DA4E4",
    link: "/services",
    previewLabel: "Precision fabrication",
  },
  {
    code: "LC-05",
    icon: laser,
    title: "Laser Cutting & Engraving",
    desc: "High-precision laser services for acrylic, wood, and metal materials.",
    color: "#DF8B23",
    link: "/services",
    previewLabel: "Detailed engraving",
  },
  {
    code: "AF-06",
    icon: material,
    title: "Acrylic & Foam Boards",
    desc: "Quality acrylic sheets (2mm, 3mm) and foam boards (5mm, 10mm, 18mm).",
    color: "#6A6A6A",
    link: "/materials",
    previewLabel: "Material supply",
  },
];

const portfolioItems = [
  {
    job: "JOB-0142",
    title: "Dubai Restaurant Signage",
    category: "Light Box",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&auto=format",
    accent: "#1DA4E4",
  },
  {
    job: "JOB-0139",
    title: "Fashion Boutique Neon",
    category: "Neon Sign",
    img: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&h=400&fit=crop&auto=format",
    accent: "#DF8B23",
  },
  {
    job: "JOB-0133",
    title: "Corporate Lobby Branding",
    category: "Shadow Light",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
    accent: "#6A6A6A",
  },
  {
    job: "JOB-0128",
    title: "Gym Outdoor Signage",
    category: "CNC Cut",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&auto=format",
    accent: "#1DA4E4",
  },
  {
    job: "JOB-0121",
    title: "Café Round Light Box",
    category: "Light Box",
    img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&auto=format",
    accent: "#DF8B23",
  },
  {
    job: "JOB-0114",
    title: "Mall Directory Boards",
    category: "Branding",
    img: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=600&h=400&fit=crop&auto=format",
    accent: "#6A6A6A",
  },
];

const stats = [
  { value: "500+", label: "Projects Delivered" },
  { value: "10+", label: "Years Experience" },
  { value: "200+", label: "Happy Clients" },
  { value: "48hr", label: "Avg. Turnaround" },
];

const whyUs = [
  {
    icon: ShieldCheck,
    title: "Premium Quality Materials",
    desc: "We source only top-grade acrylic, LEDs, and hardware for long-lasting signage.",
  },
  {
    icon: Cpu,
    title: "Advanced Machinery",
    desc: "Industrial CNC routers and laser cutters for millimeter-precise fabrication.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    desc: "We understand deadlines. Fast production with no compromise on quality.",
  },
  {
    icon: Award,
    title: "End-to-End Service",
    desc: "Design, fabrication, and on-site installation — we handle everything.",
  },
];

const clients = [
  "McDonald's", "KFC", "Daraz", "PIA", "Bank Alfalah", "Unilever", "Haier", "Pepsi",
];

/** Registration-mark corner brackets — echoes the alignment marks used on a laser-cut file. */
function CornerMarks({
  color = "currentColor",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  const base = "absolute w-3 h-3 transition-opacity duration-300";
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ color }}>
      <span className={`${base} top-0 left-0 border-t-2 border-l-2 border-current`} />
      <span className={`${base} top-0 right-0 border-t-2 border-r-2 border-current`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2 border-current`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2 border-current`} />
    </div>
  );
}

/** Scroll-triggered reveal: fades content up into place once it enters the viewport. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
}: {
  as?: any;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

/**
 * Tracks 0→1 scroll progress across the combined height of a wrapped block
 * (from the moment its top enters the viewport to the moment its bottom leaves it).
 * Used to drive the morphing 3D background in sync with how far the user has
 * scrolled through the Hero + Stats zone.
 */
function useBlockScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh;
      const traveled = vh - rect.top;
      const p = Math.min(1, Math.max(0, traveled / total));
      // Only trigger a re-render when the value actually moved, to keep this cheap.
      if (Math.abs(p - progressRef.current) > 0.0015) {
        progressRef.current = p;
        setProgress(p);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
    };
  }, []);
  return { ref, progress };
}

/**
 * Realistic backlit channel letter — like a physical illuminated sign letterform
 * (dark returns, glowing face, soft light pooling on the surface below it).
 */
function ChannelLetterScene({ progress: _progress }: { progress: number }) {
  return (
    // <div className="three-d-scene" aria-hidden="true">
    //   <div className="three-d-aurora three-d-aurora--blue" />
    //   <div className="three-d-aurora three-d-aurora--gold" />
    //   <div className="three-d-grid" />

    //   <div className="channel-letter-stage">
    //     <div className="channel-letter-floor" />
    //     <div
    //       className="channel-letter"
    //       style={{ transform: `perspective(900px) rotateY(${tilt}deg) rotateX(4deg)` }}
    //     >
    //       V
    //     </div>
    //   </div>
    // </div>
    <div
      className="hero-image-bg"
      style={{ backgroundImage: `url(${heroBg})` }}
    />
  );
}

/** A neon sign hanging on a wall by two short chains, with an ambient wall-wash glow and a flicker. */
function NeonWallScene({ progress }: { progress: number }) {
  const sway = Math.sin(progress * Math.PI * 2) * 3; // gentle hanging sway as you scroll
  return (
    <div className="neon-wall-scene" aria-hidden="true">
      <div className="neon-wall-glow" />
      <div className="neon-wall-mount" />
      <div className="neon-wall-chain neon-wall-chain--l" />
      <div className="neon-wall-chain neon-wall-chain--r" />
      <div className="neon-wall-sign" style={{ transform: `rotate(${sway}deg)` }}>
        <span className="neon-wall-letter">V</span>
      </div>
    </div>
  );
}

/** A small CNC router gantry: the carriage tracks scroll progress and the cut groove grows behind it. */
function CncMachineScene({ progress }: { progress: number }) {
  const travel = 8 + progress * 84; // % across the rail, driven directly by scroll
  return (
    <div className="cnc-machine-scene" aria-hidden="true">
      <div className="cnc-machine-glow" />
      <div className="cnc-frame">
        <div className="cnc-rail cnc-rail--top" />
        <div className="cnc-material">
          <div className="cnc-groove" style={{ width: `${Math.max(4, travel)}%` }} />
        </div>
        <div className="cnc-carriage" style={{ left: `${travel}%` }}>
          <div className="cnc-carriage-body" />
          <div className="cnc-carriage-bit" />
          <span className="cnc-spark cnc-spark--one" />
          <span className="cnc-spark cnc-spark--two" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { ref: heroRef, progress: heroProgress } = useBlockScrollProgress<HTMLElement>();
  const { ref: servicesRef, progress: servicesProgress } = useBlockScrollProgress<HTMLElement>();
  const { ref: portfolioRef, progress: portfolioProgress } = useBlockScrollProgress<HTMLElement>();

  return (
    <div className="overflow-x-hidden">
      <style>{`
        @keyframes laserSweep {
          0% { top: -8%; opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { top: 108%; opacity: 0; }
        }
        @keyframes neonFlicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
          20%, 23.5%, 55% { opacity: 0.4; }
        }
        @keyframes signBuzz {
          0%, 100% { box-shadow: 0 0 0 1px rgba(29,164,228,0.18), 0 18px 42px rgba(106,106,106,0.08), 0 0 40px rgba(29,164,228,0.06); }
          50% { box-shadow: 0 0 0 1px rgba(29,164,228,0.32), 0 18px 42px rgba(106,106,106,0.08), 0 0 60px rgba(29,164,228,0.14); }
        }
        @keyframes sceneDrift { 0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } 50% { transform: translate3d(5vw, -4vh, 0) rotate(10deg); } }
        @keyframes gridGlide { from { transform: perspective(700px) rotateX(66deg) translateY(15%); } to { transform: perspective(700px) rotateX(66deg) translateY(0%); } }
        @keyframes orbFloat { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); } 50% { transform: translate3d(24px, -32px, 50px) scale(1.08); } }
        @keyframes cubeTurn { from { transform: rotateX(58deg) rotateZ(25deg) rotateY(0deg); } to { transform: rotateX(58deg) rotateZ(25deg) rotateY(360deg); } }
        // .three-d-scene { position: absolute; inset: 0; overflow: hidden; pointer-events: none; background: radial-gradient(circle at 50% 30%, #102b46 0%, #070d18 48%, #040811 100%); }
        // .three-d-aurora { position: absolute; width: 42rem; height: 42rem; border-radius: 999px; filter: blur(58px); opacity: .34; animation: sceneDrift 14s ease-in-out infinite; }
        // .three-d-aurora--blue { top: -17rem; left: -12rem; background: #079bdc; }
        // .three-d-aurora--gold { right: -13rem; bottom: -21rem; background: #df8b23; animation-delay: -7s; }
        // .three-d-grid { position: absolute; left: -30%; bottom: -58%; width: 160%; height: 105%; transform-origin: center bottom; background-image: linear-gradient(rgba(102, 206, 255, .19) 1px, transparent 1px), linear-gradient(90deg, rgba(102, 206, 255, .19) 1px, transparent 1px); background-size: 54px 54px; mask-image: linear-gradient(to bottom, transparent, black 38%, black); opacity: .65; animation: gridGlide 9s linear infinite alternate; }
        // .three-d-orb { position: absolute; border-radius: 999px; border: 1px solid rgba(255,255,255,.3); background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.85), rgba(29,164,228,.42) 22%, rgba(4,23,40,.12) 63%); box-shadow: inset -24px -26px 42px rgba(0,0,0,.4), 0 16px 46px rgba(29,164,228,.23); animation: orbFloat 8s ease-in-out infinite; }
        // .three-d-orb--one { width: 7rem; height: 7rem; right: 9%; top: 18%; }
        // .three-d-orb--two { width: 3.5rem; height: 3.5rem; left: 8%; bottom: 18%; opacity: .7; animation-delay: -4s; }
        // .three-d-cube { position: absolute; width: 5.5rem; aspect-ratio: 1; border: 1px solid rgba(139,221,255,.38); background: linear-gradient(135deg, rgba(29,164,228,.2), rgba(223,139,35,.07)); box-shadow: 18px 18px 32px rgba(0,0,0,.23), inset 0 0 24px rgba(255,255,255,.1); animation: cubeTurn 22s linear infinite; }
        // .three-d-cube--one { right: 26%; bottom: 18%; }
        // .three-d-cube--two { width: 3rem; left: 37%; top: 13%; opacity: .55; animation-duration: 16s; animation-direction: reverse; }
        // .three-d-scene--compact .three-d-aurora { opacity: .24; transform: scale(.7); }
        // .three-d-scene--compact .three-d-grid { bottom: -105%; opacity: .42; }
        // .three-d-scene--compact .three-d-orb--one { right: 3%; top: -2rem; transform: scale(.7); }
        // .three-d-scene--compact .three-d-orb--two, .three-d-scene--compact .three-d-cube--two { display: none; }

        /* ── Hero: backlit channel letter (matches reference photo) ── */
        .channel-letter-stage { position: absolute; inset: 0; display: flex; align-items: center; justify-content: right; padding-right: 8%; perspective: 1000px; }
        .channel-letter-floor { position: absolute; bottom: 16%; width: 58%; max-width: 26rem; height: 2.6rem; border-radius: 999px; filter: blur(22px); opacity: .6; background: radial-gradient(ellipse at center, rgba(29,164,228,.85) 0%, rgba(29,164,228,.25) 45%, transparent 75%); }
       
        .hero-image-bg { position: absolute; inset: 0; background-size:auto 100%; background-position: right; background-repeat: no-repeat;filter: brightness(1) contrast(1.12); }
        .channel-letter { position: relative; font-family: 'Poppins', sans-serif; font-weight: 900; font-size: clamp(15rem, 25vw, 23rem); line-height: 1; color: #eef9ff; letter-spacing: -.02em;
        text-shadow: 1px 1px 0 #0e3a52, 2px 2px 0 #0e3a52, 3px 3px 0 #0c334a, 4px 4px 0 #0a2c41, 5px 5px 0 #082539, 6px 6px 0 #061e30, 7px 8px 14px rgba(0,0,0,.55), 0 0 22px rgba(139,221,255,.95), 0 0 55px rgba(29,164,228,.85), 0 0 110px rgba(29,164,228,.55);
          animation: channelLetterGlow 3.6s ease-in-out infinite; }
        @keyframes channelLetterGlow { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.2); } }

        // /* ── Services: neon sign hanging on a wall ── */
        // .neon-wall-scene { position: relative; width: 100%; height: 100%; }
        // .neon-wall-glow { position: absolute; inset: -20%; border-radius: 999px; background: radial-gradient(circle at 50% 35%, rgba(223,139,35,.35), transparent 65%); filter: blur(6px); }
        // .neon-wall-mount { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 2.2rem; height: .4rem; border-radius: .2rem; background: #2a2a2a; box-shadow: 0 1px 3px rgba(0,0,0,.4); }
        // .neon-wall-chain { position: absolute; top: .4rem; width: 1px; height: 1.6rem; background: rgba(255,255,255,.35); }
        // .neon-wall-chain--l { left: calc(50% - .5rem); }
        // .neon-wall-chain--r { left: calc(50% + .5rem); }
        // .neon-wall-sign { position: absolute; top: 2rem; left: 50%; transform-origin: top center; margin-left: -4.5rem; width: 9rem; height: 9rem; border-radius: 1.1rem; border: 3px solid #DF8B23; display: flex; align-items: center; justify-content: center; background: rgba(223,139,35,.05); box-shadow: 0 0 16px #DF8B23, 0 0 44px rgba(223,139,35,.7), inset 0 0 20px rgba(223,139,35,.45); animation: neonFlicker 4.4s infinite; }
        // .neon-wall-letter { font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 4rem; color: #ffd9a3; text-shadow: 0 0 12px #DF8B23, 0 0 30px rgba(223,139,35,.8); }

        /* ── Portfolio: CNC gantry machine (carriage tracks scroll) ── */
        // .cnc-machine-scene { position: relative; width: 100%; height: 100%; }
        // .cnc-machine-glow { position: absolute; inset: 10%; border-radius: 1.4rem; background: radial-gradient(circle at 50% 40%, rgba(29,164,228,.28), transparent 70%); filter: blur(4px); }
        // .cnc-frame { position: absolute; inset: 0; border-radius: 1.1rem; border: 1px solid rgba(139,221,255,.28); background: rgba(7,17,30,.55); padding: 1.4rem 1.1rem; display: flex; flex-direction: column; justify-content: flex-end; gap: .6rem; overflow: hidden; }
        // .cnc-rail--top { position: absolute; top: 1.6rem; left: 1rem; right: 1rem; height: 2px; background: linear-gradient(90deg, transparent, rgba(139,221,255,.7), transparent); }
        // .cnc-material { position: relative; height: 2.6rem; border-radius: .4rem; background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02)); border: 1px solid rgba(255,255,255,.18); overflow: hidden; }
        // .cnc-groove { position: absolute; top: 50%; left: 0; height: 3px; transform: translateY(-50%); background: linear-gradient(90deg, rgba(223,139,35,.9), rgba(223,139,35,.2)); box-shadow: 0 0 8px rgba(223,139,35,.8); transition: width .1s linear; }
        // .cnc-carriage { position: absolute; top: 1.1rem; transform: translateX(-50%); transition: left .1s linear; display: flex; flex-direction: column; align-items: center; }
        // .cnc-carriage-body { width: 1.8rem; height: 1.2rem; border-radius: .3rem; background: linear-gradient(180deg, #dfe7ec, #8b98a3); box-shadow: 0 3px 8px rgba(0,0,0,.5); }
        // .cnc-carriage-bit { width: .3rem; height: 1rem; background: linear-gradient(#eaf3f7, #6A6A6A); margin-top: 1px; animation: cncSpin .4s linear infinite; transform-origin: center; }
        // @keyframes cncSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        // .cnc-spark { position: absolute; bottom: -2px; width: 3px; height: 3px; border-radius: 999px; background: #fff; box-shadow: 0 0 6px 2px #DF8B23; animation: cncSparkFly .9s ease-out infinite; }
        // .cnc-spark--one { left: 40%; animation-delay: 0s; }
        // .cnc-spark--two { left: 60%; animation-delay: .4s; }
        @keyframes cncSparkFly { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(14px, -16px) scale(.2); opacity: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .anim-sweep, .anim-flicker, .anim-buzz, .three-d-scene *, .neon-wall-sign, .cnc-carriage-bit, .cnc-spark { animation: none !important; }
        }
      `}</style>




    <section
      ref={heroRef}
      className="relative isolate flex min-h-[90vh] sm:min-h-screen items-center justify-center overflow-hidden bg-[#070d18] pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8"
    >
      <ChannelLetterScene progress={heroProgress} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070d18]/45 via-transparent to-[#070d18]/30 pointer-events-none" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 sm:gap-14 lg:grid-cols-12">
        
        {/* Left Column: Hero Text Content */}
        <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8">
          

          {/* Main Headline */}
          <h1 
            className="text-4xl sm:text-4xl lg:text-1xl font-black leading-[1.08] tracking-tight text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            We build signs that make your brand <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#4cc3ff] to-[#DF8B23]">impossible to ignore</span>.
          </h1>

          {/* Body Subtext */}
          <p className="max-w-xl text-sm sm:text-lg leading-relaxed text-slate-300">
            From precision CNC laser cutting to striking light boxes and neon displays we elevate your business storefront with premium fabrication.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              to="/products"
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-4 text-sm font-bold text-white shadow-lg shadow-primary/2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1aa6e6] hover:shadow-primary/9 active:translate-y-0"
            >
              <span>Explore Portfolio</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white/10 hover:text-white"
            >
              <PhoneCall className="h-4 w-4 text-[#DF8B23]" />
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Line*/}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-400 text-xs">
          
          </div>
        </div>

     

      </div>
    </section>
  

      {/* ── STATS BAR ── */}
      <section className="relative isolate overflow-hidden border-y border-white/10 bg-[#07111e] text-white">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 80}
                className="relative text-center"
              >
                {i > 0 && (
                  <span className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-px h-8 bg-white/15" />
                )}
                <p
                  className="text-3xl font-black text-primary mb-1"
                  style={{ fontFamily: MONO }}
                >
                  {s.value}
                </p>
                <p className="text-slate-300 text-sm">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section ref={servicesRef} className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:block absolute top-10 right-6 xl:right-16 w-56 h-64 pointer-events-none">
          <NeonWallScene progress={servicesProgress} />
        </div>

        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <p
              className="text-primary text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ fontFamily: MONO }}
            >
              What We Do
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-foreground mb-4"
              style={{ fontFamily: HEAD }}
            >
              Complete Signage Solutions
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From concept to installation.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 60}>
                <Link to={svc.link} className="group block h-full">
                  <div className="relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(106,106,106,0.12)] dark:bg-card dark:border-border dark:shadow-none">
                    <CornerMarks
                      color={svc.color}
                      className="opacity-0 group-hover:opacity-60 m-2"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                      style={{
                        background: `radial-gradient(ellipse at top left, ${svc.color}08 0%, transparent 60%)`,
                      }}
                    />

                    <div className="relative mb-5 overflow-hidden rounded-lg border border-border/70 bg-slate-50 dark:bg-slate-900/60">
  <img
    src={svc.icon}
    alt={svc.title}
    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
  />

  <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 backdrop-blur">
    <p
      className="text-[11px] font-semibold uppercase tracking-[0.2em]"
      style={{ color: svc.color }}
    >
      {svc.previewLabel}
    </p>
  </div>
</div>

                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3
                          className="mb-2 text-lg font-bold text-slate-900 dark:text-foreground"
                          style={{ fontFamily: HEAD }}
                        >
                          {svc.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-muted-foreground">
                          {svc.desc}
                        </p>
                      </div>
                      <span
                        className="ml-3 shrink-0 text-[11px] tracking-wider text-slate-500 transition-colors group-hover:text-slate-700 dark:text-muted-foreground/50 dark:group-hover:text-muted-foreground/80"
                        style={{ fontFamily: MONO }}
                      >
                        {svc.code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/70 dark:border-slate-800">
                      <span className="text-sm font-semibold" style={{ color: svc.color }}>
                        Explore this service
                      </span>
                      <div
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: svc.color }}
                      >
                        More
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all duration-200"
            >
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO PREVIEW ── */}
      <section
        ref={portfolioRef}
        className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 bg-muted/70 dark:bg-slate-900/70"
      >
        <div className="hidden lg:block absolute top-10 left-6 xl:left-16 w-64 h-56 pointer-events-none">
          <CncMachineScene progress={portfolioProgress} />
        </div>

        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <p
              className="text-secondary text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ fontFamily: MONO }}
            >
              Featured Projects
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-foreground mb-4"
              style={{ fontFamily: HEAD }}
            >
              Our Work Speaks
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Signage solutions delivered to restaurants, boutiques, corporations,
              and more across Pakistan.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolioItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 50}>
                <div className="group relative rounded-xl overflow-hidden bg-card border border-border aspect-[4/3] shadow-sm">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `${item.accent}15` }}
                  />
                  <CornerMarks
                    color="#fff"
                    className="opacity-0 group-hover:opacity-50 m-3 transition-opacity duration-300"
                  />
                  <span
                    className="absolute top-3 left-3 text-[10px] tracking-wider text-white/70"
                    style={{ fontFamily: MONO }}
                  >
                    {item.job}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
                      style={{
                        background: `${item.accent}22`,
                        color: item.accent,
                        border: `1px solid ${item.accent}40`,
                      }}
                    >
                      {item.category}
                    </span>
                    <p
                      className="text-white font-bold"
                      style={{ fontFamily: HEAD }}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-secondary/30 text-secondary text-sm font-semibold hover:bg-secondary/5 hover:border-secondary/60 transition-all duration-200"
              style={{ fontFamily: HEAD }}
            >
              View Full Portfolio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: image */}
            <Reveal className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_18px_40px_rgba(106,106,106,0.12)]">
                <img
                  src={whyviatech}
                  alt="Viatech workshop with CNC machinery"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                <CornerMarks color="#ffffff" className="m-4 opacity-70" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-card border border-primary/20 rounded-xl px-5 py-4 shadow-[0_16px_32px_rgba(106,106,106,0.14)]">
                <p
                  className="text-2xl font-black text-primary"
                  style={{ fontFamily: MONO }}
                >
                  10+
                </p>
                <p className="text-xs text-muted-foreground">Years in Business</p>
              </div>
            </Reveal>

            {/* Right: points */}
            <Reveal delay={120}>
              <p
                className="text-primary text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ fontFamily: MONO }}
              >
                Why Viatech
              </p>
              <h2
                className="text-3xl sm:text-4xl font-black text-foreground mb-6"
                style={{ fontFamily: HEAD }}
              >
                Built for Businesses That Mean Business
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We are a full-service industrial signage company with our own
                workshop, CNC machines, and laser cutters. No middlemen — just
                quality from our floor to your storefront.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {whyUs.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p
                        className="font-semibold text-foreground text-sm mb-1"
                        style={{ fontFamily: HEAD }}
                      >
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all"
                >
                  Learn about our workshop <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
      
          <Reveal
  className="anim-buzz relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-10 shadow-[0_16px_44px_rgba(2,6,23,0.28)] sm:p-16 dark:from-slate-950/95 dark:to-slate-900/30 dark:border-slate-700/60 dark:shadow-[0_18px_46px_rgba(2,6,23,0.35)]"
  delay={0}
>
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ animation: "signBuzz 3.4s ease-in-out infinite" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/8 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/8 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#ffcc00] fill-[#ffcc00]" />
                ))}
              </div>
              <h2
                className="mb-4 text-3xl font-black text-white sm:text-4xl"
                style={{ fontFamily: HEAD }}
              >
                Ready to Illuminate Your Brand?
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-slate-300">
                Get in touch with us today. Tell us about your project and we&rsquo;ll
                get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-[0_12px_26px_rgba(29,164,228,0.22)]"
                  style={{ fontFamily: HEAD }}
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+251965031414"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md font-semibold text-[#25d366] border border-[#25d366]/30 hover:bg-[#25d366]/5 transition-all"
                  style={{ fontFamily: HEAD }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Call Now
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
