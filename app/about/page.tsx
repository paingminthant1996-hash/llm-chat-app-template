import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - Azone.store",
  description: "We accelerate startups with high-quality UI foundations. Built for production. Designed for scale.",
  keywords: [
    "about",
    "mission",
    "team",
    "startup acceleration",
    "UI foundations",
  ],
  openGraph: {
    type: "website",
    url: "https://store.paing.xyz/about",
    title: "About - Azone.store",
    description: "We accelerate startups with high-quality UI foundations. Built for production. Designed for scale.",
    siteName: "Azone.store",
    images: [
      {
        url: "https://store.paing.xyz/og",
        width: 1200,
        height: 630,
        alt: "About Azone.store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About - Azone.store",
    description: "We accelerate startups with high-quality UI foundations.",
    images: ["https://store.paing.xyz/og"],
  },
  alternates: {
    canonical: "https://store.paing.xyz/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-azone-black pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-[1.15] tracking-tight">
            <span className="text-white">About</span>
            <span className="text-azone-purple ml-3">Azone.store</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We accelerate startups with high-quality UI foundations.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-6 leading-[1.15]">
            Mission
          </h2>
          <div className="space-y-4 text-gray-400 leading-relaxed">
            <p>
              Azone.store exists to eliminate the friction between idea and production. 
              We provide enterprise-grade UI foundations that allow funded startups and 
              senior engineering teams to ship faster, scale confidently, and focus on 
              what matters: building products that work.
            </p>
            <p>
              Every template in our collection is built for production. Designed for scale. 
              Used in real-world products. We don&apos;t ship demos. We ship foundations.
            </p>
          </div>
        </section>

        {/* Approach Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-6 leading-[1.15]">
            Our Approach
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Production-Ready by Default
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Every component, every pattern, every line of code is tested in production 
                environments. We don&apos;t build for portfolios. We build for scale.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Built for Serious Builders
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Our templates are designed for teams that understand the difference between 
                a prototype and a product. For engineers who need foundations, not frameworks.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Real-World Proven
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Every template in our collection has been used in production. Tested under 
                load. Validated by real users. We only ship what works.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-6 leading-[1.15]">
            What We Value
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">
                Quality Over Quantity
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We curate, not accumulate. Every template earns its place through 
                production validation.
              </p>
            </div>
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">
                Transparency
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Full source code. No hidden dependencies. No surprises. What you see 
                is what you get.
              </p>
            </div>
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">
                Practicality
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We solve real problems for real teams. Every feature exists because 
                it&apos;s needed, not because it&apos;s trendy.
              </p>
            </div>
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">
                Long-Term Thinking
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We build for maintainability. Our templates age well because they&apos;re 
                built on solid foundations.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center pt-8 border-t border-gray-800">
          <p className="text-gray-400 mb-6 leading-relaxed">
            Ready to accelerate your product development?
          </p>
          <Link
            href="/templates"
            className="inline-block px-10 py-4 text-lg font-semibold bg-azone-purple text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-azone-purple/50"
          >
            Browse Templates
          </Link>
        </section>
      </div>
    </div>
  );
}

