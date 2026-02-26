import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    num: 1,
    title: 'ルームをつくる',
    desc: 'ルームを作って、パートナーにURLを送ろう',
    icon: '🔗',
    color: 'from-pink-400/30 to-pink-300/10',
  },
  {
    num: 2,
    title: 'やりたいこと5つ選ぶ',
    desc: '配られた20枚のカードから、やりたいことを5枚選ぼう',
    icon: '✋',
    color: 'from-purple-400/30 to-purple-300/10',
  },
  {
    num: 3,
    title: 'カード交換',
    desc: '選んだ5枚が相手に届く。相手が選んだ5枚があなたに届く',
    icon: '🔄',
    color: 'from-blue-400/30 to-blue-300/10',
  },
  {
    num: 4,
    title: '一番やりたい1枚を選ぶ',
    desc: '届いた5枚の中から、一番やりたい1枚を選ぼう',
    icon: '💎',
    color: 'from-indigo-400/30 to-indigo-300/10',
  },
  {
    num: 5,
    title: '結果発表',
    desc: 'ふたりの答えが一致すれば即決定。違ったら「どっちがいい？」→ それでも決まらなかったらじゃんけんで決着！',
    icon: '🎉',
    color: 'from-yellow-400/30 to-yellow-300/10',
  },
]

export default function RulesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-mesh pb-12">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 text-center">
        <h1 className="text-2xl font-bold text-pink-600">あそびかた</h1>
        <p className="text-sm text-gray-500 mt-1">1〜3分でふたりの「やりたい」が決まる</p>
      </div>

      {/* Steps */}
      <div className="px-4 max-w-sm mx-auto space-y-3">
        {STEPS.map((step, i) => (
          <div key={step.num} className="relative">
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="absolute left-7 top-full w-0.5 h-3 bg-gradient-to-b from-white/40 to-transparent z-0" />
            )}

            <div className={`glass-card rounded-[20px] p-4 bg-gradient-to-br ${step.color}`}>
              <div className="flex items-start gap-3.5">
                {/* Step number circle */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full glass-strong flex items-center justify-center">
                  <span className="text-lg">{step.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="pill-liquid rounded-full px-2 py-0.5 text-xs font-bold text-pink-500">
                      STEP {step.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mt-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Point section */}
      <div className="px-4 max-w-sm mx-auto mt-6">
        <div className="glass rounded-[20px] p-5 space-y-3">
          <h2 className="text-base font-bold text-center text-purple-600">ポイント</h2>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="flex-shrink-0 mt-0.5 text-sm">💡</span>
              <p className="text-sm text-gray-600 leading-relaxed">
                「相手がやりたいことの中から、自分もやりたいものを選ぶ」のがコツ
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex-shrink-0 mt-0.5 text-sm">⏱️</span>
              <p className="text-sm text-gray-600 leading-relaxed">
                勝ち負けはなし。ふたりの気持ちがひとつになるゲームだよ
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex-shrink-0 mt-0.5 text-sm">🃏</span>
              <p className="text-sm text-gray-600 leading-relaxed">
                163枚のカードからランダムに配られるから、毎回ちがう体験になる
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="px-4 max-w-sm mx-auto mt-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl text-lg font-bold
            btn-liquid shadow-lg shadow-pink-500/25 transition-all"
        >
          あそぶ
        </button>
      </div>
    </div>
  )
}
