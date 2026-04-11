export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-8 py-16">

        <a href="/" className="text-yellow-400 hover:underline text-sm mb-8 inline-block">← HiveStage</a>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: April 11, 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>HiveStage ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use hivestage.live.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information we collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li><strong className="text-gray-300">Account information</strong> — your email address, display name, and account type (band, venue, or fan) when you sign up</li>
              <li><strong className="text-gray-300">Profile information</strong> — bio, city, genres, website, Instagram handle, and profile photo that you choose to provide</li>
              <li><strong className="text-gray-300">Event information</strong> — event titles, descriptions, dates, and venue details you post</li>
              <li><strong className="text-gray-300">Usage data</strong> — pages visited, features used, and general interaction with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How we use your information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Provide and operate the HiveStage platform</li>
              <li>Display your public profile and events to other users</li>
              <li>Send you account-related emails (password resets, notifications)</li>
              <li>Improve and develop new features for the Service</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Information we share</h2>
            <p className="mb-3">We do not sell your personal information. We share information only in these circumstances:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li><strong className="text-gray-300">Public profile data</strong> — your display name, bio, city, genres, and profile photo are visible to all visitors of HiveStage</li>
              <li><strong className="text-gray-300">Service providers</strong> — we use Supabase for database and authentication services, which processes data on our behalf</li>
              <li><strong className="text-gray-300">Legal requirements</strong> — we may disclose information if required by law or to protect the rights and safety of our users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data storage and security</h2>
            <p>Your data is stored securely using Supabase, which is hosted on AWS infrastructure. We implement industry-standard security measures including encrypted connections (HTTPS), secure authentication, and row-level security on our database. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Access the personal information we hold about you</li>
              <li>Update or correct your information through your profile settings</li>
              <li>Delete your account and associated data by contacting us</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
            <p>HiveStage uses cookies and similar technologies solely for authentication purposes — to keep you logged in between sessions. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Children's privacy</h2>
            <p>HiveStage is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with their information, please contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Third party links</h2>
            <p>The Service may contain links to third-party websites such as ticket vendors and social media platforms. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Service or sending an email. Your continued use of the Service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
            <p>For privacy-related questions or to exercise your rights, please contact us at <a href="mailto:hello@hivestage.live" className="text-yellow-400 hover:underline">hello@hivestage.live</a>.</p>
          </section>

        </div>
      </div>
    </main>
  )
}