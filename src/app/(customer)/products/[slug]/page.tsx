import type { Metadata } from "next";
import ProductConfigurator from "@/components/customer/ProductConfigurator";
import { PRODUCT_SLUGS, getProduct } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: `Bhagini Graphics | ${product.name}` };
}

export default async function ConfiguratorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  const related = product.related.map(getProduct);
  return <ProductConfigurator product={product} related={related} />;
}
