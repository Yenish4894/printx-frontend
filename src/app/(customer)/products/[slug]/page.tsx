"use client";

import { use } from "react";
import ProductConfigurator from "@/components/customer/ProductConfigurator";

export default function ConfiguratorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <ProductConfigurator slug={slug} />;
}
