import Hero from "@/components/home/Hero";
import FeaturedTemplates from "@/components/home/FeaturedTemplates";
import CategoryLinks from "@/components/home/CategoryLinks";
import LegacyCollection from "@/components/home/LegacyCollection";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CategoryLinks />
      <FeaturedTemplates />
      <Testimonials />
      <LegacyCollection />
      <Newsletter />
    </div>
  );
}

