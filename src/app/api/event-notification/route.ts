import { createClient } from '@/lib/supabase/server'
import { sendNewEventNotification } from '@/lib/emails'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json()
    const supabase = await createClient()

    // Get event details
    const { data: event } = await supabase
      .from('events')
      .select(`
        *,
        venues ( profiles ( display_name ) ),
        event_bands ( bands ( id, profile_id ) )
      `)
      .eq('id', eventId)
      .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const bandId = event.event_bands?.[0]?.bands?.id
    if (!bandId) return NextResponse.json({ success: true, sent: 0 })

    // Get all followers of this band
    const { data: follows } = await supabase
      .from('follows')
      .select('fan_id')
      .eq('band_id', bandId)

    if (!follows || follows.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    // Get band name
    const { data: band } = await supabase
      .from('bands')
      .select('profiles ( display_name )')
      .eq('id', bandId)
      .single()

    const bandName = (band as any)?.profiles?.display_name || 'A band you follow'
    const venueName = event.venues?.profiles?.display_name

    // Send email to each follower
    let sent = 0
    for (const follow of follows) {
      const adminClient = createAdminClient()
      const { data: { user } } = await adminClient.auth.admin.getUserById(follow.fan_id)
      const { data: fanProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', follow.fan_id)
        .single()

      if (user?.email) {
        try {
          await sendNewEventNotification(
            user.email,
            fanProfile?.display_name || 'Fan',
            bandName,
            event.title,
            new Date(event.event_date),
            event.id,
            venueName,
            event.cover_image_url,
            event.is_free,
            event.ticket_url,
          )
          sent++
        } catch (e) {
          console.error(`Failed to send to ${user.email}:`, e)
        }
      }
    }

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    console.error('Event notification error:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}