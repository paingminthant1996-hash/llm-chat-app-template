import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "License Agreement - Azone.store",
  description: "License agreement for Azone.store templates. Usage rights and restrictions for purchased templates.",
  openGraph: {
    type: "website",
    url: "https://store.paing.xyz/license",
    title: "License Agreement - Azone.store",
    description: "License agreement for Azone.store templates. Usage rights and restrictions for purchased templates.",
    siteName: "Azone.store",
  },
  twitter: {
    card: "summary",
    title: "License Agreement - Azone.store",
    description: "License agreement for Azone.store templates.",
  },
  alternates: {
    canonical: "https://store.paing.xyz/license",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LicensePage() {
  return (
    <div className="min-h-screen bg-azone-black pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-[1.15] tracking-tight">
            <span className="text-white">License</span>
            <span className="text-azone-purple ml-3">Agreement</span>
          </h1>
          <p className="text-sm text-gray-500">
            Understanding your rights and restrictions when using Azone.store templates.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Commercial License
            </h2>
            <p className="mb-4">
              When you purchase a template from Azone.store, you receive a commercial license 
              that grants you the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the template in commercial projects and products</li>
              <li>Modify and customize the template for your specific needs</li>
              <li>Create derivative works based on the template</li>
              <li>Use the template in multiple projects under your ownership</li>
              <li>Receive lifetime updates for the purchased version</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              What You Can Do
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Build Products
                </h3>
                <p>
                  Use templates as the foundation for your SaaS products, web applications, 
                  and digital platforms. The template becomes part of your product.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Customize Freely
                </h3>
                <p>
                  Modify components, styles, and functionality to match your brand and 
                  requirements. You own the modifications you make.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Use in Client Work
                </h3>
                <p>
                  Use templates in projects you build for clients, as long as the end product 
                  is a custom solution, not a template resale.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              What You Cannot Do
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-white">Resell the template</strong> - You cannot 
                sell or redistribute the template source code to third parties
              </li>
              <li>
                <strong className="text-white">Create competing products</strong> - You 
                cannot use templates to create products that directly compete with our 
                template marketplace
              </li>
              <li>
                <strong className="text-white">Remove attribution</strong> - While not 
                required in your final product, you may not claim the template design as 
                your original work
              </li>
              <li>
                <strong className="text-white">Share source code</strong> - You cannot 
                share, distribute, or make the template source code publicly available
              </li>
              <li>
                <strong className="text-white">Create template derivatives for sale</strong> - 
                You cannot create and sell templates based on our templates
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Team Usage
            </h2>
            <p>
              A single license covers your team&apos;s use of the template within your organization. 
              If you need to use the template across multiple separate companies or entities, 
              you may need additional licenses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Updates and Support
            </h2>
            <p className="mb-4">
              Your license includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Lifetime updates for the version you purchased</li>
              <li>Bug fixes and security patches</li>
              <li>Technical documentation</li>
              <li>Access to template source code</li>
            </ul>
            <p className="mt-4">
              Note: Major version upgrades may require a new purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Third-Party Components
            </h2>
            <p>
              Templates may include third-party libraries and dependencies. These components 
              are subject to their respective licenses. You are responsible for complying 
              with all applicable third-party license terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ownership
            </h2>
            <p>
              Azone.store retains ownership of the template design and source code. You receive 
              a license to use the template, not ownership of the template itself. You own 
              your modifications and the products you build using the template.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              License Transfer
            </h2>
            <p>
              Licenses are non-transferable. If you need to transfer a license to another 
              entity, please contact us to discuss options.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Violations
            </h2>
            <p>
              Violation of this license agreement may result in termination of your license 
              and legal action. We take intellectual property protection seriously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Questions
            </h2>
            <p>
              If you have questions about license usage or need clarification on what&apos;s 
              permitted, please{" "}
              <a href="/contact" className="text-azone-purple hover:text-azone-purple/80">
                contact us
              </a>{" "}
              before proceeding.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

