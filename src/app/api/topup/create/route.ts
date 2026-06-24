import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const amountStr = formData.get('amount') as string
  const creditsStr = formData.get('credits') as string
  
  if (!amountStr || !creditsStr) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const amount = parseInt(amountStr, 10)
  const credits = parseInt(creditsStr, 10)

  try {
    const mayarApiKey = process.env.MAYAR_API_KEY
    if (!mayarApiKey) {
      throw new Error('MAYAR_API_KEY not configured')
    }

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const origin = `${protocol}://${host}`

    const payload = {
      name: user.email?.split('@')[0] || 'User',
      email: user.email,
      amount: amount,
      description: `Top up ${credits.toLocaleString('id-ID')} kredit Timestamp App`,
      redirectUrl: `${origin}/topup/success`
    }

    const res = await fetch('https://api.mayar.id/hl/v1/payment/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mayarApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const mayarData = await res.json()

    if (!res.ok) {
      console.error("Mayar API Error:", mayarData)
      throw new Error(mayarData.message || 'Gagal membuat invoice Mayar')
    }

    // mayarData response structure assumes data.paymentUrl and data.id exists
    // (Adjust based on Mayar.id actual API response structure)
    const paymentUrl = mayarData.data?.paymentUrl || mayarData.paymentUrl || mayarData.link
    const invoiceId = mayarData.data?.id || mayarData.id

    if (!paymentUrl || !invoiceId) {
      throw new Error('Invalid response from Mayar API')
    }

    // Insert pending transaction
    const { error: dbError } = await supabase
      .from('topup_pending')
      .insert({
        user_id: user.id,
        mayar_invoice_id: String(invoiceId),
        amount: credits,
        status: 'pending'
      })

    if (dbError) throw dbError

    // Redirect to Mayar payment page
    return NextResponse.redirect(paymentUrl, 303)

  } catch (err: any) {
    console.error('Create Topup Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
