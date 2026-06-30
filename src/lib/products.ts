// Static product catalog powering the slug-driven configurator (UI prototype data;
// will be replaced by the admin-configured catalog from the backend later).

export type Opt = { label: string; price: number };
export type QtyTier = { qty: number; price: number };

export type Product = {
  slug: string;
  name: string;
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
  image: string;
  thumbs: string[];
  unit: string; // e.g. "pcs", "sheets", "boxes"
  specs: [string, string][];
  paperLabel?: string; // section title for the "papers" group
  papers?: Opt[];
  sizes?: Opt[];
  sides?: Opt[];
  finishings?: Opt[];
  qtyTiers: QtyTier[];
  related: string[];
};

const IMG = {
  bc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqo6OkW0seixYLiw8xs5ICd3Omr3RhzP75FJc-oEeVyfBjeeF0MfOgLoPJnUdMTSDFHakEIbMbVEcvbsgR0Hxv8zpTtMzbu3YcZ_FUrKz9UAwwgA-alWBxj_hl93C07I0hSwgbZa4fgaUMrD-Lv5VI9QtfX2kR6KnoopHCbrC_LxmRu0jn1unKBd6ALckxOdM-eUvSPIqsmG0eaPw12ZBIJ3zm435v8G6y6TZT5EmUVD2T99UZUrPbsDImBy7z_DJV03GdzcH1tY4",
  bcT2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNinPzoMtuBXIqn2W4Wwk0WhLCDcFzSItFf4ddWdIsVYK9HXX8w3cZsdV0LdURkxvle6tm9LJCo3S2_paEh4uahIrZ5-qm3DWfmDxKSPk3h9Ze_VSmoWOiKCxErDbhb9oZ_ZkYE35i0TbQnmpV1QTqznxz7hFLjsAjNah1CTm9AAknDzE5CtzvuTjjPbVSDsP6EK7zh4eYMk_8Tpez6afa1QRveVLURp4EbmhtvmKbKK33JIBQPmnHoCD1BVW6Da9q1DNkKQhbUJo",
  bcT3: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIVtMgcSo-jUT5CREBouultvG0dVAtr_5qhkXE5da4eeZ6VJJH_c6cKvMiJoPM9Ra7E2MMw_qBhdzm38V52rWSaj_27genOXEyaE2cUN1MZuRAkQaUznCTsZmQsE3Jj8S3rGJRfA95xl-36PpeaQUMMomOdVDVX4debmKxONo-sevmdBl5yCQWUX8ZIfMcc1ZriMilX9JzQ9L0XXm3-OPvNL0L_WWgvPrl7XQuGKNTQO83ZzBxOI7Vj-cfefY8xNzQ6QGYUMW0vLg",
  exec: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMd-bEzzAR4c7mA4RjLyc2BathZWU54zo46QjEApb3quT5MURup6e1jkjUtZMmknRqtmujSXZyakeeOjACP5RggO56Cp6IkZAiufwa5MfWxPpVKKeWFTCURLod2bAiOPJfDdxO_6JY25Dzyar1N_dmO2RCk_1Zr99cBVQRDPl6m-XGTrT3F9LfRm6wD1JGvL0P4m_1UucGs4r7aqIFoM0eMAEif7EhQgaNJrw9CIM87xnvYrxiH13i1AsxPu2gL7C07zy3v1YaDnk",
  brochure: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL3F0ONaV6xSuJEQKtpJvZXkjV85aPnUS8H5KFgm3fQfJfva5yHG4DgYO9UL-J-JZZuJC3S518pQl2vkjzFKzIH-I7n-1qwTWHrqleU50srav9GyzkJpwlC37Ml5QVQ0k-3Cvq-B2pEKD2mX2E82qJb_qtMxSrOCDX6fZGlj_ltfPbAXNFjRwF_3tKhdW4kq2FyF70XtP4paLmBbH684R-8biqfPRQKt4zh-adE30PsNCbZrt3N2s82j9G2xpjV8S3fJuXgODvj_k",
  poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuBePVDm5i4NTZ74p79vqqYHdh6Qki45IfxUmb5I4ceoxtduj3NfxKjl5AJn3-QF5XQswhAxwEMJr_LsQfBFZHVzA1Tt16a1602jznScavCkYxPRwXBWmH2UBng9XKcisP2yPHUO0vNqJifwagSI_zzbOHZF2ok6jubuv_wwXAAAr7NQ7P6l2Wr7ZM84Oaf4YRTC6-WzVJKhowQzqs9jtQQBrckP0_-jj4AW_D4O5upkaBeJE0agziVaaYYRwLkbGoR3fGTLtY8wiBc",
  packaging: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwLUoeRd7oLtExsu1F8ZLoVkOsA4cRoh1q2dgF1IYBTTmdEIzAO-abwkZasFcEkF3XAm0zSxgoBl_624QPd6kGoKqtjkBP9atXp_qZOVec6d72ekC527BVWFf43OG2evZBVuCIQHsEgtX5ngJiqp0NGbnhelwS8hIhrwfZSmwc4jG9nStZi4SBtFHrcDrzkK8JNRkvS-MbMLxC3ronA_1IFljNrEIfs9FL24haSuiqaUjzAuJNWyFQeso7EHnceSa3L3he6VP_Y10",
  letterhead: "https://lh3.googleusercontent.com/aida-public/AB6AXuCo1cOowFAIPHif2NXaaMu25SjqzYCfAiZari1poIiT4CLMWTOHSqfFu-H-TYVFHYnutOH8pWx_X4W26GXmj96pQ1NBa4DPD87PhClkGNVbiucZ2MSmiyDQRK3bK4B0FZkp58OPMIKs6ZiDSUAoQWZkbi_kHPbD2TzfDgVec5peEB9uMmMBBkr7vD9RvUf_ZLJ1fKcLsTzzGfZ6zxyuMS961LfM0xRfUpX01vc39POi0tJJk_9iTEpQa8r0tk7WKep15b68jTtX8vM",
  envelope: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6WYMkRGYVi2H7kHZnyn5GX7Exl8loECPn8y1zqyAK0TIh4NY4IVUXUoVPuTPyys7SgkIZboxYJV_x8YYq0j_Nwewj43fNbxdhaVU1GYuww7PngczThcr8RcTdGoQ9HOoLPIlQTkIf5jQve0U7AY8jvOgJrTX-hkBVdbErlqg6URAzFCk8Fy9Q1nmqaOBItDYklADANJuGuzh8tcMUX49SlvpYQgwanhhSDYsXLks9dBzxFHPnHgMIYS_WTMTJwi5SrHpUSArqw4o",
  sticker: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFwzvZWQ-jnN6eedH99iYzKpq7FkInEF-DpvUOXUZdhx9e1LiiEn7MYuNyRwNEDsT4k6KsgIG5aGVvbAErFVzQzTF1TPdKE7nfpaXRh5aBnn_N6ITEdmnpHebo6zu6VffiLq9juNd8KeO5SXHVJCboGoY9xnGtizTar6Ia8iHya-Y9IPwx2KBZajVam9aNTUrXeFcWzYsP5cNH40ijCg3SyTMpTCtrPgwUnbvO2AaizCtc7gUsN7Mf-D_vjK6dqh_0cB81NS6xpys",
};

const thumbsFor = (main: string): string[] => [main, IMG.bcT2, IMG.bcT3];

export const PRODUCTS: Record<string, Product> = {
  "business-cards": {
    slug: "business-cards",
    name: "Premium Business Cards",
    category: "Business Stationery",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 312,
    image: IMG.bc,
    thumbs: thumbsFor(IMG.bc),
    unit: "pcs",
    specs: [
      ["Category", "Business Stationery"],
      ["Standard Size", "85 × 55 mm"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "100 Pieces"],
      ["File Format", "PDF, AI, PSD, PNG"],
      ["Bleed Area", "3 mm around"],
    ],
    papers: [
      { label: "Matte 350gsm", price: 0 },
      { label: "Glossy 350gsm", price: 20 },
      { label: "Silk Finish", price: 50 },
      { label: "Kraft Paper", price: 30 },
      { label: "Premium Linen", price: 150 },
    ],
    sizes: [
      { label: "Standard", price: 0 },
      { label: "Square", price: 30 },
      { label: "Folded", price: 50 },
      { label: "Custom", price: 50 },
    ],
    sides: [
      { label: "Single", price: 0 },
      { label: "Double", price: 60 },
    ],
    finishings: [
      { label: "None", price: 0 },
      { label: "Spot UV", price: 80 },
      { label: "Gold Foil", price: 200 },
    ],
    qtyTiers: [
      { qty: 100, price: 299 },
      { qty: 250, price: 549 },
      { qty: 500, price: 899 },
      { qty: 1000, price: 1599 },
      { qty: 2500, price: 3499 },
      { qty: 5000, price: 5999 },
    ],
    related: ["letterheads", "branded-envelopes", "die-cut-stickers"],
  },

  "executive-stationery": {
    slug: "executive-stationery",
    name: "Executive Stationery",
    category: "Corporate Identity",
    badge: "Premium",
    rating: 4.7,
    reviews: 184,
    image: IMG.exec,
    thumbs: thumbsFor(IMG.exec),
    unit: "sheets",
    specs: [
      ["Category", "Corporate Identity"],
      ["Standard Size", "A4 (210 × 297 mm)"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "100 Sheets"],
      ["File Format", "PDF, AI, PSD"],
      ["Bleed Area", "3 mm around"],
    ],
    papers: [
      { label: "Bond 120gsm", price: 0 },
      { label: "Executive Linen", price: 40 },
      { label: "Recycled 100gsm", price: 20 },
      { label: "Cotton Premium", price: 90 },
    ],
    sizes: [
      { label: "A4", price: 0 },
      { label: "A5", price: 20 },
      { label: "Custom", price: 50 },
    ],
    sides: [
      { label: "Single", price: 0 },
      { label: "Double", price: 40 },
    ],
    finishings: [
      { label: "None", price: 0 },
      { label: "Spot UV", price: 70 },
      { label: "Foil Emboss", price: 150 },
    ],
    qtyTiers: [
      { qty: 100, price: 1250 },
      { qty: 250, price: 2750 },
      { qty: 500, price: 4999 },
      { qty: 1000, price: 8999 },
    ],
    related: ["business-cards", "letterheads", "branded-envelopes"],
  },

  "trifold-brochures": {
    slug: "trifold-brochures",
    name: "Trifold Brochures",
    category: "Marketing Collateral",
    badge: "Bulk Value",
    rating: 4.8,
    reviews: 226,
    image: IMG.brochure,
    thumbs: thumbsFor(IMG.brochure),
    unit: "pcs",
    specs: [
      ["Category", "Marketing Collateral"],
      ["Standard Size", "A4 Tri-fold"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "100 Pieces"],
      ["File Format", "PDF, AI, PSD"],
      ["Bleed Area", "3 mm around"],
    ],
    paperLabel: "Paper Stock",
    papers: [
      { label: "Glossy 170gsm", price: 0 },
      { label: "Matte 200gsm", price: 30 },
      { label: "Silk 250gsm", price: 60 },
    ],
    sizes: [
      { label: "A4 Tri-fold", price: 0 },
      { label: "A3 Tri-fold", price: 50 },
      { label: "Custom", price: 40 },
    ],
    sides: [
      { label: "Double", price: 0 },
      { label: "Single", price: 0 },
    ],
    finishings: [
      { label: "None", price: 0 },
      { label: "Gloss Lamination", price: 60 },
      { label: "Matte Lamination", price: 60 },
    ],
    qtyTiers: [
      { qty: 100, price: 850 },
      { qty: 250, price: 1900 },
      { qty: 500, price: 3499 },
      { qty: 1000, price: 6499 },
    ],
    related: ["event-posters", "business-cards", "luxury-packaging"],
  },

  "event-posters": {
    slug: "event-posters",
    name: "Event Posters",
    category: "Large Format",
    badge: "New Arrival",
    rating: 4.9,
    reviews: 97,
    image: IMG.poster,
    thumbs: thumbsFor(IMG.poster),
    unit: "pcs",
    specs: [
      ["Category", "Large Format"],
      ["Sizes", "A2 – A0"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "1 Piece"],
      ["File Format", "PDF, AI, JPG"],
      ["Bleed Area", "5 mm around"],
    ],
    paperLabel: "Material",
    papers: [
      { label: "Synthetic UV", price: 0 },
      { label: "Photo Gloss", price: 80 },
      { label: "Matte Art", price: 50 },
    ],
    sizes: [
      { label: "A2", price: 0 },
      { label: "A1", price: 120 },
      { label: "A0", price: 250 },
      { label: "Custom", price: 90 },
    ],
    sides: [
      { label: "Single", price: 0 },
      { label: "Double", price: 100 },
    ],
    finishings: [
      { label: "None", price: 0 },
      { label: "Lamination", price: 70 },
      { label: "Foam Mounting", price: 150 },
    ],
    qtyTiers: [
      { qty: 1, price: 450 },
      { qty: 5, price: 1999 },
      { qty: 10, price: 3499 },
      { qty: 25, price: 7999 },
    ],
    related: ["trifold-brochures", "die-cut-stickers", "luxury-packaging"],
  },

  "luxury-packaging": {
    slug: "luxury-packaging",
    name: "Luxury Packaging",
    category: "Custom Boxes",
    badge: "Top Rated",
    rating: 5.0,
    reviews: 64,
    image: IMG.packaging,
    thumbs: thumbsFor(IMG.packaging),
    unit: "boxes",
    specs: [
      ["Category", "Custom Boxes"],
      ["Type", "Die-cut Rigid Box"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "50 Boxes"],
      ["File Format", "PDF, AI"],
      ["Bleed Area", "5 mm around"],
    ],
    paperLabel: "Board Material",
    papers: [
      { label: "Rigid Board", price: 0 },
      { label: "Kraft Board", price: 30 },
      { label: "Corrugated", price: 50 },
    ],
    sizes: [
      { label: "Small", price: 0 },
      { label: "Medium", price: 40 },
      { label: "Large", price: 90 },
      { label: "Custom", price: 60 },
    ],
    sides: [
      { label: "Outer Print", price: 0 },
      { label: "Inside + Outside", price: 120 },
    ],
    finishings: [
      { label: "None", price: 0 },
      { label: "Soft-touch Lamination", price: 200 },
      { label: "Foil Stamping", price: 250 },
    ],
    qtyTiers: [
      { qty: 50, price: 4250 },
      { qty: 100, price: 7999 },
      { qty: 250, price: 18999 },
      { qty: 500, price: 34999 },
    ],
    related: ["die-cut-stickers", "trifold-brochures", "business-cards"],
  },

  letterheads: {
    slug: "letterheads",
    name: "Premium Letterheads",
    category: "Business Stationery",
    rating: 4.8,
    reviews: 141,
    image: IMG.letterhead,
    thumbs: thumbsFor(IMG.letterhead),
    unit: "sheets",
    specs: [
      ["Category", "Business Stationery"],
      ["Standard Size", "A4 (210 × 297 mm)"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "100 Sheets"],
      ["File Format", "PDF, AI, PSD"],
      ["Bleed Area", "3 mm around"],
    ],
    papers: [
      { label: "Bond 100gsm", price: 0 },
      { label: "Executive 120gsm", price: 40 },
      { label: "Cotton Premium", price: 90 },
    ],
    sizes: [
      { label: "A4", price: 0 },
      { label: "A5", price: 20 },
    ],
    sides: [
      { label: "Single", price: 0 },
      { label: "Double", price: 30 },
    ],
    finishings: [
      { label: "None", price: 0 },
      { label: "Spot UV", price: 60 },
    ],
    qtyTiers: [
      { qty: 100, price: 450 },
      { qty: 250, price: 999 },
      { qty: 500, price: 1799 },
      { qty: 1000, price: 3299 },
    ],
    related: ["business-cards", "executive-stationery", "branded-envelopes"],
  },

  "branded-envelopes": {
    slug: "branded-envelopes",
    name: "Branded Envelopes",
    category: "Business Stationery",
    rating: 4.7,
    reviews: 88,
    image: IMG.envelope,
    thumbs: thumbsFor(IMG.envelope),
    unit: "pcs",
    specs: [
      ["Category", "Business Stationery"],
      ["Sizes", "DL / C5 / C4"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "100 Pieces"],
      ["File Format", "PDF, AI"],
      ["Bleed Area", "3 mm around"],
    ],
    papers: [
      { label: "Bond 100gsm", price: 0 },
      { label: "Linen Textured", price: 40 },
    ],
    sizes: [
      { label: "DL", price: 0 },
      { label: "C5", price: 20 },
      { label: "C4", price: 40 },
    ],
    sides: [{ label: "Single", price: 0 }],
    finishings: [
      { label: "None", price: 0 },
      { label: "Window Cut", price: 20 },
    ],
    qtyTiers: [
      { qty: 100, price: 1200 },
      { qty: 250, price: 2750 },
      { qty: 500, price: 4999 },
    ],
    related: ["letterheads", "business-cards", "executive-stationery"],
  },

  "die-cut-stickers": {
    slug: "die-cut-stickers",
    name: "Custom Die-Cut Stickers",
    category: "Stickers & Labels",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 203,
    image: IMG.sticker,
    thumbs: thumbsFor(IMG.sticker),
    unit: "pcs",
    specs: [
      ["Category", "Stickers & Labels"],
      ["Shapes", "Any custom die-cut"],
      ["Print Type", "Full Colour CMYK"],
      ["Min Quantity", "50 Pieces"],
      ["File Format", "PDF, AI, PNG"],
      ["Bleed Area", "2 mm around"],
    ],
    paperLabel: "Material",
    papers: [
      { label: "Vinyl", price: 0 },
      { label: "Transparent", price: 30 },
      { label: "Holographic", price: 80 },
      { label: "Paper Label", price: 0 },
    ],
    sizes: [
      { label: "Up to 2 inch", price: 0 },
      { label: "Up to 4 inch", price: 40 },
      { label: "Custom Shape", price: 60 },
    ],
    sides: [{ label: "Single", price: 0 }],
    finishings: [
      { label: "Gloss", price: 0 },
      { label: "Matte", price: 0 },
      { label: "Lamination", price: 40 },
    ],
    qtyTiers: [
      { qty: 50, price: 800 },
      { qty: 100, price: 1499 },
      { qty: 250, price: 3299 },
      { qty: 500, price: 5999 },
    ],
    related: ["luxury-packaging", "event-posters", "business-cards"],
  },
};

export const PRODUCT_SLUGS = Object.keys(PRODUCTS);

export function getProduct(slug: string): Product {
  return PRODUCTS[slug] ?? PRODUCTS["business-cards"];
}

// Base price for a given quantity: exact tier match, else bulk per-unit rate
// of the largest tier whose qty ≤ the requested quantity.
export function basePriceFor(qty: number, tiers: QtyTier[]): number {
  const exact = tiers.find((t) => t.qty === qty);
  if (exact) return exact.price;
  const sorted = [...tiers].sort((a, b) => a.qty - b.qty);
  let rate = sorted[0].price / sorted[0].qty;
  for (const t of sorted) if (qty >= t.qty) rate = t.price / t.qty;
  return Math.max(1, Math.round(qty * rate));
}

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
