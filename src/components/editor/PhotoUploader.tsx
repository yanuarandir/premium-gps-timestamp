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
      {/* Subtle Background & Border */}
      <div className="absolute inset-0 bg-zinc-900/30 group-hover:bg-zinc-900/50 transition-colors" />
      <div className="absolute inset-0 border-2 border-dashed border-white/15 group-hover:border-white/40 rounded-2xl transition-colors" />
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      <div className="relative z-10 flex flex-col items-center max-w-md px-2">
        <UploadCloud className="w-12 h-12 sm:w-16 sm:h-16 text-white mb-4 group-hover:-translate-y-1 transition-transform" />
        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Unggah Foto</h3>
        <p className="text-muted-foreground text-center mb-6 sm:mb-8 text-sm sm:text-base">Pilih foto dari galeri Anda untuk ditambahkan watermark tanggal, waktu, dan lokasi GPS.</p>
        <Button className="bg-white text-black hover:bg-zinc-200 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-xl font-bold transition-all" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Pilih File
        </Button>
      </div>
    </div>
  )
}
