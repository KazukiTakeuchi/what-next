import { useState } from 'react'

type Props = {
  text: string
  label?: string
}

export default function CopyButton({ text, label = 'コピー' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Fallback for HTTP or permission denied
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
    }
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full py-3 glass-strong rounded-2xl text-base font-medium text-pink-600 active:scale-[0.97] transition-all"
    >
      {copied ? 'コピーしました!' : label}
    </button>
  )
}
