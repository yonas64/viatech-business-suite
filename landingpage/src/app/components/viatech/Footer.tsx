import { Link } from "react-router";
import { Phone, Mail, MapPin, Clock, Zap } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Products", path: "/products" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Materials", path: "/materials" },
  { label: "Contact", path: "/contact" },
];

const services = [
  "Light Box Signs",
  "Neon Light Signage",
  "Shadow Light Acrylic",
  "CNC Router Cutting",
  "Laser Cutting & Engraving",
  "Acrylic (Mica) Sheets",
  "Foam Boards",
];

export default function Footer() {
  return (
    <footer className="bg-slate-950/95 border-t border-primary/20 text-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span
                className="font-bold text-lg text-white"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Viatech <span className="text-[#DF8B23]">Advertising</span>
              </span>
            </Link>
          
            <div className="flex flex-wrap gap-2">
              <a
                href="https://wa.me/251965031414"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[#25d366]/30 bg-[#25d366]/10 px-4 py-2 text-sm font-medium text-[#25d366] transition-colors hover:bg-[#25d366]/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <a
                href="https://t.me/viatech2017"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                </svg>
                Telegram
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://www.instagram.com/viatech777"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-400 transition-colors hover:bg-pink-500/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                </svg>
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@viatechadvertising1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-slate-400/30 bg-slate-500/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-500/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M14.5 2h2.3c.4 2.2 1.8 3.6 4.2 4.2v2.4c-1.5.2-2.9-.2-4.2-1v7.2a6.2 6.2 0 1 1-6.2-6.2c.2 0 .4 0 .6.1v2.3a3.9 3.9 0 1 0 2.2 3.6V2Z" />
                </svg>
                TikTok
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-sm font-semibold text-white uppercase tracking-widest mb-5"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
              className="text-slate-300 text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
       
          {/* Contact */}
          <div>
            <h4
              className="text-sm font-semibold text-white uppercase tracking-widest mb-5"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#DF8B23] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">+251 965 031 414</p>
                  <p className="text-sm text-slate-300">+251 911 890 936</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#DF8B23] mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">yonasbezawork@gmail.com</p>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#DF8B23] mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">
                  Near Ministry of Agriculture, Megenagna,<br />close to Bole, Addis Ababa, Ethiopia
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#DF8B23] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">Mon – Sat: 9:00 AM – 12:00 PM</p>
                  <p className="text-sm text-slate-300">Sunday: Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-300 text-sm">
            © {new Date().getFullYear()} Viatech Advertising. All rights reserved.
          </p>
         
        </div>
      </div>
    </footer>
  );
 
}
