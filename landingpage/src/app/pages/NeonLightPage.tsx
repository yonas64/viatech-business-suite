import ServiceShowcase from "../components/viatech/ServiceShowcase";

// Resolve local asset URLs matching your folder structure's file extensions
const neon1 = new URL("../images/neon1.jpg", import.meta.url).href;
const neon2 = new URL("../images/neon2.avif", import.meta.url).href;
const neon4 = new URL("../images/neon4.jpg", import.meta.url).href;

const galleryItems = [
  {
    title: "Indoor Neon Sign",
    description: "Vibrant, energy-efficient LED neon for interior walls, lounges, and boutiques.",
    image: neon1, // Using local variable without quotes
    tags: ["Indoor", "Modern", "LED"],
  },
  {
    title: "Outdoor Neon Sign",
    description: "Weather-safe signage that keeps your business visible and attractive at night.",
    image: neon2, // Using local variable without quotes
    tags: ["Outdoor", "Weatherproof", "Night view"],
  },
  {
    title: "Custom Letter Neon",
    description: "Create a dramatic signature look with letters and logos that glow with character.",
    image: neon4, // Using local variable without quotes
    tags: ["Letters", "Logo", "Custom design"],
  },
  {
    title: "Event Neon Wall",
    description: "A striking neon feature wall for events, cafes, and brand activations.",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&h=700&fit=crop&auto=format",
    tags: ["Events", "Feature wall", "Social media"],
  },
];

export default function NeonLightPage() {
  return (
    <ServiceShowcase
      eyebrow="Neon Light Signage"
      title="Neon Signs That Make Your Brand Glow"
      description="Bring a vibrant, modern edge to your business with custom neon signage designed for visibility, atmosphere, and lasting impact."
      heroImage="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&h=900&fit=crop&auto=format"
      accent="#DF8B23"
      highlights={[
        "Energy-efficient LED neon technology",
        "Elegant lettering, logos, and shapes",
        "Indoor and outdoor-ready installation",
        "Perfect for cafés, boutiques, and nightlife brands",
      ]}
      galleryItems={galleryItems}
    />
  );
}