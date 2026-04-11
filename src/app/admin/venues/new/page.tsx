import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const UTAH_CITIES = [
  'Alpine', 'American Fork', 'Bountiful', 'Cedar City', 'Cedar Hills',
  'Clearfield', 'Cottonwood Heights', 'Draper', 'Eagle Mountain', 'Farmington',
  'Heber City', 'Herriman', 'Highland', 'Holladay', 'Hyde Park', 'Kaysville',
  'Layton', 'Lehi', 'Lindon', 'Logan', 'Midvale', 'Millcreek', 'Moab', 'Murray',
  'North Logan', 'North Salt Lake', 'Ogden', 'Orem', 'Park City', 'Payson',
  'Pleasant Grove', 'Provo', 'Riverton', 'Roy', 'Salt Lake City', 'Sandy',
  'Saratoga Springs', 'Smithfield', 'South Jordan', 'Spanish Fork', 'Springville',
  'St. George', 'Taylorsville', 'West Jordan', 'West Valley City', 'Woods Cross',
]

async function createVenue(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const name = formData.get('name') as string
  const city = formData.get('city') as string
  const address = formData.get('address') as string
  const capacity = formData.get('capacity') as string

  if (!name || !city) {
    redirect('/admin/venues/new?error=missing')
  }

  const { error } = await supabase.rpc('create_venue_as_admin', {
    venue_name: name,
    venue_city: city,
    venue_address: address || null,
    venue_capacity: capacity ? parseInt(capacity) : null,
  })

  if (error) {
    console.error('Create venue error:', error)
    redirect('/admin/venues/new?error=failed')
  }

  redirect('/admin?success=venue_created')
}

export default async function AdminNewVenuePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/admin" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to admin</a>
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Add a Venue</h1>
        <p className="text-gray-400 mb-8">Create a venue profile without requiring an account</p>

        {error === 'missing' && (
          <p className="text-red-400 text-sm mb-4">Please fill in the venue name and city.</p>
        )}
        {error === 'failed' && (
          <p className="text-red-400 text-sm mb-4">Something went wrong. Please try again.</p>
        )}

        <form action={createVenue}>
          <div className="space-y-5">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Venue name *</label>
              <input
                name="name"
                required
                maxLength={100}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
                placeholder="e.g. Kilby Court"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">City *</label>
              <select
                name="city"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-400"
              >
                <option value="">Select a city...</option>
                {UTAH_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Address</label>
              <input
                name="address"
                maxLength={300}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
                placeholder="e.g. 741 S 330 W, Salt Lake City"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Capacity</label>
              <input
                name="capacity"
                type="number"
                min="1"
                max="100000"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
                placeholder="e.g. 250"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Create venue
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}