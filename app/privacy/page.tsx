import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Azone.store",
  description: "Privacy Policy for Azone.store. How we collect, use, and protect your data.",
  openGraph: {
    type: "website",
    url: "https://store.paing.xyz/privacy",
    title: "Privacy Policy - Azone.store",
    description: "Privacy Policy for Azone.store. How we collect, use, and protect your data.",
    siteName: "Azone.store",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy - Azone.store",
    description: "Privacy Policy for Azone.store.",
  },
  alternates: {
    canonical: "https://store.paing.xyz/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-azone-black pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-[1.15] tracking-tight">
            <span className="text-white">Privacy</span>
            <span className="text-azone-purple ml-3">Policy</span>
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Introduction
            </h2>
            <p>
              Azone.store (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our platform and purchase our templates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Information You Provide
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email address for account creation and purchase transactions</li>
                  <li>Payment information processed through secure third-party payment processors</li>
                  <li>Communication data when you contact us</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Usage data and analytics to improve our platform</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location data</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Process and fulfill your template purchases</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send important updates about your purchases and account</li>
              <li>Improve our platform and develop new features</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Data Sharing and Disclosure
            </h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information only in 
              the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With payment processors to complete transactions</li>
              <li>With service providers who assist in operating our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your information. 
              However, no method of transmission over the internet is 100% secure. While we 
              strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Your Rights
            </h2>
            <p className="mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar tracking technologies to analyze usage patterns and 
              improve our platform. You can control cookie preferences through your browser 
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new policy on this page and updating the 
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
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

