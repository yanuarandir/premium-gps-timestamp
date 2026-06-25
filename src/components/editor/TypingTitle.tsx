'use client'

import { useEffect, useState } from 'react'

export function TypingTitle({ text, className = "" }: { text: string, className?: string }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(interval)
        setIsComplete(true)
      }
    }, 120) // Kecepatan ketikan
    
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {displayedText}
      <span className={`w-[4px] h-[1.1em] bg-white ml-2 rounded-full ${isComplete ? 'animate-pulse' : ''}`}></span>
    </span>
  )
}
