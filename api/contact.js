// Vercel serverless function: /api/contact
// Receives hero-bar leads and contact-form messages, emails them to you via Resend.
//
// Required environment variables (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY     — your Resend API key (from resend.com, free tier is plenty)
//   CONTACT_TO_EMAIL    — the address you want messages delivered to (e.g. rudra.pandit515@gmail.com)
// Optional:
//   CONTACT_FROM_EMAIL  — defaults to "Portfolio <onboarding@resend.dev>" (no domain setup needed)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { type, name, email, message, company } = body;

    // Honeypot: real users never fill this hidden field. Bots often do.
    if (company) {
      res.status(200).json({ ok: true });
      return;
    }

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ error: 'A valid email is required.' });
      return;
    }

    if (type === 'message' && (!message || !message.trim())) {
      res.status(400).json({ error: 'Please include a message.' });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';

    if (!apiKey || !toEmail) {
      console.error('Missing RESEND_API_KEY or CONTACT_TO_EMAIL environment variable.');
      res.status(500).json({ error: 'Contact form is not configured yet.' });
      return;
    }

    const isLead = type === 'lead';
    const cleanEmail = email.trim();
    const cleanName = (name || '').trim();
    const cleanMessage = (message || '').trim();

    const subject = isLead
      ? `Portfolio: new lead — ${cleanEmail}`
      : `Portfolio: new message from ${cleanName || cleanEmail}`;

    const text = isLead
      ? [
          'Someone dropped their email on the hero form of your portfolio.',
          '',
          `Email: ${cleanEmail}`,
        ].join('\n')
      : [
          'New message from your portfolio contact form.',
          '',
          `Name: ${cleanName || '—'}`,
          `Email: ${cleanEmail}`,
          '',
          'Message:',
          cleanMessage,
        ].join('\n');

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: cleanEmail,
        subject,
        text,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => '');
      console.error('Resend API error:', resendRes.status, errText);
      res.status(502).json({ error: 'Could not send your message right now. Please try again shortly.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};