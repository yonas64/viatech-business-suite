import { Link } from "react-router";
import { ArrowRight, Cpu, Scissors, Eye, Target, Users, Factory } from "lucide-react";

const machines = [
  {
    name: "CNC Router Machine",
    spec: "4x8 ft working area, 0.1mm precision",
    desc: "Our industrial CNC router handles wood, acrylic, foam board, and aluminum composite panels with exceptional accuracy.",
    icon: Cpu,
    color: "#1DA4E4",
  },
  {
    name: "CO₂ Laser Cutter",
    spec: "130W, 1300x900mm bed",
    desc: "High-powered CO₂ laser for cutting and engraving acrylic, wood, leather, and more with clean edge finish.",
    icon: Scissors,
    color: "#DF8B23",
  },
  {
    name: "UV Flatbed Printer",
    spec: "1200dpi resolution, 2x3m",
    desc: "UV flatbed printer for direct printing on rigid substrates including acrylic, foam board, and aluminum.",
    icon: Factory,
    color: "#6A6A6A",
  },
];

const values = [
  {
    icon: Eye,
    title: "Vision",
    desc: "To be Pakistan's most trusted signage partner — delivering craftsmanship that elevates every brand we touch.",
  },
  {
    icon: Target,
    title: "Mission",
    desc: "Deliver precision-engineered, visually stunning signage with speed, reliability, and unmatched material quality.",
  },
  {
    icon: Users,
    title: "Our Team",
    desc: "A dedicated team of designers, fabricators, and installation experts with over a decade of combined experience.",
  },
];

const milestones = [
  { year: "2013", event: "Founded in Lahore with a single CNC router machine" },
  { year: "2015", event: "Added laser cutting and UV printing capabilities" },
  { year: "2017", event: "Expanded workshop to 5000 sq ft industrial facility" },
  { year: "2019", event: "Reached 200+ clients across 10 cities" },
  { year: "2021", event: "Launched premium neon light signage division" },
  { year: "2024", event: "500+ projects completed, expanding nationwide" },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden pt-20">
      {/* Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(29,164,228,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">About Us</p>
          <h1
            className="text-4xl sm:text-5xl font-black text-foreground mb-6"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            A Decade of Crafting Iconic Signage
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Viatech Advertising was born from a passion for precision and a belief
            that great branding starts with great signage.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2
              className="text-3xl font-black text-foreground mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2013 in Lahore, Viatech Advertising started as a
                small workshop with one CNC router and a team of three passionate
                craftsmen. Our founder believed that businesses deserved signage
                that truly represented their brand identity — not generic,
                cookie-cutter solutions.
              </p>
              <p>
                Over the years, we've grown into a full-service industrial
                signage company operating from a 5,000 sq ft facility equipped
                with advanced CNC routers, CO₂ lasers, and UV printing machines.
              </p>
              <p>
                Today, Viatech Advertising serves restaurants, retail chains,
                corporate offices, gyms, hospitals, and event companies across
                Pakistan. Every project we deliver carries the same commitment to
                quality that defined our very first sign.
              </p>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 mt-8 text-primary font-medium text-sm hover:gap-3 transition-all"
            >
              See our work <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 blur-md" />
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_18px_40px_rgba(106,106,106,0.12)]">
              <img
                src="https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&h=560&fit=crop&auto=format"
                alt="Viatech Advertising workshop with laser cutting machine"
                className="w-full h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-7 rounded-xl bg-card border border-border hover:border-primary/25 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3
                  className="text-xl font-bold text-foreground mb-3"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {v.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop / Machines */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-3">
              Our Workshop
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-foreground mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Industrial-Grade Machinery
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We invest in the best equipment so your signage is fabricated with
              precision every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {machines.map((m) => (
              <div
                key={m.name}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/25 transition-all hover:shadow-[0_18px_36px_rgba(106,106,106,0.08)]"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: `${m.color}10`, border: `1px solid ${m.color}25` }}
                >
                  <m.icon className="w-6 h-6" style={{ color: m.color }} />
                </div>
                <h3
                  className="font-bold text-foreground mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {m.name}
                </h3>
                <p className="text-xs font-mono text-primary/70 mb-3">{m.spec}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Workshop image */}
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_18px_40px_rgba(106,106,106,0.12)]">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=500&fit=crop&auto=format"
              alt="Viatech Advertising industrial workshop floor"
              className="w-full h-[300px] sm:h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute left-8 bottom-8">
              <p
                className="text-white text-2xl font-black mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                5,000 sq ft Workshop
              </p>
              <p className="text-white/60 text-sm">
                Fully equipped industrial facility in Lahore
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
              Our Journey
            </p>
            <h2
              className="text-3xl font-black text-foreground"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              A Decade of Growth
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-primary/15" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div className="shrink-0 w-[72px] text-right">
                    <span
                      className="text-primary font-black text-sm"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {m.year}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shrink-0" />
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-foreground text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
