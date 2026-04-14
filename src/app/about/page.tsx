import Nav from '@/components/Nav'

export const metadata = {
  title: 'About — HiveStage',
  description: 'The story behind HiveStage — Utah\'s home for live music.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Nav />
      <div className="max-w-3xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-yellow-400 mb-3">About HiveStage</h1>
          <p className="text-gray-400 text-lg">Built by a musician, for musicians.</p>
        </div>

        {/* Origin story */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">🐝 Why HiveStage exists</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Utah has one of the most underrated live music scenes in the country. Seriously. Talented bands playing killer shows every weekend — and half the time nobody knows about it because the post got buried under ads and algorithm nonsense on Facebook.
          </p>
          <p className="text-gray-300 leading-relaxed">
            HiveStage was built to fix that. No ads. No algorithm. Just Utah bands, venues, and fans — all in one place. Think of it as the local music scene's home base.
          </p>
        </div>

        {/* Who built it */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">🥁 Who built this thing?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            A drummer from Riverton, Utah who got tired of watching great local bands get zero traction online. When you spend years behind a kit playing rock shows across the Salt Lake Valley, you start to notice the gap between how good the local scene actually is and how little visibility it gets.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            By day — a software developer with a BS in Software Development who geeks out over full-stack web development, automation frameworks, and clean code. By night — the drummer for a local classic rock cover band, managing set lists, double-bass technique, and trying to remember where the beat drops in Tom Sawyer by Rush. 🎸
          </p>
          <p className="text-gray-300 leading-relaxed">
            HiveStage is where both worlds collide — a passion project built with real code and real stage experience.
          </p>
        </div>

        {/* What makes it different */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">🎟️ What makes HiveStage different</h2>
          <div className="space-y-4">
            {[
              {
                icon: '🚫',
                title: 'Zero ads',
                desc: 'No promoted posts. No pay-to-play. No ads trying to sell you something while you\'re trying to find a show. HiveStage is completely ad-free.'
              },
              {
                icon: '📍',
                title: '100% Utah focused',
                desc: 'We\'re not trying to be Spotify or Ticketmaster. HiveStage is built specifically for the Utah music community — local bands, local venues, local fans.'
              },
              {
                icon: '🎸',
                title: 'Built by someone in the scene',
                desc: 'This isn\'t a corporate product. It was built by someone who has loaded gear into venues at midnight and knows what it actually takes to promote a local show.'
              },
              {
                icon: '🆓',
                title: 'Free for everyone',
                desc: 'Bands post their shows for free. Fans discover events for free. Venues list their calendar for free. That\'s how it should be.'
              },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Get involved */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">🤘 Get involved</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Whether you're a band looking to reach more fans, a venue wanting to fill seats, or just someone who loves live music — HiveStage is for you. Sign up is free and takes about 60 seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/signup" className="px-6 py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
              Create your free account
            </a>
            <a href="/events" className="px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors">
              Browse events
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-4">📬 Say hello</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Got a band or venue you want to see on HiveStage? Feature request? Found a bug? Just want to talk drums or debate whether Neil Peart is the greatest drummer of all time? (He is.)
          </p>
          <a href="mailto:hello@hivestage.live" className="text-yellow-400 hover:underline font-medium">
            hello@hivestage.live →
          </a>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-6 flex items-center justify-between text-gray-600 text-sm max-w-3xl mx-auto">
        <span className="text-yellow-400 font-bold">HiveStage</span>
        <div className="flex items-center gap-6">
          <a href="/terms" className="hover:text-gray-400 transition-colors">Terms</a>
          <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</a>
          <span>Utah's home for live music</span>
        </div>
      </footer>

    </main>
  )
}