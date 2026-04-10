import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function deleteEvent(eventId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('event_bands')
    .delete()
    .eq('event_id', eventId)

  await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('created_by', user.id)

  redirect('/dashboard')
}

export default async function DeleteEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (!event) redirect('/dashboard')

  const deleteWithId = deleteEvent.bind(null, id)

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-md mx-auto">
        <a href="/dashboard" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to dashboard</a>

        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-4">🗑️</p>
          <h1 className="text-2xl font-bold mb-2">Delete event?</h1>
          <p className="text-gray-400 mb-2">{event.title}</p>
          <p className="text-gray-600 text-sm mb-8">This cannot be undone.</p>

          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="flex-1 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Cancel
            </a>
            <form action={deleteWithId} className="flex-1">
              <button
                type="submit"
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}