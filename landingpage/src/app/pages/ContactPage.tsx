import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    lines: ["+251965031414", "+251911890936"],
    color: "#1DA4E4",
    action: "tel:+251965031414",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["yonasbezawork@gmail.com", "orders@viateadvertising.com"],
    color: "#DF8B23",
    action: "mailto:info@viateadvertising.com",
  },
  {
    icon: MapPin,
    label: "Workshop",
    lines: ["Near Ministry of Agriculture  Megenagna ግብርና ሚኒስተር  መገናኛ", "close to Bole Addis Ababa, Addis Ababa"],
    color: "#6A6A6A",
    action: "https://www.google.com/maps/search/?api=1&query=9.017428,38.811382",
  },
  {
    icon: Clock,
    label: "Business Hours",
    lines: ["Mon – Sat: 9:00 AM – 12:00 PM", "Sunday: Closed"],
    color: "#1DA4E4",
    action: null,
  },
];

type FormData = {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
};

const services = [
  "Light Box Sign",
  "Neon Sign",
  "Shadow Light Acrylic",
  "CNC Router Cutting",
  "Laser Cutting & Engraving",
  "Shop Branding",
  "Outdoor Advertising",
  "Acrylic/Foam Material Supply",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

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
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Contact Us</p>
          <h1
            className="text-4xl sm:text-5xl font-black text-foreground mb-6"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Let's Build Something Great
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tell us about your project and we'll get back to you within 24
            hours with a quote and design suggestions.
          </p>
        </div>
      </section>

      {/* Telegram Banner */}
      <div className="px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <a
            href="https://t.me/viatech2017"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-4 transition-colors hover:bg-cyan-500/15"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <p
                className="font-semibold text-cyan-500"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Prefer Telegram? Message us instantly
              </p>
              <p className="text-sm text-cyan-500/70">@viatech2017 — Usually replies within minutes</p>
            </div>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className={`p-5 rounded-xl bg-card border border-border shadow-sm ${
                  info.action ? "hover:border-primary/20 transition-colors cursor-pointer" : ""
                }`}
                onClick={() => {
                  if (info.action) window.open(info.action, "_blank");
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${info.color}12`, border: `1px solid ${info.color}25` }}
                  >
                    <info.icon className="w-5 h-5" style={{ color: info.color }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: info.color }}
                    >
                      {info.label}
                    </p>
                    {info.lines.map((line) => (
                      <p key={line} className="text-foreground text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="p-7 sm:p-9 rounded-2xl bg-card border border-border shadow-[0_18px_40px_rgba(106,106,106,0.08)]">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3
                    className="text-2xl font-black text-foreground mb-3"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Message Sent!
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Thank you for reaching out. Our team will contact you within
                    24 hours with a quote and next steps.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", phone: "", email: "", service: "", message: "" });
                    }}
                    className="mt-6 text-primary text-sm font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2
                    className="text-2xl font-black text-foreground mb-2"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Send your comments or questions
                  </h2>
                  <p className="text-muted-foreground text-sm mb-7">
                    Fill out the form below and we'll respond within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jon "
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+2519..."
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@yourcompany.com"
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Service Required *
                      </label>
                      <select
                        name="service"
                        required
                        value={form.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="" disabled>
                          Select a service...
                        </option>
                        {services.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                         Details *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Describe your comments or questions here..."
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_10px_24px_rgba(29,164,228,0.22)]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="relative col-span-full h-[380px] overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:h-[480px]">
            <iframe
              title="Viatech Advertising Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=38.801382%2C9.007428%2C38.821382%2C9.027428&layer=mapnik&marker=9.017428%2C38.811382"
              className="h-full w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
            <div className="absolute bottom-4 left-4 rounded-lg border border-border bg-card/95 px-4 py-2 backdrop-blur-sm">
              <p className="text-sm font-semibold text-foreground">Viatech Advertising</p>
              <p className="text-xs text-muted-foreground">Addis Ababa, Ethiopia</p>
            </div>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=9.017428,38.811382"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <MapPin className="h-4 w-4" />
            Open in Google Maps
          </a>
        </div>
      </section>
    </div>
  );
}
