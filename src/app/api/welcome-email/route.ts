import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/emails'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, account_type')
      .eq('id', userId)
      .single()

    const { data: { user } } = await adminClient.auth.admin.getUserById(userId)

    if (!profile || !user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send welcome email to new user
    await sendWelcomeEmail(user.email, profile.display_name, profile.account_type)

    // Send admin notification
    await resend.emails.send({
      from: 'HiveStage <hello@hivestage.live>',
      to: 'hello@hivestage.live',
      subject: `New ${profile.account_type} signup — ${profile.display_name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#030712;font-family:sans-serif;">
            <div style="max-width:500px;margin:0 auto;padding:40px 24px;">
              <h1 style="color:#facc15;font-size:28px;margin:0 0 8px;">HiveStage</h1>
              <p style="color:#6b7280;margin:0 0 32px;">Admin notification</p>

              <div style="background:#111827;border-radius:16px;padding:32px;">
                <h2 style="color:#f9fafb;font-size:20px;margin:0 0 20px;">New signup 🐝</h2>

                <table style="width:100%;">
                  <tr>
                    <td style="padding:10px 0;color:#9ca3af;font-size:14px;border-bottom:1px solid #1f2937;">Name</td>
                    <td style="padding:10px 0;color:#f9fafb;font-size:14px;text-align:right;border-bottom:1px solid #1f2937;">${profile.display_name}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#9ca3af;font-size:14px;border-bottom:1px solid #1f2937;">Email</td>
                    <td style="padding:10px 0;color:#f9fafb;font-size:14px;text-align:right;border-bottom:1px solid #1f2937;">${user.email}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#9ca3af;font-size:14px;border-bottom:1px solid #1f2937;">Account type</td>
                    <td style="padding:10px 0;color:#facc15;font-size:14px;font-weight:600;text-align:right;text-transform:capitalize;border-bottom:1px solid #1f2937;">${profile.account_type}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#9ca3af;font-size:14px;">Signed up</td>
                    <td style="padding:10px 0;color:#f9fafb;font-size:14px;text-align:right;">
                      ${new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'America/Denver'
                      })} at ${new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZone: 'America/Denver'
                      })}
                    </td>
                  </tr>
                </table>

                
                  href="https://www.hivestage.live/admin"
                  style="display:inline-block;margin-top:24px;background:#facc15;color:#030712;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;width:100%;text-align:center;box-sizing:border-box;"
                >
                  View in admin panel →
                </a>
              </div>

              <p style="color:#4b5563;font-size:12px;text-align:center;margin-top:24px;">
                © 2026 HiveStage · Admin notification
              </p>
            </div>
          </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}