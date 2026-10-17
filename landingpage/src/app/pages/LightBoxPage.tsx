import ServiceShowcase from "../components/viatech/ServiceShowcase";

// 1. Image resolutions (Fixed lightbox3 extension and a typo)
const lightbox1 = new URL("../images/lightbox1.png", import.meta.url).href;
const lightbox2 = new URL("../images/lightbox2.png", import.meta.url).href;
const lightbox3 = new URL("../images/lightbox3.png", import.meta.url).href; 
const roundlightbox4 = new URL("../images/round lightbox4.jpeg", import.meta.url).href;
const roundlightbox5 = new URL("../images/round lightbox 5.webp", import.meta.url).href; 
const roundLightbox6 = new URL("../images/round lightbox6.jpg", import.meta.url).href;

const galleryItems = [
  {
    title: "Light Box",
    description: "Clean, bright storefront presentation with strong visibility from one direction.",
    image: lightbox1, // Removed quotes to reference the variable
    tags: ["Storefront", "Retail", "Single-face"],
  },
   {   
    title: "Light Box",
    description: "Clean, bright storefront presentation with strong visibility from one direction.",
    image: lightbox2, // Removed quotes
    tags: ["Storefront", "Retail", "Single-face"],
  },
  {
    title: "Light Box",
    description: "Clean, bright storefront presentation with strong visibility from one direction.",
    image: lightbox3, // Removed quotes
    tags: ["Storefront", "Retail", "Single-face"],
  },
  {
    title: "Round Light Box",
    description: "A stylish circular option that adds elegance and premium presence to modern shops.",
    image: roundlightbox4, // Removed quotes
    tags: ["Round", "Premium", "Boutique"],
  },
  {
    title: "Round Light Box",
    description: "A stylish circular option that adds elegance and premium presence to modern shops.",
    image: roundlightbox5, // Removed quotes
    tags: ["Round", "Premium", "Boutique"],
  },
  {
    title: "Round Light Box",
    description: "A stylish circular option that adds elegance and premium presence to modern shops.",
    image: roundLightbox6, // Removed quotes
    tags: ["Round", "Premium", "Boutique"],
  },
  {
    title: "Custom Light Box Frame",
    description: "Tailor-made dimensions, finishes, and branding layouts to match your business identity.",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&h=700&fit=crop&auto=format",
    tags: ["Custom size", "Branding", "Luxury"],
  },
];

export default function LightBoxPage() {
  return (
    <ServiceShowcase
      eyebrow="Light Box Signs"
      title="Light Box Signage That Glows With Confidence"
      description="Showcase your brand with bold illuminated signage that looks premium at any hour. From single-sided retail boards to elegant round displays, our light boxes combine clear visibility with a polished finish."
      heroImage="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=900&fit=crop&auto=format"
      accent="#1DA4E4"
      highlights={[
        "High-brightness LED illumination",
        "Weather-resistant aluminum and acrylic construction",
        "Custom shapes, sizes, and branding layouts",
        "Perfect for storefronts, malls, and road-facing signage",
      ]}
      galleryItems={galleryItems}
    />
  );
}