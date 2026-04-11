// Email via Resend (or Nodemailer fallback)
// Install: npm install resend

const FROM = process.env.EMAIL_FROM || 'Cubiq Host <noreply@cubiqhost.com>'
const RESEND_KEY = process.env.RESEND_API_KEY

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping email to:', to)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Email] Failed:', err)
  }
}

// ── Base Template ─────────────────────────────────────────────
function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;background:#0D0D14;color:#E8E8F0;margin:0;padding:0}
  .container{max-width:560px;margin:32px auto;background:#141420;border:1px solid #2A2A3E}
  .header{background:#0D0D14;padding:24px;border-bottom:3px solid #5D9E2F}
  .header h1{margin:0;color:#4EEBD0;font-size:18px;letter-spacing:2px;font-family:monospace}
  .body{padding:32px}.body h2{color:#fff;margin-top:0}
  .body p{color:#aaa;line-height:1.7}
  .btn{display:inline-block;background:#5D9E2F;color:#fff;padding:12px 28px;text-decoration:none;font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin:16px 0;border-bottom:3px solid #3A6A1A}
  .info{background:#0D0D14;border:1px solid #2A2A3E;padding:16px;margin:16px 0;font-family:monospace;font-size:13px}
  .info span{color:#4EEBD0}
  .footer{padding:20px 32px;border-top:1px solid #2A2A3E;color:#555;font-size:12px}
</style></head><body>
  <div class="container">
    <div class="header"><h1>⚡ CUBIQ HOST</h1></div>
    <div class="body">${content}</div>
    <div class="footer">© 2024 Cubiq Host · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#4EEBD0">cubiqhost.com</a></div>
  </div>
</body></html>`
}

// ── Email Senders ─────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, username: string) {
  await sendEmail(email, '⚡ Welcome to Cubiq Host!', baseTemplate(`
    <h2>Welcome, ${username}! 👾</h2>
    <p>Your Cubiq Host account is ready. Deploy your first server in under 60 seconds.</p>
    <div class="info"><span>Username:</span> ${username}<br><span>Email:</span> ${email}</div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
  `))
}

export async function sendServerDeployedEmail(email: string, serverName: string, ip: string, port: number) {
  await sendEmail(email, '🎮 Your server is ready!', baseTemplate(`
    <h2>Your server is live! 🚀</h2>
    <p>Your Minecraft server has been deployed and is ready to connect.</p>
    <div class="info">
      <span>Server:</span> ${serverName}<br>
      <span>Address:</span> ${ip}:${port}
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/servers" class="btn">Manage Server</a>
  `))
}

export async function sendPaymentSuccessEmail(email: string, amount: number, invoiceId: string, planName: string) {
  await sendEmail(email, '✅ Payment confirmed', baseTemplate(`
    <h2>Payment Successful</h2>
    <div class="info">
      <span>Plan:</span> ${planName}<br>
      <span>Amount:</span> ₹${amount}<br>
      <span>Invoice:</span> ${invoiceId}
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" class="btn">View Invoice</a>
  `))
}

export async function sendTicketReplyEmail(email: string, ticketId: string, subject: string) {
  await sendEmail(email, `💬 New reply on ${ticketId}`, baseTemplate(`
    <h2>Support ticket updated</h2>
    <div class="info">
      <span>Ticket:</span> ${ticketId}<br>
      <span>Subject:</span> ${subject}
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets" class="btn">View Reply</a>
  `))
}
