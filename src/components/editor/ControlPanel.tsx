'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Crosshair, Image as ImageIcon, Loader2 } from 'lucide-react'
import type { TextStyle, TimestampData, MapData, FilterData } from './EditorWorkspace'
import { toast } from 'sonner'

interface ControlPanelProps {
  textStyle: TextStyle
  setTextStyle: React.Dispatch<React.SetStateAction<TextStyle>>
  timestampData: TimestampData
  setTimestampData: React.Dispatch<React.SetStateAction<TimestampData>>
  mapData: MapData
  setMapData: React.Dispatch<React.SetStateAction<MapData>>
  filterData: FilterData
  setFilterData: React.Dispatch<React.SetStateAction<FilterData>>
}

export function ControlPanel({
  textStyle, setTextStyle,
  timestampData, setTimestampData,
  mapData, setMapData,
  filterData, setFilterData
}: ControlPanelProps) {
  
  const [mapsLink, setMapsLink] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)

  const handleSetNow = () => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ' ')
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5)
    setTimestampData(prev => ({ ...prev, date: `${dateStr} ${timeStr}` }))
  }

  const fetchReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=id`)
      const data = await res.json()
      
      if (data && data.address) {
        const addr = data.address
        setTimestampData(prev => ({
          ...prev,
          loc1: addr.village || addr.suburb || addr.neighbourhood || '',
          loc2: addr.county || addr.city_district || '',
          loc3: addr.city || addr.town || addr.municipality || '',
          loc4: addr.state || addr.region || ''
        }))
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }

  const applyLocation = (latitude: number, longitude: number) => {
    const latStr = `${Math.abs(latitude).toFixed(4)}${latitude >= 0 ? 'N' : 'S'}`
    const lngStr = `${Math.abs(longitude).toFixed(4)}${longitude >= 0 ? 'E' : 'W'}`
    
    setTimestampData(prev => ({ ...prev, gps: `${latStr} ${lngStr}` }))
    setMapData(prev => ({ ...prev, lat: latitude, lng: longitude }))
    fetchReverseGeocode(latitude, longitude)
  }

  const handleAutoGPS = () => {
    toast.loading('Mencoba GPS Satelit...', { id: 'gps' })

    const fallbackToIP = async () => {
      toast.loading('Mengambil lokasi via Jaringan IP...', { id: 'gps' })
      try {
        const res = await fetch('https://ipwho.is/')
        const data = await res.json()
        if (data && data.success && data.latitude && data.longitude) {
          applyLocation(data.latitude, data.longitude)
          if (data.city || data.region) {
            setTimestampData(prev => ({
              ...prev,
              loc2: data.city || prev.loc2,
              loc4: data.region || prev.loc4
            }))
          }
          toast.success('Lokasi berhasil didapatkan (via Jaringan IP)!', { id: 'gps' })
        } else {
          throw new Error('Layanan IP tidak mendeteksi koordinat')
        }
      } catch (err: any) {
        toast.error('Semua metode gagal mengambil lokasi di device ini.', { id: 'gps' })
      }
    }

    const fallbackToNetwork = () => {
      toast.loading('Mencoba GPS Jaringan Seluler...', { id: 'gps' })
      if (!navigator.geolocation) {
        fallbackToIP()
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyLocation(pos.coords.latitude, pos.coords.longitude)
          toast.success('Lokasi berhasil didapatkan!', { id: 'gps' })
        },
        () => fallbackToIP(),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 }
      )
    }

    if (!navigator.geolocation) {
      fallbackToIP()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation(pos.coords.latitude, pos.coords.longitude)
        toast.success('Lokasi akurat berhasil didapatkan!', { id: 'gps' })
      },
      () => fallbackToNetwork(),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }

  const handleExtractLink = async () => {
    if (!mapsLink) {
      toast.error('Masukkan link Google Maps terlebih dahulu')
      return
    }

    setIsExtracting(true)
    toast.loading('Mengekstrak koordinat...', { id: 'extract-maps' })

    try {
      const res = await fetch('/api/resolve-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mapsLink })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengekstrak link')
      }

      const { lat, lng } = data

      applyLocation(lat, lng)

      toast.success('Koordinat berhasil diekstrak!', { id: 'extract-maps' })
      setMapsLink('') 
    } catch (error) {
      const err = error as Error
      toast.error(err.message || 'Terjadi kesalahan', { id: 'extract-maps' })
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      
      {/* SECTION 1: WAKTU */}
      <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-5 sm:p-8 shadow-lg">
        <h3 className="text-xl font-medium text-white mb-6">Tanggal & Waktu</h3>
        <div className="flex flex-col gap-5 mb-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider block font-semibold">Tanggal</Label>
            <Input 
              type="date"
              className="w-full bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm cursor-pointer rounded-xl"
              onClick={(e) => {
                if ('showPicker' in HTMLInputElement.prototype) {
                  try { e.currentTarget.showPicker() } catch (err) {}
                }
              }}
              value={(() => {
                const parts = timestampData.date.split(' ')
                if (parts.length >= 3) {
                  return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
                }
                return ''
              })()}
              onChange={e => {
                const val = e.target.value
                if (val) {
                  const newDate = val.replace(/-/g, ' ')
                  const parts = timestampData.date.split(' ')
                  const timeStr = parts.length >= 4 ? parts.slice(3).join(' ') : '12:00'
                  setTimestampData(prev => ({ ...prev, date: `${newDate} ${timeStr}` }))
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider block font-semibold">Waktu</Label>
            <Input 
              type="time"
              className="w-full bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm cursor-pointer rounded-xl"
              onClick={(e) => {
                if ('showPicker' in HTMLInputElement.prototype) {
                  try { e.currentTarget.showPicker() } catch (err) {}
                }
              }}
              value={(() => {
                const parts = timestampData.date.split(' ')
                if (parts.length >= 4) {
                  return parts[3]
                }
                return ''
              })()}
              onChange={e => {
                const val = e.target.value
                if (val) {
                  const parts = timestampData.date.split(' ')
                  if (parts.length >= 3) {
                    setTimestampData(prev => ({ ...prev, date: `${parts[0]} ${parts[1]} ${parts[2]} ${val}` }))
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: LOKASI */}
      <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-5 sm:p-8 space-y-5 shadow-lg relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-medium text-white">Lokasi Saat Ini</h3>
          <Button onClick={handleAutoGPS} size="sm" className="bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-400/30 rounded-full px-4 py-1.5 h-8 text-xs font-semibold transition-all">
            <Crosshair className="w-3.5 h-3.5 mr-1.5" />
            Ambil Otomatis
          </Button>
        </div>
        
        {/* Input Google Maps Link */}
        <div className="mb-6 border-b border-[#1E1E1E] pb-6 mt-4">
          <Label className="text-muted-foreground text-sm uppercase tracking-wider mb-3 block font-semibold">Paste Link Google Maps (Opsional)</Label>
          <div className="flex flex-row items-center gap-2">
            <Input 
              className="bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm flex-1 rounded-xl"
              placeholder="Contoh: https://maps.app.goo.gl/..."
              value={mapsLink}
              onChange={e => setMapsLink(e.target.value)}
            />
            <Button 
               type="button"
               title="Ekstrak Link"
               aria-label="Ekstrak Link"
               className="h-10 sm:h-11 w-10 sm:w-11 shrink-0 p-0 bg-rose-500/15 border border-rose-400/30 hover:bg-rose-500 hover:text-white text-rose-300 rounded-xl transition-all flex items-center justify-center font-semibold"
               onClick={handleExtractLink}
               disabled={isExtracting}
            >
               {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block font-semibold">Koordinat (Lat, Long)</Label>
            <Input className="bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm rounded-xl" placeholder="-6.200000, 106.816666" 
              value={timestampData.gps} 
              onChange={e => setTimestampData(prev => ({ ...prev, gps: e.target.value }))} 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block font-semibold">Baris 1</Label>
              <Input className="bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm rounded-xl" placeholder="Kelurahan" value={timestampData.loc1} onChange={e => setTimestampData(prev => ({ ...prev, loc1: e.target.value }))} />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block font-semibold">Baris 2</Label>
              <Input className="bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm rounded-xl" placeholder="Kecamatan" value={timestampData.loc2} onChange={e => setTimestampData(prev => ({ ...prev, loc2: e.target.value }))} />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block font-semibold">Baris 3</Label>
              <Input className="bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm rounded-xl" placeholder="Kota" value={timestampData.loc3} onChange={e => setTimestampData(prev => ({ ...prev, loc3: e.target.value }))} />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block font-semibold">Baris 4</Label>
              <Input className="bg-[#1A1A1A] border-transparent text-white focus:border-rose-400 h-10 sm:h-11 text-sm rounded-xl" placeholder="Provinsi" value={timestampData.loc4} onChange={e => setTimestampData(prev => ({ ...prev, loc4: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: STYLE TEKS */}
      <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-5 sm:p-8 space-y-8 shadow-lg">
        <h3 className="text-xl font-medium text-white">Gaya Teks & Latar</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-muted-foreground text-base">Ukuran Font</Label> 
            <span className="text-white font-mono font-bold text-lg">{textStyle.size}px</span>
          </div>
          <Slider 
            min={12} max={80} step={1} 
            value={[textStyle.size]} 
            onValueChange={(v: any) => setTextStyle(prev => ({ ...prev, size: Array.isArray(v) ? v[0] : v }))} 
          />
        </div>
        
        <div className="space-y-4">
          <Label className="text-muted-foreground text-base block mb-4">Warna Teks</Label>
          <div className="flex flex-wrap gap-4">
            {['#ffffff', '#facc15', '#f87171', '#60a5fa', '#000000'].map(c => (
              <button 
                key={c}
                type="button"
                className={`w-10 h-10 rounded-full border-[3px] transition-all ${textStyle.color === c ? 'border-rose-400 scale-110 ring-2 ring-rose-400/30' : 'border-[#1E1E1E]'}`}
                style={{ backgroundColor: c }}
                onClick={() => setTextStyle(prev => ({ ...prev, color: c }))}
              />
            ))}
            <Input 
              type="color" 
              className="w-10 h-10 p-0 border-0 rounded-full overflow-hidden cursor-pointer" 
              value={textStyle.color} 
              onChange={e => setTextStyle(prev => ({ ...prev, color: e.target.value }))} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-muted-foreground text-base block mb-4">Bentuk Latar Belakang</Label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { id: 'plain', label: 'Polos' },
              { id: 'shadow', label: 'Bayangan' },
              { id: 'box', label: 'Kaku' },
              { id: 'rounded', label: 'Lengkung' },
              { id: 'pill', label: 'Lonjong' }
            ].map(variant => (
              <button 
                key={variant.id} 
                type="button"
                onClick={() => setTextStyle(prev => ({ ...prev, variant: variant.id as TextStyle['variant'] }))}
                className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all border-2 ${textStyle.variant === variant.id ? 'border-rose-400 bg-rose-500/15 text-rose-300 shadow-md font-semibold' : 'border-[#1E1E1E] bg-[#1A1A1A] text-muted-foreground hover:border-rose-400/30 hover:bg-[#222]'}`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-muted-foreground text-base">Opacity Latar</Label> 
            <span className="text-white font-mono font-bold text-lg">{textStyle.opacity}%</span>
          </div>
          <Slider 
            min={10} max={100} step={1} 
            value={[textStyle.opacity]} 
            onValueChange={(v: any) => setTextStyle(prev => ({ ...prev, opacity: Array.isArray(v) ? v[0] : v }))} 
          />
        </div>
      </div>

      {/* SECTION 4: MAP & FILTER */}
      <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-5 sm:p-8 space-y-8 shadow-lg">
        <h3 className="text-xl font-medium text-white flex items-center justify-between">
          <span>Mini Map</span>
          <div className="flex items-center gap-3">
            <span className="text-base text-muted-foreground">Tampilkan</span>
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-rose-500 rounded border-[#1E1E1E] cursor-pointer"
              checked={mapData.visible}
              onChange={e => setMapData(prev => ({ ...prev, visible: e.target.checked }))}
            />
          </div>
        </h3>

        {mapData.visible && (
          <div className="space-y-8 pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground text-base">Zoom Level</Label> 
                <span className="text-white font-mono font-bold text-lg">{mapData.zoom}x</span>
              </div>
              <Slider 
                min={12} max={18} step={1} 
                value={[mapData.zoom]} 
                onValueChange={(v: any) => setMapData(prev => ({ ...prev, zoom: Array.isArray(v) ? v[0] : v }))} 
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground text-base">Opacity Map</Label> 
                <span className="text-white font-mono font-bold text-lg">{mapData.opacity}%</span>
              </div>
              <Slider 
                min={10} max={100} step={1} 
                value={[mapData.opacity]} 
                onValueChange={(v: any) => setMapData(prev => ({ ...prev, opacity: Array.isArray(v) ? v[0] : v }))} 
              />
            </div>
          </div>
        )}

        <div className="pt-8 mt-8 border-t border-[#1E1E1E]">
          <h3 className="text-xl font-medium text-white mb-8">Filter Foto</h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground text-base">Brightness</Label> 
                <span className="text-white font-mono font-bold text-lg">{filterData.brightness}%</span>
              </div>
              <Slider 
                min={50} max={150} step={1} 
                value={[filterData.brightness]} 
                onValueChange={(v: any) => setFilterData(prev => ({ ...prev, brightness: Array.isArray(v) ? v[0] : v }))} 
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground text-base">Contrast</Label> 
                <span className="text-white font-mono font-bold text-lg">{filterData.contrast}%</span>
              </div>
              <Slider 
                min={50} max={150} step={1} 
                value={[filterData.contrast]} 
                onValueChange={(v: any) => setFilterData(prev => ({ ...prev, contrast: Array.isArray(v) ? v[0] : v }))} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
