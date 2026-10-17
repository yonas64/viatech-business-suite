import { Link } from "react-router";
import { Layers, Package, CheckCircle2 } from "lucide-react";

const mica1 = new URL("../images/mica1.png", import.meta.url).href;
const mica2 = new URL("../images/mica2.png", import.meta.url).href;
const foam1 = new URL("../images/foam1.png", import.meta.url).href;
const foam2 = new URL("../images/foam2.png", import.meta.url).href;
const foam3 = new URL("../images/foam3.png", import.meta.url).href;

const foamPreviewImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 160'>
  <rect width='240' height='160' rx='24' fill='#f8fafc'/>
  <rect x='34' y='28' width='172' height='104' rx='20' fill='#fffefc' stroke='#cbd5e1' stroke-width='2'/>
  <rect x='46' y='40' width='148' height='80' rx='14' fill='#fdfefe' stroke='#e2e8f0' stroke-width='1.5'/>
  <path d='M64 120c18-14 37-20 58-20 22 0 41 7 58 20' stroke='#cbd5e1' stroke-width='3' fill='none'/>
  <circle cx='80' cy='86' r='10' fill='#fef3c7' fill-opacity='0.9'/>
  <circle cx='160' cy='74' r='8' fill='#e2e8f0'/>
</svg>
`)}`;

const micaColors = [
  { name: "Clear", hex: "#f8fafc", tone: "linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)" },
  { name: "White", hex: "#f8fafc" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Black", hex: "#111827" },
  { name: "Orange", hex: "#f59e0b" },
  { name: "Yellow", hex: "#fde047" },
];

const acrylicSheets = [
  {
    thickness: "2mm",
    weight: "size: 122cm x 244cm",
    desc: "Thin, lightweight acrylic ideal for precision cutout letters, backlit displays, and decorative elements.",
    uses: ["Backlit letters", "Thin display panels", "Decorative screens", "Product displays"],
    colors: micaColors,
    bestFor: "Small signs, precision cutouts",
    price: "5,000 ETB",
    previewImage: mica1,
  },
  {
    thickness: "3mm",
    weight: "size: 122cm x 244cm ",
    desc: "The most popular thickness for signage — strong enough for standalone signs, light enough for wall mounting.",
    uses: ["Main signage panels", "Light diffusers", "Office nameplates", "Menu boards"],
    colors: micaColors,
    bestFor: "General signage, medium panels",
    price: "7,000 ETB",
    previewImage: mica2,
  },
];

const foamBoards = [
  {
    thickness: "5mm",
    density: "Light",
    desc: "Lightweight and flexible foam board for short-term indoor displays, backdrops, and presentation boards.",
    uses: ["Event backdrops", "Exhibition stands", "Presentation boards", "Temporary signs"],
    finish: "Smooth white surface",
    bestFor: "Events, presentations, indoor",
    price: "2,500 ETB",
    previewImage: foam2,
  },
  {
    thickness: "10mm",
    density: "Medium",
    desc: "Balanced rigidity and weight for robust indoor signs, shop displays, and photo mounting.",
    uses: ["Shop window boards", "Photo prints", "Retail displays", "Photography backdrops"],
    finish: "Smooth white surface",
    bestFor: "Retail displays, photo mounting",
    price: "4,200 ETB",
    previewImage: foam3,
  },
  {
    thickness: "18mm",
    density: "Heavy-Duty",
    desc: "Thick, highly rigid foam board for structural display builds, large panels, and stage set pieces.",
    uses: ["Stage sets", "Large structures", "Mounting boards", "Outdoor temporary signage"],
    finish: "Smooth white surface",
    bestFor: "Large structures, stage builds",
    price: "7,000 ETB",
    previewImage: foam1,
  },
];

const foamPriceList = [
  { thickness: "5mm", price: "5,000 ETB" },
  { thickness: "5mm Dense", price: "3,000 ETB" },
  { thickness: "8mm", price: "3,500 ETB" },
  { thickness: "10mm", price: "4,200 ETB" },
  { thickness: "15mm", price: "6,000 ETB" },
  { thickness: "18mm", price: "7,000 ETB" },
];

const whyQuality = [
  "UV-stable materials for long outdoor life",
  "Consistent thickness across full sheet",
  "Clean edges for precise laser/CNC cutting",
  "Available in standard 4x8 ft sheets",
  "Cut-to-size service available on request",
  "Bulk orders with competitive pricing",
];

export default function MaterialsPage() {
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
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Materials</p>
          <h1
            className="text-4xl sm:text-5xl font-black text-foreground mb-6"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Premium Raw Materials
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We supply top-quality acrylic sheets and foam boards at affordable
            market prices — available for direct purchase or cut-to-size.
          </p>
        </div>
      </section>

      {/* Acrylic Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <Layers className="w-6 h-6 text-primary" />
            <h2
              className="text-2xl font-black text-foreground"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Acrylic (Mica) Sheets
            </h2>
            <div className="h-px flex-1 bg-primary/15" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {acrylicSheets.map((sheet) => (
              <div
                key={sheet.thickness}
                className="rounded-xl bg-card border border-border p-7 hover:border-primary/25 transition-colors shadow-sm"
              >
                <div className="relative mb-5 overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background via-background to-primary/5 p-2">
                  <img src={sheet.previewImage} alt={`${sheet.thickness} acrylic sheet preview`} className="h-36 w-full rounded-lg object-cover" />
                </div>

                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3
                      className="text-3xl font-black text-primary"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {sheet.thickness}
                    </h3>
                    <p className="text-muted-foreground text-sm">Acrylic Sheet</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      {sheet.weight}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{sheet.desc}</p>

                <div className="mb-5 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80 mb-1">Price</p>
                  <p className="text-lg font-black text-primary">{sheet.price}</p>
                </div>

                

                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Available Colors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sheet.colors.map((color) => (
                      <span
                        key={color.name}
                        className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-xs text-foreground"
                        style={{ background: color.tone ?? color.hex }}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Common Uses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sheet.uses.map((u) => (
                      <span
                        key={u}
                        className="px-2.5 py-0.5 rounded text-xs bg-primary/8 text-primary/80 border border-primary/15"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>


                <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{sheet.bestFor}</span>
                    <span className="text-xs font-semibold text-primary">Market Price</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Foam Board Section */}
      <section className="py-10 pb-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <Package className="w-6 h-6 text-secondary" />
            <h2
              className="text-2xl font-black text-foreground"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Foam Boards
            </h2>
            <div className="h-px flex-1 bg-secondary/15" />
          </div>

        

          <div className="mb-6 rounded-xl border border-border bg-background/70 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Foam Board Price List</p>
              <span className="text-xs text-muted-foreground">White color only</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {foamPriceList.map((item) => (
                <div key={item.thickness} className="rounded-lg border border-border bg-card/80 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{item.thickness}</p>
                  <p className="text-sm font-black text-secondary">{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {foamBoards.map((board) => (
              <div
                key={board.thickness}
                className="p-6 rounded-xl bg-card border border-border hover:border-secondary/25 transition-colors shadow-sm"
              >
                <div className="relative mb-4 overflow-hidden rounded-xl border border-secondary/10 bg-gradient-to-br from-background via-background to-secondary/5 p-2">
                  <img src={board.previewImage} alt={`${board.thickness} foam board preview`} className="h-32 w-full rounded-lg object-cover" />
                </div>
                <p
                  className="text-3xl font-black text-secondary mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {board.thickness}
                </p>
                <p className="text-xs text-muted-foreground mb-4">{board.density} Foam Board</p>
                <div className="mb-4 rounded-lg border border-secondary/10 bg-secondary/5 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary/80">Price</p>
                  <p className="text-sm font-black text-secondary">{board.price}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{board.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {board.uses.map((u) => (
                    <span
                      key={u}
                      className="px-2 py-0.5 rounded text-xs bg-secondary/8 text-secondary/80 border border-secondary/15"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Why Our Materials</p>
              <h2
                className="text-3xl font-black text-foreground mb-6"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Quality You Can See and Feel
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We source our acrylic sheets and foam boards from certified
                suppliers. Whether you're a small business owner or a large
                fabrication shop, you get the same premium quality at fair market prices.
              </p>
              <ul className="space-y-3">
                {whyQuality.map((q) => (
                  <li key={q} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground text-sm">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
<div className="relative p-8 rounded-2xl border border-primary/15 bg-card">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl" />

  <div className="relative z-10">
    <h3
      className="text-2xl font-black text-foreground mb-3"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      Ready to Place an Order?
    </h3>

    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
      Call us directly to place your order quickly. If you need product
      information, pricing, or expert assistance, visit our contact page and
      we'll be happy to help.
    </p>

    <div className="flex flex-col gap-3">
      {/* Call Button */}
      <a
        href="tel:+251965031414"
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-[0_10px_24px_rgba(29,164,228,0.2)]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.548 2.19a2 2 0 01-.502 1.91l-1.27 1.27a16.04 16.04 0 006.364 6.364l1.27-1.27a2 2 0 011.91-.502l2.19.548A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        Call to Order
      </a>

      {/* Contact Page */}
      <Link
        to="/contact"
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold border border-primary/20 text-primary hover:bg-primary/5 transition-all"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Contact Us for More Information
      </Link>
    </div>
  </div>
</div>
          </div>
        </div>
      </section>
    </div>
  );
}
