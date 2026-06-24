import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DOWNLOAD_COST = 1000

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('saldo')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    /* 
    --- PEMBAYARAN DINONAKTIFKAN SEMENTARA UNTUK TESTING ---
    if (profile.saldo < DOWNLOAD_COST) {
      return NextResponse.json({ error: 'Saldo tidak cukup' }, { status: 402 }) // Payment Required
    }

    const newSaldo = profile.saldo - DOWNLOAD_COST

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ saldo: newSaldo })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Insert transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'download',
        amount: -DOWNLOAD_COST,
        saldo_after: newSaldo,
        description: 'Download foto GPS Timestamp',
      })
    */

    // Mock successful download without reducing credit for testing
    const newSaldo = profile.saldo;

    return NextResponse.json({ success: true, newSaldo })

  } catch (err: any) {
    console.error('Download Deduct Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
