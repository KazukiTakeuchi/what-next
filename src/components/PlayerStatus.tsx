type Props = {
  nickname: string
  done: boolean
  online?: boolean
}

export default function PlayerStatus({ nickname, done, online = true }: Props) {
  return (
    <div className="pill-liquid rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-sm">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-green-400' : 'bg-gray-300'} ${!done && online ? 'animate-pulse' : ''}`}
      />
      <span className="text-gray-700">{nickname}</span>
      <span className={done ? 'text-pink-500 font-medium' : 'text-gray-400'}>
        {done ? '選びました!' : '選んでいます...'}
      </span>
    </div>
  )
}
