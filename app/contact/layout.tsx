import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Azone.store",
  description: "Get in touch with Azone.store. Need a custom solution or priority support? Our engineers are ready to assist.",
  keywords: ["contact", "support", "custom solutions", "help"],
  openGraph: {
    type: "website",
    url: "https://store.paing.xyz/contact",
    title: "Contact - Azone.store",
    description: "Get in touch with Azone.store. Need a custom solution or priority support?",
    siteName: "Azone.store",
    images: [
      {
        url: "https://store.paing.xyz/og",
        width: 1200,
        height: 630,
        alt: "Contact Azone.store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact - Azone.store",
    description: "Get in touch with Azone.store.",
    images: ["https://store.paing.xyz/og"],
  },
  alternates: {
    canonical: "https://store.paing.xyz/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

