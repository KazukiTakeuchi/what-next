type Props = {
  value: string
  onChange: (value: string) => void
}

export default function NicknameInput({ value, onChange }: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="ニックネーム"
      maxLength={10}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      className="w-full px-4 py-3 rounded-2xl input-liquid
        text-center text-base text-gray-700 placeholder-gray-400
        transition-all"
    />
  )
}
