import { NextResponse } from 'next/server'

function extractCoords(str: string): { lat: number; lng: number } | null {
  // 1. Pattern @lat,lng
  const match = str.match(/@(-?\d{1,2}\.\d{3,}),(-?\d{1,3}\.\d{3,})/)
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  
  // 2. Pattern !3dlat!4dlng
  const dataMatch = str.match(/!3d(-?\d{1,2}\.\d{3,})!4d(-?\d{1,3}\.\d{3,})/)
  if (dataMatch) {
    return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) }
  }

  // 3. Parameter ll=lat,lng atau q=lat,lng atau query=lat,lng
  const paramMatch = str.match(/[?&](?:ll|q|query)=(-?\d{1,2}\.\d{3,}),(-?\d{1,3}\.\d{3,})/)
  if (paramMatch) {
    return { lat: parseFloat(paramMatch[1]), lng: parseFloat(paramMatch[2]) }
  }

  // 4. Center/marker array di html/json: [-6.123456, 106.123456]
  const arrMatch = str.match(/\[(-?\d{1,2}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})\]/)
  if (arrMatch) {
    return { lat: parseFloat(arrMatch[1]), lng: parseFloat(arrMatch[2]) }
  }

  return null
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    const rawInput = url.trim()

    // 0. Jika user langsung memasukkan teks koordinat (contoh: "-6.2088, 106.8456")
    const coordMatch = rawInput.match(/^(-?\d{1,2}\.\d{3,})[,\s]+(-?\d{1,3}\.\d{3,})$/)
    if (coordMatch) {
      return NextResponse.json({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) })
    }

    // Ekstrak URL jika ada teks pendamping (contoh copy dari Share Google Maps mobile)
    const urlMatch = rawInput.match(/https?:\/\/[^\s]+/)
    let targetUrl = urlMatch ? urlMatch[0] : rawInput

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }

    // Validasi basic URL Google Maps / goo.gl / share.google
    if (!targetUrl.includes('google') && !targetUrl.includes('goo.gl') && !targetUrl.includes('maps')) {
      return NextResponse.json({ error: 'Bukan link Google Maps yang valid' }, { status: 400 })
    }

    // Follow redirect dengan User-Agent browser agar Google Maps tidak memblokir
    const response = await fetch(targetUrl, { 
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    })
    
    const finalUrl = response.url

    // Coba ekstrak dari URL hasil redirect
    let coords = extractCoords(finalUrl)
    if (coords) {
      return NextResponse.json(coords)
    }

    // Jika di URL belum ketemu, coba baca isi HTML (biasanya ada canonical link / meta tag / script JS redirect)
    const htmlContent = await response.text()
    coords = extractCoords(htmlContent)
    if (coords) {
      return NextResponse.json(coords)
    }

    return NextResponse.json({ error: 'Tidak dapat mengekstrak koordinat dari link tersebut' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses URL' }, { status: 500 })
  }
}
