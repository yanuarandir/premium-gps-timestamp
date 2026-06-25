'use client'

import { useState, useRef, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface CropModalProps {
  imageSrc: string
  onComplete: (url: string) => void
  onCancel: () => void
}

export function CropModal({ imageSrc, onComplete, onCancel }: CropModalProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [aspect, setAspect] = useState<number | undefined>(undefined)

  // Initialize crop when image loads
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    })
  }

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      // If no crop was drawn, just return original image
      onComplete(imageSrc)
      return
    }

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    // Convert canvas to blob URL
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      onComplete(url)
    }, 'image/jpeg', 1)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl w-full max-h-[90vh] flex flex-col bg-[#0D0D0D] border-[#1E1E1E] text-white rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Crop Foto</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-[#000000] flex items-center justify-center min-h-[40vh] max-h-[60vh] rounded-xl border border-[#1E1E1E] relative mt-2">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            minWidth={100}
            minHeight={100}
            className="max-h-full flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[55vh] w-auto object-contain"
            />
          </ReactCrop>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-[#1E1E1E] justify-between items-center w-full">
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <Button 
              variant="outline" 
              className={aspect === undefined ? "bg-white text-black font-semibold border-transparent hover:bg-zinc-200" : "bg-[#1E1E1E] border-transparent text-muted-foreground hover:text-white hover:bg-[#2A2A2A]"} 
              size="sm" onClick={() => setAspect(undefined)}>Free</Button>
            <Button 
              variant="outline" 
              className={aspect === 4/3 ? "bg-white text-black font-semibold border-transparent hover:bg-zinc-200" : "bg-[#1E1E1E] border-transparent text-muted-foreground hover:text-white hover:bg-[#2A2A2A]"} 
              size="sm" onClick={() => setAspect(4/3)}>4:3</Button>
            <Button 
              variant="outline" 
              className={aspect === 16/9 ? "bg-white text-black font-semibold border-transparent hover:bg-zinc-200" : "bg-[#1E1E1E] border-transparent text-muted-foreground hover:text-white hover:bg-[#2A2A2A]"} 
              size="sm" onClick={() => setAspect(16/9)}>16:9</Button>
            <Button 
              variant="outline" 
              className={aspect === 1 ? "bg-white text-black font-semibold border-transparent hover:bg-zinc-200" : "bg-[#1E1E1E] border-transparent text-muted-foreground hover:text-white hover:bg-[#2A2A2A]"} 
              size="sm" onClick={() => setAspect(1)}>1:1</Button>
          </div>
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-white hover:bg-[#1E1E1E]">Batal</Button>
            <Button onClick={handleApplyCrop} className="bg-white text-black hover:bg-zinc-200 border-0 shadow-xl px-6 font-bold transition-all">Terapkan Crop</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
