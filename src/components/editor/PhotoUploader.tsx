'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { UploadCloud } from 'lucide-react'

interface PhotoUploaderProps {
  onImageSelect: (url: string) => void
}

export function PhotoUploader({ onImageSelect }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      onImageSelect(imageUrl)
    }
  }

  return (
    <div className="group relative flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 rounded-2xl w-full h-full min-h-[260px] sm:min-h-[350px] cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.01]" onClick={() => fileInputRef.current?.click()}>
      {/* Soft Rose Background & Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-amber-500/5 group-hover:from-rose-500/10 group-hover:to-amber-500/10 transition-colors" />
      <div className="absolute inset-0 border-2 border-dashed border-rose-400/30 group-hover:border-rose-400 rounded-2xl transition-colors" />
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      <div className="relative z-10 flex flex-col items-center max-w-md px-2">
        <UploadCloud className="w-12 h-12 sm:w-16 sm:h-16 text-rose-400 mb-4 group-hover:-translate-y-1 transition-transform" />
        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Unggah Foto</h3>
        <p className="text-muted-foreground text-center mb-6 sm:mb-8 text-sm sm:text-base">Pilih foto dari galeri Anda untuk ditambahkan watermark tanggal, waktu, dan lokasi GPS.</p>
        <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:opacity-95 h-10 sm:h-11 px-6 text-sm sm:text-base rounded-xl shadow-md shadow-rose-500/15 font-bold transition-all" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Pilih File
        </Button>
      </div>
    </div>
  )
}
