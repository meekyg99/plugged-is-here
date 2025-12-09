import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Newsletter from '../components/Newsletter';
import { Seo } from '../components/Seo';

export default function HomePage() {
  return (
    <>
      <Seo
        title="Plugged | Nigerian Fashion Store"
        description="Discover authentic Nigerian fashion with curated traditional and modern designs. Shop clothes, shoes, and accessories for everyone."
      />
      <Hero />
      <ProductGrid />
      <Newsletter />
    </>
  );
}
