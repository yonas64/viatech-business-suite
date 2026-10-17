import { useState } from "react";

const filters = ["All", "Light Box", "Neon Sign", "CNC Cut", "Shadow Light", "Branding"];

const projects = [
  {
    title: "The Burger Lab Facade",
    category: "Light Box",
    location: "Lahore, DHA",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=420&fit=crop&auto=format",
    accent: "#1DA4E4",
  },
  {
    title: "Zara Boutique Neon",
    category: "Neon Sign",
    location: "Karachi, Clifton",
    img: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&h=560&fit=crop&auto=format",
    accent: "#DF8B23",
  },
  {
    title: "Tech Park Corporate Lobby",
    category: "Shadow Light",
    location: "Islamabad, Blue Area",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=420&fit=crop&auto=format",
    accent: "#6A6A6A",
  },
  {
    title: "FitZone Gym Outdoor Board",
    category: "CNC Cut",
    location: "Lahore, Johar Town",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=420&fit=crop&auto=format",
    accent: "#1DA4E4",
  },
  {
    title: "Brewed Café Round Sign",
    category: "Light Box",
    location: "Lahore, Gulberg",
    img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=520&fit=crop&auto=format",
    accent: "#DF8B23",
  },
  {
    title: "Centaurus Mall Directory",
    category: "Branding",
    location: "Islamabad, F-8",
    img: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=600&h=420&fit=crop&auto=format",
    accent: "#6A6A6A",
  },
  {
    title: "Sapphire Retail Neon",
    category: "Neon Sign",
    location: "Lahore, MM Alam",
    img: "https://images.unsplash.com/photo-1595665593673-bf1ad72905c0?w=600&h=440&fit=crop&auto=format",
    accent: "#1DA4E4",
  },
  {
    title: "Bank Alfalah Branch Sign",
    category: "Light Box",
    location: "Karachi, Saddar",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=420&fit=crop&auto=format",
    accent: "#DF8B23",
  },
  {
    title: "CNC Laser Art Panel",
    category: "CNC Cut",
    location: "Lahore, Liberty",
    img: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&h=500&fit=crop&auto=format",
    accent: "#6A6A6A",
  },
  {
    title: "Hotel Crown Corporate ID",
    category: "Branding",
    location: "Rawalpindi, Saddar",
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=420&fit=crop&auto=format",
    accent: "#1DA4E4",
  },
  {
    title: "Daraz Warehouse Signage",
    category: "Shadow Light",
    location: "Lahore, Sundar",
    img: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&h=460&fit=crop&auto=format",
    accent: "#DF8B23",
  },
  {
    title: "Urban Salon Neon Wall",
    category: "Neon Sign",
    location: "Islamabad, F-7",
    img: "https://images.unsplash.com/photo-1542396601-dca920ea2807?w=600&h=420&fit=crop&auto=format",
    accent: "#6A6A6A",
  },
];

export default function PortfolioPage() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

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
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Portfolio</p>
          <h1
            className="text-4xl sm:text-5xl font-black text-foreground mb-6"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Work We're Proud Of
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Browse through 500+ completed projects across Pakistan — from
            neon signs to CNC-cut branding installations.
          </p>

          {/* Filter pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active === f
                    ? "bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(29,164,228,0.2)]"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filtered.map((project) => (
              <div
                key={project.title}
                className="group relative break-inside-avoid rounded-xl overflow-hidden bg-card border border-border hover:border-primary/25 transition-all duration-300 shadow-sm"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.img}
                    alt={project.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `${project.accent}12` }}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
                    style={{
                      background: `${project.accent}20`,
                      color: project.accent,
                      border: `1px solid ${project.accent}40`,
                    }}
                  >
                    {project.category}
                  </span>
                  <p
                    className="text-white font-bold text-sm"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {project.title}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No projects in this category yet.
            </div>
          )}

          <div className="text-center mt-16">
            <p className="text-muted-foreground text-sm mb-6">
              Want to see your project here?
            </p>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-[0_10px_24px_rgba(29,164,228,0.22)]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Start Your Project
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
