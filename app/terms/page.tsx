import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Azone.store",
  description: "Terms of Service for Azone.store. Rules and guidelines for using our platform and templates.",
  openGraph: {
    type: "website",
    url: "https://store.paing.xyz/terms",
    title: "Terms of Service - Azone.store",
    description: "Terms of Service for Azone.store. Rules and guidelines for using our platform and templates.",
    siteName: "Azone.store",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service - Azone.store",
    description: "Terms of Service for Azone.store.",
  },
  alternates: {
    canonical: "https://store.paing.xyz/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-azone-black pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-[1.15] tracking-tight">
            <span className="text-white">Terms of</span>
            <span className="text-azone-purple ml-3">Service</span>
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Agreement to Terms
            </h2>
            <p>
              By accessing or using Azone.store, you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access our platform or 
              purchase our templates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Use License
            </h2>
            <p className="mb-4">
              When you purchase a template from Azone.store, you receive a license to use that 
              template in accordance with our License Agreement. Each template purchase includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Full source code access</li>
              <li>Commercial usage rights</li>
              <li>Lifetime updates for the purchased version</li>
              <li>Technical documentation</li>
            </ul>
            <p className="mt-4">
              See our{" "}
              <a href="/license" className="text-azone-purple hover:text-azone-purple/80">
                License page
              </a>{" "}
              for detailed usage rights and restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Payment and Refunds
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Payment
                </h3>
                <p>
                  All payments are processed through secure third-party payment processors. 
                  Prices are displayed in USD and are subject to change without notice.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Refunds
                </h3>
                <p>
                  Due to the digital nature of our products, we do not offer refunds once 
                  a template has been downloaded. We encourage you to review template 
                  documentation and previews before purchasing.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Prohibited Uses
            </h2>
            <p className="mb-4">
              You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Resell, redistribute, or share template source code with third parties</li>
              <li>Create derivative products for sale that compete with our templates</li>
              <li>Remove copyright notices or attribution from templates</li>
              <li>Use templates in ways that violate applicable laws or regulations</li>
              <li>Reverse engineer or attempt to extract underlying frameworks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Account Responsibilities
            </h2>
            <p className="mb-4">
              When you create an account, you are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and current information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Intellectual Property
            </h2>
            <p>
              All templates, content, and materials on Azone.store are protected by copyright 
              and other intellectual property laws. You receive a license to use purchased 
              templates, but ownership remains with Azone.store.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Disclaimer of Warranties
            </h2>
            <p>
              Templates are provided &quot;as is&quot; without warranties of any kind. We do not guarantee 
              that templates will meet your specific requirements or be error-free. You use 
              templates at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Azone.store shall not be liable for any 
              indirect, incidental, special, or consequential damages arising from your use of 
              our templates or platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of our 
              platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contact Information
            </h2>
            <p>
              For questions about these Terms of Service, please contact us at{" "}
              <a href="/contact" className="text-azone-purple hover:text-azone-purple/80">
                our contact page
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

