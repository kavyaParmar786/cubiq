const nodemailer = require('nodemailer')

// ── Transporter ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── Base HTML Template ───────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0D0D14; color: #E8E8F0; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 32px auto; background: #141420; border: 1px solid #2A2A3E; }
    .header { background: #0D0D14; padding: 24px; border-bottom: 3px solid #5D9E2F; }
    .header h1 { margin: 0; color: #4EEBD0; font-size: 18px; letter-spacing: 2px; font-family: monospace; }
    .body { padding: 32px; }
    .body h2 { color: #ffffff; margin-top: 0; }
    .body p { color: #AAAAAA; line-height: 1.7; }
    .btn { display: inline-block; background: #5D9E2F; color: white; padding: 12px 28px; text-decoration: none; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin: 16px 0; border-bottom: 3px solid #3A6A1A; }
    .info-block { background: #0D0D14; border: 1px solid #2A2A3E; padding: 16px; margin: 16px 0; font-family: monospace; font-size: 13px; }
    .info-block span { color: #4EEBD0; }
    .footer { padding: 20px 32px; border-top: 1px solid #2A2A3E; color: #555; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ CUBIQ HOST</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © 2024 Cubiq Host · <a href="${process.env.FRONTEND_URL}" style="color:#4EEBD0">cubiqhost.com</a>
      <br>You received this email because you have an account with Cubiq Host.
    </div>
  </div>
</body>
</html>
`

// ── Email Senders ─────────────────────────────────────────────

/**
 * Welcome email after registration
 */
async function sendWelcomeEmail(user) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: '⚡ Welcome to Cubiq Host — Your account is ready',
    html: baseTemplate(`
      <h2>Welcome, ${user.username}! 👾</h2>
      <p>Your Cubiq Host account has been created. You're ready to deploy your first Minecraft server or Discord bot.</p>
      <div class="info-block">
        <span>Username:</span> ${user.username}<br>
        <span>Email:</span> ${user.email}<br>
        <span>Account Status:</span> Active
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
      <p>Need help? Join our <a href="https://discord.gg/cubiqhost" style="color:#4EEBD0">Discord community</a> or open a support ticket.</p>
    `),
  })
}

/**
 * Server deployed notification
 */
async function sendServerDeployedEmail(user, server) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: '🎮 Your server is ready — Cubiq Host',
    html: baseTemplate(`
      <h2>Your server is live! 🚀</h2>
      <p>Your Minecraft server has been deployed and is ready to use.</p>
      <div class="info-block">
        <span>Server Name:</span> ${server.name}<br>
        <span>Type:</span> ${server.type}<br>
        <span>IP:</span> ${server.connection?.ip}:${server.connection?.port || 25565}<br>
        <span>Status:</span> Online
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard/servers" class="btn">Manage Server</a>
    `),
  })
}

/**
 * Payment success notification
 */
async function sendPaymentSuccessEmail(user, payment, plan) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: '✅ Payment confirmed — Cubiq Host',
    html: baseTemplate(`
      <h2>Payment Successful</h2>
      <p>Your payment has been processed successfully.</p>
      <div class="info-block">
        <span>Plan:</span> ${plan?.displayName || 'Hosting Plan'}<br>
        <span>Amount:</span> ₹${(payment.amount / 100).toLocaleString()}<br>
        <span>Invoice ID:</span> ${payment.invoiceId}<br>
        <span>Date:</span> ${new Date().toLocaleDateString()}
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard/billing" class="btn">View Invoice</a>
    `),
  })
}

/**
 * Ticket reply notification
 */
async function sendTicketReplyEmail(user, ticket) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `💬 New reply on ${ticket.ticketId} — Cubiq Host`,
    html: baseTemplate(`
      <h2>Support ticket updated</h2>
      <p>Our support team has replied to your ticket.</p>
      <div class="info-block">
        <span>Ticket ID:</span> ${ticket.ticketId}<br>
        <span>Subject:</span> ${ticket.subject}<br>
        <span>Status:</span> ${ticket.status}
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard/tickets" class="btn">View Reply</a>
    `),
  })
}

/**
 * Password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: '🔑 Reset your Cubiq Host password',
    html: baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="font-size:13px;color:#555">If you didn't request this, you can safely ignore this email.</p>
    `),
  })
}

module.exports = {
  sendWelcomeEmail,
  sendServerDeployedEmail,
  sendPaymentSuccessEmail,
  sendTicketReplyEmail,
  sendPasswordResetEmail,
}
