type Props = {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: Props) {
  return (
    <header className="w-full text-center py-3 px-4">
      <h1 className="text-lg font-semibold tracking-tight text-gray-900/80">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-gray-600/70">{subtitle}</p>}
    </header>
  )
}
