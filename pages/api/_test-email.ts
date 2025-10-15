import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM
    const to = process.env.TEST_TO || 'yourgmail@gmail.com'
    if (!apiKey) return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
    if (!from) return res.status(500).json({ error: 'Missing RESEND_FROM' })

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from, to, subject: 'Test email from WorkflowKits', html: '<p>It works 🎉</p>',
    })
    if (error) return res.status(500).json({ error })
    res.status(200).json({ ok: true, data })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
}
