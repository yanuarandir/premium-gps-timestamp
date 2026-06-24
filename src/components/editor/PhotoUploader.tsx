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
    <div className="group relative flex flex-col items-center justify-center p-8 lg:p-12 rounded-2xl w-full h-full min-h-[350px] cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.01]" onClick={() => fileInputRef.current?.click()}>
      {/* Gradient Background & Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 group-hover:from-pink-500/10 group-hover:to-orange-500/10 transition-colors" />
      <div className="absolute inset-0 border-2 border-dashed border-[#FF5656]/30 group-hover:border-[#FF5656] rounded-2xl transition-colors" />
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <UploadCloud className="w-16 h-16 text-[#FF5656] mb-4 group-hover:-translate-y-1 transition-transform" />
        <h3 className="text-2xl font-semibold text-white mb-2">Unggah Foto</h3>
        <p className="text-muted-foreground text-center mb-8">Pilih foto dari galeri Anda untuk ditambahkan watermark tanggal, waktu, dan lokasi GPS.</p>
        <Button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90 px-8 py-6 text-lg rounded-xl shadow-lg shadow-pink-500/20" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Pilih File
        </Button>
      </div>
    </div>
  )
}
