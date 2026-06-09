import { createClient } from '@/lib/supabase/server'
import { sendVenueClaimNotification } from '@/lib/emails'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { venueId } = await request.json()
  if (!venueId) return NextResponse.json({ error: 'Missing venueId' }, { status: 400 })

  const { data: venue } = await supabase
    .from('venues')
    .select('id, profiles!inner(display_name)')
    .eq('id', venueId)
    .single()

  if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 })

  const { data: claimant } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  try {
    await sendVenueClaimNotification(
      (venue.profiles as any)?.display_name || 'Unknown Venue',
      claimant?.display_name || 'Unknown',
      user.email || '',
      venueId,
      user.id,
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}