import ServiceShowcase from "../components/viatech/ServiceShowcase";

// Resolve local asset URLs. 
// Note: I am using the exact spelling ("shadowight") as it appears in your VS Code folder structure.
const shadowlight1 = new URL("../images/shadowlight1.jpeg", import.meta.url).href;
const shadowlight2 = new URL("../images/shadowlight2.jpg", import.meta.url).href;
const shadowlight3 = new URL("../images/shadowlight3.jpg", import.meta.url).href;
const shadowlight4 = new URL("../images/shadowlight4.jpg", import.meta.url).href;

const galleryItems = [
  {
    title: "Shadow Light Acrylic Sign",
    description: "A premium acrylic sign that creates depth and a soft glow for luxurious interiors.",
    image: shadowlight1, // Using local variable
    tags: ["Luxury", "Acrylic", "Interior"],
  },
  {
    title: "Corporate Lobby Branding",
    description: "Elevate reception areas and offices with polished signage that feels refined and modern.",
    image: shadowlight2, // Using local variable
    tags: ["Lobby", "Corporate", "Premium"],
  },
  {
    title: "Hotel Wall Signage",
    description: "Add a glamorous edge that blends architectural beauty with illuminated branding.",
    image: shadowlight3, // Using local variable
    tags: ["Hospitality", "Elegant", "Backlit"],
  },
  {
    title: "Brand Identity Panel",
    description: "Make your logo and brand story feel bold, crisp, and memorable in premium materials.",
    image: shadowlight4, // Using local variable
    tags: ["Identity", "Logo", "Statement"],
  },
];

export default function ShadowLightPage() {
  return (
    <ServiceShowcase
      eyebrow="Shadow Light Acrylic"
      title="Shadow Light Signs With a Luxury Finish"
      description="Blend modern geometry, depth, and soft illumination to create elegant signage that feels premium from every angle."
      heroImage="shadowlight4"
      accent="#6A6A6A"
      highlights={[
        "Clean shadow depth and elegant backlighting",
        "Premium acrylic and precision finishing",
        "Ideal for offices, hotels, and retail branding",
        "Made to match a luxury visual identity",
      ]}
      galleryItems={galleryItems}
    />
  );
}