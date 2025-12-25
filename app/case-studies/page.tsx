import type { Metadata } from "next";
import CaseStudiesClient from "./CaseStudiesClient";

export const metadata: Metadata = {
  title: "Case Studies - Azone.store",
  description: "Real-world implementations. Production deployments. Proven results. See how funded startups accelerate their product development with Azone templates.",
  keywords: [
    "case studies",
    "success stories",
    "template implementations",
    "startup case studies",
    "production deployments",
  ],
  openGraph: {
    type: "website",
    url: "https://store.paing.xyz/case-studies",
    title: "Case Studies - Azone.store",
    description: "Real-world implementations. Production deployments. Proven results.",
    siteName: "Azone.store",
    images: [
      {
        url: "https://store.paing.xyz/og",
        width: 1200,
        height: 630,
        alt: "Azone.store Case Studies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies - Azone.store",
    description: "Real-world implementations. Production deployments. Proven results.",
    images: ["https://store.paing.xyz/og"],
  },
  alternates: {
    canonical: "https://store.paing.xyz/case-studies",
  },
};

export default function CaseStudiesPage() {
  return <CaseStudiesClient />;
}
