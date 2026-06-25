'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export function PasswordGuard({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

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
      <div className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Akses Terkunci</h2>
        <p className="text-muted-foreground text-center mb-8 text-sm sm:text-base">Masukkan password untuk membuka website ini.</p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
          <Input 
            type="password" 
            placeholder="Password..." 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            className={`h-12 sm:h-14 bg-[#1A1A1A] text-center text-base sm:text-lg text-white rounded-xl ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-white'}`}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center font-medium">Password salah!</p>}
          <Button 
            type="submit" 
            className="h-12 sm:h-14 w-full bg-white hover:bg-zinc-200 text-black text-base sm:text-lg rounded-xl font-bold mt-2 shadow-lg transition-all"
          >
            Buka Akses
          </Button>
        </form>
      </div>
    </div>
  )
}
