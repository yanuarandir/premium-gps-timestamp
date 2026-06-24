'use client'

import { useState, useRef, useEffect } from 'react'
import { TypingTitle } from './TypingTitle'
import { PhotoUploader } from './PhotoUploader'
import { CropModal } from './CropModal'
import { ControlPanel } from './ControlPanel'
import { OverlayText } from './OverlayText'
import { OverlayMap } from './OverlayMap'
import { Button } from '@/components/ui/button'
import { Download, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'

export type TextStyle = {
  size: number
  color: string
  opacity: number
  variant: 'plain' | 'shadow' | 'box' | 'rounded' | 'pill'
  align: 'left' | 'center' | 'right'
}

export type TimestampData = {
  date: string
  gps: string
  loc1: string
  loc2: string
  loc3: string
  loc4: string
}

export type MapData = {
  visible: boolean
  lat: number | null
  lng: number | null
  zoom: number
  size: number
  opacity: number
}

export type FilterData = {
  brightness: number
  contrast: number
}

export function EditorWorkspace() {
  const router = useRouter()
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [imgDimensions, setImgDimensions] = useState<{ w: number, h: number } | null>(null)

  const workspaceRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Overlay States
  const [textStyle, setTextStyle] = useState<TextStyle>({
    size: 24,
    color: '#ffffff',
    opacity: 100,
    variant: 'box',
    align: 'right',
  })

  const [timestampData, setTimestampData] = useState<TimestampData>({
    date: new Date().toISOString().split('T')[0].replace(/-/g, ' '),
    gps: '8.0744S 112.1354E',
    loc1: 'Sumber',
    loc2: 'Kecamatan Sanankulon',
    loc3: 'Kabupaten Blitar',
    loc4: 'Jawa Timur',
  })

  const [mapData, setMapData] = useState<MapData>({
    visible: true,
    lat: -8.0744,
    lng: 112.1354,
    zoom: 14,
    size: 25, // percentage of image width
    opacity: 100,
  })

  const [filterData, setFilterData] = useState<FilterData>({
    brightness: 100,
    contrast: 100,
  })

  const handleImageSelect = (url: string) => {
    setImageSrc(url)
    setIsCropping(true)
  }

  const handleCropComplete = (url: string) => {
    setCroppedImageUrl(url)
    setImgDimensions(null) // reset dimensions so overlays reposition
    setIsCropping(false)
  }

  const cancelCrop = () => {
    setIsCropping(false)
    if (!croppedImageUrl) {
      setImageSrc(null) // reset if they haven't cropped yet
    }
  }

  const handleDownload = async () => {
    if (!workspaceRef.current || !imgRef.current || !croppedImageUrl) return

    setIsDownloading(true)
    toast.loading('Memproses foto...', { id: 'download' })

    try {
      // Pemotongan saldo dinonaktifkan sepenuhnya.

      // 1.5 Prepare filtered image for html2canvas (because it ignores CSS filters)
      const originalSrc = croppedImageUrl
      if (filterData.brightness !== 100 || filterData.contrast !== 100) {
        const canvas = document.createElement('canvas')
        canvas.width = imgRef.current.naturalWidth
        canvas.height = imgRef.current.naturalHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.filter = `brightness(${filterData.brightness}%) contrast(${filterData.contrast}%)`
          ctx.drawImage(imgRef.current, 0, 0)
          const filteredDataUrl = canvas.toDataURL('image/jpeg', 1.0)
          imgRef.current.src = filteredDataUrl
        }
      }

      // 2. We use html2canvas to render the #export-target
      const canvas = await html2canvas(workspaceRef.current, {
        useCORS: true, // for the map tiles
        allowTaint: true,
        scale: 1, // matches natural size
      })

      // Restore original src
      imgRef.current.src = originalSrc

      // 3. Download the image
      const imageBlobUrl = canvas.toDataURL('image/jpeg', 0.95)
      const link = document.createElement('a')
      const fileName = `timestamp-${new Date().toISOString().split('T')[0]}-${new Date().getHours()}${new Date().getMinutes()}.jpg`
      link.download = fileName
      link.href = imageBlobUrl
      link.click()

      toast.success('Foto berhasil diunduh!', { id: 'download' })
      router.refresh() // refresh saldo header

    } catch (e: any) {
      toast.error('Gagal mendownload foto: ' + e.message, { id: 'download' })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleReset = () => {
    if (confirm("Mulai ulang dengan foto baru? Semua pengaturan akan di-reset.")) {
      setImageSrc(null)
      setCroppedImageUrl(null)
      setIsCropping(false)
    }
  }

  return (
    <div className="w-full bg-[#000000] min-h-screen text-white py-8 md:py-12 px-4 md:px-16 flex flex-col items-center justify-center relative">

      {croppedImageUrl && !isCropping && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleReset} 
          title="Kembali ke Beranda"
          className="absolute top-6 left-8 md:top-8 md:left-16 xl:left-32 text-white bg-[#0D0D0D] border-white/10 hover:bg-[#1A1A1A] hover:border-[#FF5656]/50 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,86,86,0.3)] rounded-full w-14 h-14 transition-all duration-300 z-50"
        >
          <ArrowLeft className="w-8 h-8" />
        </Button>
      )}

      <div className="text-center mb-16 w-full flex justify-center mt-8 md:mt-0">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-mono text-white tracking-wide">
          <TypingTitle text="Generate Timestamp GRATIS!" />
        </h2>
      </div>

      <div className="w-full max-w-[1600px] flex flex-col-reverse lg:grid lg:grid-cols-12 rounded-2xl overflow-hidden bg-[#0D0D0D] border border-white/5 shadow-2xl">

        {/* Left Column: Control Panel */}
        <div className="flex flex-col border-t lg:border-t-0 lg:border-r border-[#1E1E1E] lg:col-span-5 xl:col-span-4 h-full lg:max-h-[85vh] bg-[#080808]">
          {croppedImageUrl && !isCropping ? (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 xl:p-12">
                <ControlPanel
                  textStyle={textStyle} setTextStyle={setTextStyle}
                  timestampData={timestampData} setTimestampData={setTimestampData}
                  mapData={mapData} setMapData={setMapData}
                  filterData={filterData} setFilterData={setFilterData}
                />
              </div>
              <div className="p-6 lg:px-8 xl:px-12 pb-6 lg:pb-8 xl:pb-12 pt-6 border-t border-[#1E1E1E] bg-[#080808] z-10 shrink-0">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white h-16 text-xl rounded-xl font-bold shadow-lg shadow-pink-500/20"
                >
                  {isDownloading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Download className="mr-2 h-6 w-6" />}
                  Download Foto
                </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center min-h-[400px] p-6 lg:p-8 xl:p-12">
              <p className="text-muted-foreground text-center text-lg">Tolong unggah foto di area sebelah kanan terlebih dahulu.</p>
            </div>
          )}
        </div>

        {/* Right Column: Main Workspace Area */}
        <div className="relative p-6 lg:p-12 min-h-[500px] lg:h-full lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-start lg:justify-center bg-black/40">
          {!imageSrc && !croppedImageUrl && (
            <div className="w-full h-full flex-1 flex flex-col">
              <PhotoUploader onImageSelect={handleImageSelect} />
            </div>
          )}

          {croppedImageUrl && !isCropping && (
            <div
              id="export-target"
              ref={workspaceRef}
              className="relative shadow-2xl overflow-hidden rounded-md max-w-full ring-1 ring-white/10"
              style={{ display: 'inline-block' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={croppedImageUrl}
                alt="Cropped workspace"
                className="max-w-full max-h-[60vh] lg:max-h-[75vh] object-contain pointer-events-none"
                style={{ filter: `brightness(${filterData.brightness}%) contrast(${filterData.contrast}%)` }}
                onLoad={(e) => {
                  setImgDimensions({ w: e.currentTarget.clientWidth, h: e.currentTarget.clientHeight })
                }}
              />

              {imgDimensions && (
                <>
                  <OverlayText
                    data={timestampData}
                    style={textStyle}
                    bounds="parent"
                    containerWidth={imgDimensions.w}
                    containerHeight={imgDimensions.h}
                  />

                  {mapData.visible && (
                    <OverlayMap
                      data={mapData}
                      bounds="parent"
                      containerWidth={imgDimensions.w}
                      containerHeight={imgDimensions.h}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {isCropping && imageSrc && (
        <CropModal
          imageSrc={imageSrc}
          onComplete={handleCropComplete}
          onCancel={cancelCrop}
        />
      )}
    </div>
  )
}
