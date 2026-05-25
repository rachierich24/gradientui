// POST /api/contact
// Body: { name: string, email: string, company?: string, message: string }
// Sends contact form submission to gradient365.team@gmail.com via Resend REST API.

import { NextResponse } from 'next/server';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TO = 'gradient365.team@gmail.com';
const FROM = process.env.RESEND_FROM || 'Gradient Contact <onboarding@resend.dev>';

export const runtime = 'edge';

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[contact] RESEND_API_KEY missing — email not sent.');
    return NextResponse.json({ ok: false, reason: 'email-not-configured' }, { status: 500 });
  }

  let body: { name?: string; email?: string; company?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const company = String(body.company || '').trim();
  const message = String(body.message || '').trim();

  if (!name || name.length > 120) {
    return NextResponse.json({ ok: false, reason: 'invalid-name' }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, reason: 'invalid-email' }, { status: 400 });
  }
  if (!message || message.length < 5 || message.length > 4000) {
    return NextResponse.json({ ok: false, reason: 'invalid-message' }, { status: 400 });
  }
  if (company.length > 200) {
    return NextResponse.json({ ok: false, reason: 'invalid-company' }, { status: 400 });
  }

  const ua = req.headers.get('user-agent') || 'unknown';
  const referer = req.headers.get('referer') || 'unknown';
  const when = new Date().toISOString();

  const html = `
    <div style="font:14px/1.5 system-ui,sans-serif;color:#0A0A0B;max-width:560px">
      <h2 style="margin:0 0 12px;font-size:18px">📨 New contact form submission</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 0;color:#6B7280;width:120px">Name</td><td style="padding:6px 0;font-weight:600">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280">Email</td><td style="padding:6px 0;font-weight:600"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6B7280">Company</td><td style="padding:6px 0">${escapeHtml(company) || '<em style="color:#9CA3AF">(not provided)</em>'}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;vertical-align:top">Message</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(message)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280">When</td><td style="padding:6px 0">${when}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280">Source</td><td style="padding:6px 0">${escapeHtml(referer)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280">User-Agent</td><td style="padding:6px 0;font-size:12px;color:#6B7280">${escapeHtml(ua)}</td></tr>
      </table>
      <p style="margin:18px 0 0;padding:12px;background:#F4F4F5;border-radius:8px;font-size:13px;color:#1F2024">
        Reply directly to this email to respond to ${escapeHtml(name)}.
      </p>
    </div>`;

  const resendRes = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `📨 Contact form: ${name}${company ? ` (${company})` : ''}`,
      html,
      reply_to: email,
    }),
  });

  if (!resendRes.ok) {
    const errBody = await resendRes.text();
    console.error('[contact] Resend error', resendRes.status, errBody);
    return NextResponse.json({ ok: false, reason: 'resend-failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
