'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff } from 'lucide-react'

export function PasswordGuard({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('access_unlocked') === 'true') {
      setIsUnlocked(true)
    }
    setIsChecking(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'nadilacantik') {
      setIsUnlocked(true)
      sessionStorage.setItem('access_unlocked', 'true')
      setError(false)
    } else {
      setError(true)
    }
  }

  if (isChecking) {
    return <div className="fixed inset-0 z-[100] bg-[#000000]" />
  }

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000] p-4">
      <div className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        <div className="w-14 h-14 bg-rose-500/15 text-rose-400 rounded-full flex items-center justify-center mb-5">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Akses Terkunci</h2>
        <p className="text-muted-foreground text-center mb-6 text-sm sm:text-base">Masukkan password untuk membuka website ini.</p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
          <div className="relative w-full">
            <Input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Password..." 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              className={`h-11 sm:h-12 bg-[#1A1A1A] text-center text-base text-white rounded-xl pr-11 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-rose-400'}`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-1"
              title={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">Password salah!</p>}
          <Button 
            type="submit" 
            className="h-11 sm:h-12 w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white text-base rounded-xl font-bold mt-2 shadow-lg shadow-rose-500/15 transition-all"
          >
            Buka Akses
          </Button>
        </form>
      </div>
    </div>
  )
}
