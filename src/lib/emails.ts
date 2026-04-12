import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, displayName: string, accountType: string) {
  const roleMessage = {
    band: 'Start by completing your band profile and posting your first show.',
    venue: 'Start by completing your venue profile and adding your upcoming events.',
    fan: 'Start by browsing upcoming shows and following your favorite Utah bands.',
  }[accountType] || 'Start exploring Utah\'s live music scene.'

  await resend.emails.send({
    from: 'HiveStage <hello@hivestage.live>',
    to: email,
    subject: 'Welcome to HiveStage 🐝',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#030712;font-family:sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

            <h1 style="color:#facc15;font-size:32px;margin:0 0 8px;">HiveStage</h1>
            <p style="color:#6b7280;margin:0 0 32px;">Utah's home for live music</p>

            <div style="background:#111827;border-radius:16px;padding:32px;margin-bottom:24px;">
              <h2 style="color:#f9fafb;font-size:22px;margin:0 0 8px;">Welcome, ${displayName}! 🎸</h2>
              <p style="color:#9ca3af;line-height:1.6;margin:0 0 16px;">
                You're now part of Utah's live music community. ${roleMessage}
              </p>
              
                href="https://www.hivestage.live/dashboard"
                style="display:inline-block;background:#facc15;color:#030712;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;"
              >
                Go to your dashboard →
              </a>
            </div>

            <div style="background:#111827;border-radius:16px;padding:24px;margin-bottom:24px;">
              <h3 style="color:#f9fafb;font-size:16px;margin:0 0 16px;">Get started</h3>
              <table style="width:100%;">
                <tr>
                  <td style="padding:8px 0;color:#9ca3af;font-size:14px;">🎸 Browse bands</td>
                  <td style="padding:8px 0;text-align:right;">
                    <a href="https://www.hivestage.live/bands" style="color:#facc15;text-decoration:none;font-size:14px;">View →</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#9ca3af;font-size:14px;">🎟️ Browse events</td>
                  <td style="padding:8px 0;text-align:right;">
                    <a href="https://www.hivestage.live/events" style="color:#facc15;text-decoration:none;font-size:14px;">View →</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#9ca3af;font-size:14px;">🏟️ Browse venues</td>
                  <td style="padding:8px 0;text-align:right;">
                    <a href="https://www.hivestage.live/venues" style="color:#facc15;text-decoration:none;font-size:14px;">View →</a>
                  </td>
                </tr>
              </table>
            </div>

            <p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">
              © 2026 HiveStage · Utah's home for live music ·
              <a href="https://www.hivestage.live/terms" style="color:#4b5563;">Terms</a> ·
              <a href="https://www.hivestage.live/privacy" style="color:#4b5563;">Privacy</a>
            </p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendNewEventNotification(
  email: string,
  fanName: string,
  bandName: string,
  eventTitle: string,
  eventDate: Date,
  eventId: string,
  venueName?: string,
  coverImageUrl?: string,
  isFree?: boolean,
  ticketUrl?: string,
) {
  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })
  const timeStr = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })

  await resend.emails.send({
    from: 'HiveStage <hello@hivestage.live>',
    to: email,
    subject: `${bandName} just posted a new show 🎸`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#030712;font-family:sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

            <h1 style="color:#facc15;font-size:32px;margin:0 0 8px;">HiveStage</h1>
            <p style="color:#6b7280;margin:0 0 32px;">Utah's home for live music</p>

            ${coverImageUrl ? `
            <div style="border-radius:16px;overflow:hidden;margin-bottom:24px;">
              <img src="${coverImageUrl}" alt="${eventTitle}" style="width:100%;display:block;" />
            </div>
            ` : ''}

            <div style="background:#111827;border-radius:16px;padding:32px;margin-bottom:24px;">
              <p style="color:#facc15;font-size:14px;margin:0 0 8px;font-weight:600;">${bandName}</p>
              <h2 style="color:#f9fafb;font-size:22px;margin:0 0 16px;">${eventTitle}</h2>

              <table style="width:100%;margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#9ca3af;font-size:14px;">🕐 Date</td>
                  <td style="padding:8px 0;color:#f9fafb;font-size:14px;text-align:right;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#9ca3af;font-size:14px;">⏰ Time</td>
                  <td style="padding:8px 0;color:#f9fafb;font-size:14px;text-align:right;">${timeStr}</td>
                </tr>
                ${venueName ? `
                <tr>
                  <td style="padding:8px 0;color:#9ca3af;font-size:14px;">📍 Venue</td>
                  <td style="padding:8px 0;color:#f9fafb;font-size:14px;text-align:right;">${venueName}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:8px 0;color:#9ca3af;font-size:14px;">🎟️ Tickets</td>
                  <td style="padding:8px 0;color:#4ade80;font-size:14px;font-weight:600;text-align:right;">${isFree ? 'Free' : 'Paid'}</td>
                </tr>
              </table>

              
                href="https://www.hivestage.live/events/${eventId}"
                style="display:inline-block;background:#facc15;color:#030712;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;width:100%;text-align:center;box-sizing:border-box;"
              >
                ${ticketUrl && !isFree ? 'Get tickets →' : 'View event →'}
              </a>
            </div>

            <p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">
              You're receiving this because you follow ${bandName} on HiveStage.<br/>
              <a href="https://www.hivestage.live/dashboard" style="color:#4b5563;">Manage your follows</a> ·
              © 2026 HiveStage
            </p>
          </div>
        </body>
      </html>
    `,
  })
}