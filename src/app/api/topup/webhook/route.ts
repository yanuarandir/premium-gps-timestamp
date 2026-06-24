import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    
    // Verify signature logic would go here:
    // const signature = request.headers.get('x-mayar-signature')
    // const expectedSignature = crypto.createHmac('sha256', process.env.MAYAR_WEBHOOK_SECRET!).update(rawBody).digest('hex')
    // if (signature !== expectedSignature) throw new Error('Invalid signature')

    const body = JSON.parse(rawBody)

    // We only care about successful payments
    if (body.status !== 'paid' && body.status !== 'settled') {
      return NextResponse.json({ received: true })
    }

    const invoiceId = body.id || body.data?.id

    // Use Service Role key to bypass RLS since webhook is anonymous
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Find pending topup
    const { data: pendingTopup, error: fetchError } = await supabase
      .from('topup_pending')
      .select('*')
      .eq('mayar_invoice_id', String(invoiceId))
      .eq('status', 'pending')
      .single()

    if (fetchError || !pendingTopup) {
      console.log('Topup not found or already processed', invoiceId)
      return NextResponse.json({ received: true })
    }

    // 2. Start "transaction" via RPC or multiple queries 
    // (Since Supabase doesn't have true transactions via JS API, we do it sequentially or via RPC. Sequentially is fine for MVP)
    
    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('saldo')
      .eq('id', pendingTopup.user_id)
      .single()

    const currentSaldo = profile?.saldo || 0
    const newSaldo = currentSaldo + pendingTopup.amount

    // Update profile
    await supabase
      .from('profiles')
      .update({ saldo: newSaldo })
      .eq('id', pendingTopup.user_id)

    // Mark pending as completed
    await supabase
      .from('topup_pending')
      .update({ status: 'completed' })
      .eq('id', pendingTopup.id)

    // Insert transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: pendingTopup.user_id,
        type: 'topup',
        amount: pendingTopup.amount,
        saldo_after: newSaldo,
        description: `Top up via Mayar.id`,
        mayar_invoice_id: String(invoiceId)
      })

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
