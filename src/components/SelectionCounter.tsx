type Props = {
  current: number
  max: number
}

export default function SelectionCounter({ current, max }: Props) {
  const remaining = max - current

  return (
    <div className="pill-liquid rounded-full px-4 py-1.5 inline-flex items-center gap-1.5">
      <span className="text-lg font-bold text-pink-600">
        {remaining > 0 ? `あと ${remaining} 枚` : 'OK!'}
      </span>
      <span className="text-sm text-gray-400">
        ({current}/{max})
      </span>
    </div>
  )
}
