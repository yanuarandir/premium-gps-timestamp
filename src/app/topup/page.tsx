import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const PACKAGES = [
  { id: 'pkg-5k', credits: 5000, price: 5000, name: 'Paket Hemat' },
  { id: 'pkg-10k', credits: 10000, price: 10000, name: 'Paket Standard' },
  { id: 'pkg-25k', credits: 25000, price: 25000, name: 'Paket Pro' },
  { id: 'pkg-50k', credits: 50000, price: 50000, name: 'Paket Sultan' },
]

export default async function TopUpPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('saldo')
    .eq('id', user.id)
    .single()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#185FA5]">Top Up Kredit</h1>
            <p className="text-slate-500">Saldo Anda saat ini: <strong className="text-slate-800">{profile?.saldo || 0} Kredit</strong></p>
          </div>
          <a href="/editor">
            <Button variant="outline">Kembali ke Editor</Button>
          </a>
        </header>

        <div>
          <h2 className="text-xl font-semibold mb-4">Pilih Paket Kredit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKAGES.map(pkg => (
              <Card key={pkg.id} className="border-2 border-transparent hover:border-[#185FA5] transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.credits.toLocaleString('id-ID')} Kredit</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Rp {pkg.price.toLocaleString('id-ID')}</p>
                </CardContent>
                <CardFooter>
                  <form action={`/api/topup/create`} method="POST" className="w-full">
                    <input type="hidden" name="amount" value={pkg.price} />
                    <input type="hidden" name="credits" value={pkg.credits} />
                    <Button type="submit" className="w-full bg-[#185FA5] hover:bg-[#185FA5]/90">
                      Beli
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3 text-right">Sisa Saldo</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map(trx => (
                  <tr key={trx.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(trx.created_at).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${trx.type === 'topup' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {trx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{trx.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${trx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trx.amount > 0 ? '+' : ''}{trx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right">{trx.saldo_after.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Belum ada transaksi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
