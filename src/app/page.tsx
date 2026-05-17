import { FeaturedTales } from '@/src/components/home/featured-tales';
import { FinalCta } from '@/src/components/home/final-cta';
import { Hero } from '@/src/components/home/hero';
import { HowItWorks } from '@/src/components/home/how-it-works';
import { ProductPaths } from '@/src/components/home/product-paths';
import { SituationGrid } from '@/src/components/home/situation-grid';
import { TrustSection } from '@/src/components/home/trust-section';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SituationGrid />
      <ProductPaths />
      <HowItWorks />
      <FeaturedTales />
      <TrustSection />
      <FinalCta />
    </>
  );
}
