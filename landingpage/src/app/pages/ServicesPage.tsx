import { Link } from "react-router";
import { ArrowRight, Cpu, Scissors, Wrench, Store, Layers, Tag } from "lucide-react";

const router_service = new URL("../images/router_service.jpeg", import.meta.url).href;
const lasser_service = new URL("../images/lasser_service.jpg", import.meta.url).href;
const sign_fabrication = new URL("../images/lightbox1.png", import.meta.url).href;
const branding = new URL("../images/branding_service.jpeg", import.meta.url).href;
const led = new URL("../images/led.png", import.meta.url).href;

const services = [
  {
    icon: Cpu,
    title: "CNC Router Cutting",
    tagline: "Precision at Every Millimeter",
    color: "#1DA4E4",
    priceRange: "1,500 - 8,500 ETB",
    priceUnit: "per sheet / project",
    desc: "Our industrial CNC router machines deliver precise cuts on acrylic, wood, aluminum composite, and foam board materials. Complex shapes, lettering, logos, and decorative panels — all executed with sub-millimeter accuracy.",
    capabilities: [
      "Acrylic letter cutting",
      "ACP (aluminum composite) routing",
      "Foam board shaping",
      "Wooden sign boards",
      "Complex logo cutouts",
      "Large-format panels",
    ],
    img: router_service,
  },
  {
    icon: Scissors,
    title: "Laser Cutting & Engraving",
    tagline: "Detail That Impresses",
    color: "#DF8B23",
    priceRange: "800 - 5,000 ETB",
    priceUnit: "per design / batch",
    desc: "Our CO₂ laser cutter handles intricate designs that CNC can't achieve. From fine filigree patterns to precise engraving on acrylic, leather, wood, and glass — the results are clean, professional, and detailed.",
    capabilities: [
      "Acrylic laser cutting",
      "Logo engraving on products",
      "Wooden plaque engraving",
      "Leather & fabric cutting",
      "Frosted glass effect",
      "Awards & trophies",
    ],
    img: lasser_service,
  },
  {
    icon: Wrench,
    title: "Sign Fabrication",
    tagline: "From Concept to Installation",
    color: "#6A6A6A",
    priceRange: "12,000 - 65,000 ETB",
    priceUnit: "depending on scale & lighting",
    desc: "Complete sign fabrication including light boxes (single, double-sided, round), neon signs, shadow light acrylic signs, and flex boards. We handle electrical wiring, LED fitting, and structural framing in-house.",
    capabilities: [
      "LED light box fabrication",
      "Neon sign bending & wiring",
      "Shadow light acrylic assembly",
      "Structural steel framing",
      "LED module installation",
      "On-site installation service",
    ],
    img: sign_fabrication,
  },
  {
    icon: Store,
    title: "Business Branding",
    tagline: "Make Your Storefront Unmissable",
    color: "#1DA4E4",
    priceRange: "25,000 - 150,000+ ETB",
    priceUnit: "full shopfront package",
    desc: "Complete shop front branding packages — from design to installation. We handle facade signage, window graphics, interior branding, hanging signs, and menu boards to give your store a cohesive premium identity.",
    capabilities: [
      "Facade signage design",
      "Window vinyl graphics",
      "Interior wall branding",
      "Menu board design & print",
      "Hanging & projecting signs",
      "Brand color consistency",
    ],
    img: branding,
  },
  {
    icon: Layers,
    title: "Material Supply",
    tagline: "Quality Raw Materials",
    color: "#6A6A6A",
    priceRange: "2,200 - 9,000 ETB",
    priceUnit: "per standard sheet",
    desc: "We supply premium acrylic (mica) sheets in 2mm and 3mm thickness, and foam boards in 5mm, 10mm, and 18mm — available at affordable market prices for businesses and fabricators.",
    capabilities: [
      "Acrylic sheets (2mm, 3mm)",
      "Foam boards (5mm, 10mm, 18mm)",
      "Various colors & finishes",
      "Bulk orders welcome",
      "Cut-to-size service",
      "Same-day pickup available",
    ],
    img: led,
  },
];

const process = [
  { step: "01", title: "Consultation", desc: "Share your requirements and we'll advise on the best solution for your brand and budget." },
  { step: "02", title: "Design", desc: "Our team creates design mockups for your approval before any fabrication begins." },
  { step: "03", title: "Fabrication", desc: "Your sign is crafted in our workshop using premium materials and precision machinery." },
  { step: "04", title: "Quality Check", desc: "Every piece is inspected before delivery to ensure it meets our standards." },
  { step: "05", title: "Installation", desc: "Our team installs your signage on-site with professional finishing." },
];

export default function ServicesPage() {
  return (
    <div className="overflow-x-hidden pt-16 sm:pt-20">
      {/* Header */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(29,164,228,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2 sm:mb-3">
            Services & Pricing
          </p>
          <h1
            className="text-3xl sm:text-5xl font-black text-foreground mb-4 sm:mb-6 leading-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Full-Service Signage & Fabrication
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From CNC cutting to complete shop branding — Viatech handles every
            aspect of your signage project with transparent estimated pricing.
          </p>
        </div>
      </section>

      {/* Services Cards Section */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className={`group flex flex-col ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-0 lg:gap-8 rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors shadow-sm`}
            >
              {/* Image Container with Price Badge Overlay */}
              <div className="w-full lg:w-[42%] xl:w-[35%] shrink-0 relative overflow-hidden bg-muted h-60 sm:h-72 lg:h-auto">
                <img
                  src={svc.img}
                  alt={svc.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background: `linear-gradient(135deg, ${svc.color}30, transparent)`,
                  }}
                />

                {/* Mobile/Overlay Price Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-background/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {svc.priceRange}
                  </span>
                </div>
              </div>

              {/* Card Content Container */}
              <div className="flex-1 p-5 sm:p-7 lg:p-9 flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                  <div
                    className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{
                      background: `${svc.color}15`,
                      color: svc.color,
                      border: `1px solid ${svc.color}30`,
                    }}
                  >
                    <svc.icon className="w-3.5 h-3.5" />
                    Service
                  </div>

                  {/* Desktop Price Range Display */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/80 border border-border">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {svc.priceRange}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({svc.priceUnit})
                    </span>
                  </div>
                </div>

                <h2
                  className="text-xl sm:text-2xl font-black text-foreground mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {svc.title}
                </h2>

                <p className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4" style={{ color: svc.color }}>
                  {svc.tagline}
                </p>

                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                  {svc.desc}
                </p>

                {/* Capabilities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
                  {svc.capabilities.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: svc.color }}
                      />
                      <span className="text-muted-foreground text-xs sm:text-sm">{c}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA & Mobile Price Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <span className="sm:hidden text-xs text-muted-foreground">
                    Estimated Range: <strong className="text-foreground">{svc.priceRange}</strong> ({svc.priceUnit})
                  </span>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold py-2 px-4 sm:px-0 rounded-lg bg-primary/10 sm:bg-transparent transition-all hover:gap-3"
                    style={{ color: svc.color }}
                  >
                    Get exact quote <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2 sm:mb-3">
              How We Work
            </p>
            <h2
              className="text-2xl sm:text-3xl font-black text-foreground"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Our Process
            </h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-4">
            {/* Mobile Vertical Timeline Line */}
            <div className="sm:hidden absolute left-5 top-5 bottom-5 w-0.5 bg-primary/20 -z-0" />

            {process.map((p, i) => (
              <div key={p.step} className="relative flex sm:block items-start gap-4 text-left sm:text-center z-10">
                {/* Desktop Horizontal Line Connector */}
                {i < process.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-1/2 w-full h-px bg-primary/20 -z-10" />
                )}

                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shrink-0 shadow-sm sm:mx-auto">
                  <span
                    className="text-primary font-black text-xs sm:text-sm"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {p.step}
                  </span>
                </div>

                <div className="pt-0.5 sm:pt-4">
                  <h4
                    className="font-bold text-foreground text-sm mb-1"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {p.title}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}