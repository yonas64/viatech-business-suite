import { ArrowRight, PhoneCall } from "lucide-react";

type GalleryItem = {
  title: string;
  description: string;
  image: string;
  tags: string[];
};

type ServiceShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  accent: string;
  highlights: string[];
  galleryItems: GalleryItem[];
};

export default function ServiceShowcase({
  eyebrow,
  title,
  description,
  heroImage,
  accent,
  highlights,
  galleryItems,
}: ServiceShowcaseProps) {
  return (
    <div className="overflow-x-hidden pt-20">
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(29,164,228,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>
              {eyebrow}
            </p>
            <h1
              className="mb-5 text-4xl font-black text-foreground sm:text-5xl"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="tel:+251965031414"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                <PhoneCall className="h-4 w-4" />
                Order now
              </a>
              <a
                href="#gallery"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground transition hover:border-primary/30"
              >
                View gallery
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/30 to-transparent blur-3xl" style={{ backgroundColor: `${accent}12` }} />
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <img src={heroImage} alt={title} className="h-[420px] w-full object-cover sm:h-[500px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="mb-2 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                  Premium finish
                </p>
                <p className="max-w-xl text-xl font-semibold text-white sm:text-2xl">
                  Built to stand out day and night with clear visibility and striking presence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>
                Why it works
              </p>
              <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                Crafted for visibility, elegance, and impact
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-xl border border-border bg-background/70 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      <section id="gallery" className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>
                Gallery
              </p>
              <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                Explore premium options
              </h2>
            </div>
            <a href="tel:+251965031414" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
              Need a custom size? Call us now
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="columns-1 space-y-5 sm:columns-2 lg:columns-3">
            {galleryItems.map((item) => (
              <div
                key={item.title}
                className="group relative mb-5 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/25"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `${accent}12` }}
                />

                <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-5 transition-transform duration-300 group-hover:translate-y-0">
                  <span
                    className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      background: `${accent}20`,
                      color: accent,
                      border: `1px solid ${accent}40`,
                    }}
                  >
                    {item.tags[0]}
                  </span>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.description}
                  </p>
                  <div className="mt-3">
                    <a
                      href="tel:+251965031414"
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: accent }}
                    >
                      <PhoneCall className="h-4 w-4" />
                      Order now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
