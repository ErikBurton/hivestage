import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/emails'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, account_type')
      .eq('id', userId)
      .single()

    const adminClient = createAdminClient()
    const { data: { user } } = await adminClient.auth.admin.getUserById(userId)

    if (!profile || !user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await sendWelcomeEmail(user.email, profile.display_name, profile.account_type)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}