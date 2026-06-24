import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Mode tanpa login: langsung bypass semua middleware
  return NextResponse.next({
    request,
  })
}
