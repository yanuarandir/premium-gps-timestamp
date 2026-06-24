import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function TopUpSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center space-y-6">
        <div className="flex justify-center text-green-500">
          <CheckCircle className="w-20 h-20" />
        </div>
        <h1 className="text-2xl font-bold">Pembayaran Berhasil!</h1>
        <p className="text-slate-600">
          Kredit Anda sedang diproses dan akan segera masuk ke akun Anda. Jika belum masuk, silakan muat ulang halaman editor beberapa saat lagi.
        </p>
        <div className="pt-4">
          <Link href="/editor">
            <Button className="w-full bg-[#185FA5] hover:bg-[#185FA5]/90">Kembali ke Editor</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
