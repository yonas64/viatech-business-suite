const singleLightBox = new URL("../images/lightbox1.png", import.meta.url).href;
const doubleLightBox = new URL("../images/lightbox2.png", import.meta.url).href;
const roundLightBox = new URL("../images/round lightbox4.jpeg", import.meta.url).href;
const indoorNeon = new URL("../images/neon1.jpg", import.meta.url).href;
const outdoorNeon = new URL("../images/neon4.jpg", import.meta.url).href;
const shadowLight = new URL("../images/shadowlight1.jpeg", import.meta.url).href;
const mica2mm = new URL("../images/mica1.png", import.meta.url).href;
const mica3mm = new URL("../images/mica2.png", import.meta.url).href;
const foam5mm = new URL("../images/foam1.png", import.meta.url).href;
const foam10mm = new URL("../images/foam2.png", import.meta.url).href;
const foam18mm = new URL("../images/foam3.png", import.meta.url).href;

const products = [
  {
    category: "Light Box Signs",
    color: "#1DA4E4",
    items: [
      {
        name: "Single-Sided Light Box",
        desc: "Illuminated signage with single-face display. Perfect for storefronts and wall mounting.",
        uses: ["Retail stores", "Restaurants", "Pharmacies", "Banks"],
        img: singleLightBox,
      },
      {
        name: "Double-Sided Light Box",
        desc: "Displays from both sides — ideal for high-traffic pedestrian areas and suspended installations.",
        uses: ["Malls", "Airports", "Petrol stations", "Street signs"],
        img: doubleLightBox,
      },
      {
        name: "Round Light Box",
        desc: "Circular or custom-shaped illuminated boxes for unique brand identity.",
        uses: ["Cafés", "Boutiques", "Salons", "Lounges"],
        img: roundLightBox,
      },
    ],
  },
  {
    category: "Neon Light Signage",
    color: "#DF8B23",
    items: [
      {
        name: "Indoor Neon Sign",
        desc: "Custom LED neon signs for interior branding, social media walls, and ambient lighting.",
        uses: ["Restaurants", "Studios", "Event spaces", "Offices"],
        img: indoorNeon,
      },
      {
        name: "Outdoor Neon Sign",
        desc: "Weather-resistant neon signage built for outdoor environments with high visibility.",
        uses: ["Storefronts", "Hotels", "Nightlife", "Commercial buildings"],
        img: outdoorNeon,
      },
    ],
  },
  {
    category: "Shadow Light Acrylic Signage",
    color: "#6A6A6A",
    items: [
      {
        name: "Shadow Light Acrylic Sign",
        desc: "Premium backlit acrylic letters that create dramatic shadow effects on wall surfaces.",
        uses: ["Corporate offices", "Luxury brands", "Hotel lobbies", "Reception areas"],
        img: shadowLight,
      },
    ],
  },
  {
    category: "Acrylic (Mica) Sheets",
    color: "#1DA4E4",
    items: [
      {
        name: "2mm Acrylic Sheet",
        desc: "Thin, lightweight acrylic for precision cutout letters, displays, and decorative elements.",
        uses: ["Cutout letters", "Display panels", "Small signs", "Interior decor"],
        img: mica2mm,
      },
      {
        name: "3mm Acrylic Sheet",
        desc: "Standard thickness acrylic ideal for medium signs, panels, and framed displays.",
        uses: ["Medium signs", "Menu boards", "Office directories", "Branding panels"],
        img: mica3mm,
      },
    ],
  },
  {
    category: "Foam Boards",
    color: "#DF8B23",
    items: [
      {
        name: "5mm Foam Board",
        desc: "Lightweight foam board for indoor display boards, temporary signage, and backdrops.",
        uses: ["Event backdrops", "Exhibition stands", "Indoor displays", "Presentations"],
        img: foam5mm,
      },
      {
        name: "10mm Foam Board",
        desc: "Medium-density foam board for robust indoor signs and structured display panels.",
        uses: ["Retail displays", "Shop boards", "Photo walls", "Structural panels"],
        img: foam10mm,
      },
      {
        name: "18mm Foam Board",
        desc: "Thick, rigid foam board for heavy-duty display structures and mounting surfaces.",
        uses: ["Large structures", "Outdoor temporary", "Mounting boards", "Stage sets"],
        img: foam18mm,
      },
    ],
  },
];

export default function ProductsPage() {
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
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Products</p>
          <h1
            className="text-4xl sm:text-5xl font-black text-foreground mb-6"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Everything You Need to Stand Out
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our full range of signage products. Every item is
            fabricated in-house with premium materials.
          </p>
        </div>
      </section>

      {/* Products by category */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          {products.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="h-px flex-1 max-w-[48px]"
                  style={{ background: cat.color }}
                />
                <h2
                  className="text-2xl font-black text-foreground"
                  style={{ fontFamily: "Poppins, sans-serif", color: cat.color }}
                >
                  {cat.category}
                </h2>
                <div
                  className="h-px flex-1"
                  style={{ background: `${cat.color}20` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="group rounded-xl bg-card border border-border hover:border-primary/25 overflow-hidden transition-all duration-300 hover:shadow-[0_18px_36px_rgba(106,106,106,0.08)]"
                  >
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/20 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3
                        className="font-bold text-foreground mb-2"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {item.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {item.desc}
                      </p>
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-2"
                          style={{ color: cat.color }}
                        >
                          Common Uses
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.uses.map((u) => (
                            <span
                              key={u}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                background: `${cat.color}10`,
                                color: `${cat.color}cc`,
                                border: `1px solid ${cat.color}20`,
                              }}
                            >
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
