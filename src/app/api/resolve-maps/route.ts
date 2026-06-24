import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    // Validasi basic URL
    if (!url.includes('google.com/maps') && !url.includes('maps.app.goo.gl') && !url.includes('goo.gl/maps')) {
      return NextResponse.json({ error: 'Bukan link Google Maps yang valid' }, { status: 400 })
    }

    // Follow redirect to get actual coordinates
    const response = await fetch(url, { redirect: 'follow' })
    const finalUrl = response.url

    // Coba ekstrak lat/lng dari URL yang sudah redirect (@lat,lng)
    const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match) {
      return NextResponse.json({ lat: parseFloat(match[1]), lng: parseFloat(match[2]) })
    }
    
    // Coba ekstrak dari !3d dan !4d
    const dataMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (dataMatch) {
      return NextResponse.json({ lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) })
    }

    // Ekstrak dari parameter ll=lat,lng
    const urlObj = new URL(finalUrl)
    const ll = urlObj.searchParams.get('ll')
    if (ll) {
      const [lat, lng] = ll.split(',')
      return NextResponse.json({ lat: parseFloat(lat), lng: parseFloat(lng) })
    }

    return NextResponse.json({ error: 'Tidak dapat mengekstrak koordinat dari link tersebut' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses URL' }, { status: 500 })
  }
}
