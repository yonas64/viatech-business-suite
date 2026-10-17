import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import Navbar from "./components/viatech/Navbar";
import WhatsAppButton from "./components/viatech/WhatsAppButton";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage";
import MaterialsPage from "./pages/MaterialsPage";
import ContactPage from "./pages/ContactPage";
import LightBoxPage from "./pages/LightBoxPage";
import NeonLightPage from "./pages/NeonLightPage";
import ShadowLightPage from "./pages/ShadowLightPage";
import Footer from "./components/viatech/Footer";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function AppInner() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/light-box" element={<LightBoxPage />} />
          <Route path="/neon-light" element={<NeonLightPage />} />
          <Route path="/shadow-light" element={<ShadowLightPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
