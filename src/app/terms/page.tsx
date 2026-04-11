export const metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-8 py-16">

        <a href="/" className="text-yellow-400 hover:underline text-sm mb-8 inline-block">← HiveStage</a>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: April 11, 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of terms</h2>
            <p>By accessing or using HiveStage ("the Service") at hivestage.live, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of service</h2>
            <p>HiveStage is a platform that connects Utah bands, venues, and music fans. The Service allows users to create profiles, post events, and discover live music in Utah. HiveStage is provided free of charge.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User accounts</h2>
            <p className="mb-3">To access certain features of the Service, you must create an account. You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and truthful information</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. User content</h2>
            <p className="mb-3">You retain ownership of content you post on HiveStage. By posting content, you grant HiveStage a non-exclusive, royalty-free license to display and distribute that content on the platform. You agree not to post content that:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Is false, misleading, or deceptive</li>
              <li>Infringes on any third party's intellectual property rights</li>
              <li>Is offensive, abusive, or harmful</li>
              <li>Violates any applicable law or regulation</li>
              <li>Contains spam or unauthorized advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Events and listings</h2>
            <p>Users are solely responsible for the accuracy of event listings they post. HiveStage does not verify event details and is not responsible for cancelled, postponed, or inaccurate events. Attendees should confirm event details directly with the band or venue.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Prohibited conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Use the Service for any unlawful purpose</li>
              <li>Impersonate any person or entity</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated tools to scrape or collect data from the Service</li>
              <li>Post fake events or misleading band/venue information</li>
              <li>Harass or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibent text-white mb-3">7. Termination</h2>
            <p>HiveStage reserves the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion. You may delete your account at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimer of warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. HiveStage does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of liability</h2>
            <p>To the fullest extent permitted by law, HiveStage shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or a notice on the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Governing law</h2>
            <p>These terms are governed by the laws of the State of Utah, United States. Any disputes shall be resolved in the courts of Utah County, Utah.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact</h2>
            <p>For questions about these Terms of Service, please contact us at <a href="mailto:hello@hivestage.live" className="text-yellow-400 hover:underline">hello@hivestage.live</a>.</p>
          </section>

        </div>
      </div>
    </main>
  )
}