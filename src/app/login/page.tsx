import { createClient } from '@/lib/supabase/server'
import LoginClient from './LoginClient'

export default async function LoginPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select(`
      id, title, is_free, event_date,
      venues ( city, profiles ( display_name ) ),
      event_bands ( bands ( profiles ( display_name ) ) )
    `)
    .order('event_date', { ascending: true })
    .limit(5)

  return <LoginClient events={events || []} />
}