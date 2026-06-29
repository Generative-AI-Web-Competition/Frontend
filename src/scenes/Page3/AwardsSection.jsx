import { useState } from 'react'
import { motion } from 'framer-motion'
import { awards } from '../../data/awards'
import { C } from '../../constants/colors'
import AwardsGlowField from '../../components/AwardsGlowField'

/* AI-contest-ver.chungs의 "수상 실적" 엔드크레딧을 demo 톤(그린/블랙)으로 다시
   그렸다. 처음엔 똑같은 모양의 카드를 한 줄로 쌓기만 해서 단조로웠다 — 가장
   최근 수상을 스포트라이트 카드로 키우고, 나머지는 2열 그리드로 바꾸고,
   제목 키워드로 아이콘·등급 배지를 매겨 카드마다 다르게 보이도록 했다. */

const TIER_RULES = [
  { match: '대상', label: '대상', color: '#FFD54A' },
  { match: '금상', label: '금상', color: '#FFD54A' },
  { match: '최우수', label: '최우수상', color: '#7CFFC4' },
  { match: '우수상', label: '우수상', color: '#00C853' },
]
function getTier(title) {
  return TIER_RULES.find((r) => title.includes(r.match)) ?? null
}

const ICON_RULES = [
  { match: '해커톤', icon: '🏆' },
  { match: '경진대회', icon: '💻' },
  { match: '발표회', icon: '🎤' },
  { match: '연수', icon: '✈️' },
  { match: '데모데이', icon: '🚀' },
  { match: '공모전', icon: '💡' },
]
function getIcon(title) {
  return ICON_RULES.find((r) => title.includes(r.match))?.icon ?? '⭐'
}

function TierPill({ tier }) {
  if (!tier) return null
  return (
    <span
      className="font-mono shrink-0"
      style={{
        fontSize: 10,
        letterSpacing: '.08em',
        color: tier.color,
        border: `1px solid ${tier.color}`,
        borderRadius: 999,
        padding: '2px 8px',
        background: 'rgba(255,255,255,.04)',
      }}
    >
      {tier.label}
    </span>
  )
}

function handleGlare(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
  e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
}

function Glare() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        borderRadius: 'inherit',
        background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(124,255,196,.16) 0%, transparent 55%)',
      }}
    />
  )
}

function FeaturedAward({ award, index }) {
  const [flipped, setFlipped] = useState(false)
  const tier = getTier(award.title)
  const icon = getIcon(award.title)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6 }}
      onClick={() => setFlipped((f) => !f)}
      onMouseMove={handleGlare}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFlipped((f) => !f) }}
      aria-label={`${award.title} 자세히 보기`}
      className="relative cursor-pointer select-none mb-6 group"
      style={{ minHeight: 220, perspective: 1200 }}
    >
      <div
        className="relative w-full h-full"
        style={{
          minHeight: 220,
          transformStyle: 'preserve-3d',
          transition: 'transform .7s cubic-bezier(.22,.85,.25,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl px-8 py-8 flex flex-col items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            border: `1px solid ${C.green}`,
            background: `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,200,83,.14) 0%, rgba(2,8,5,.7) 70%)`,
            boxShadow: `0 0 40px rgba(0,200,83,.12)`,
          }}
        >
          <p className="font-mono text-[10px] tracking-[.3em] mb-3" style={{ color: C.greenDim }}>
            TOP AWARD · {award.date}
          </p>
          <div className="text-5xl mb-3">{icon}</div>
          <div className="text-white font-bold" style={{ fontSize: 'clamp(1.1rem,2.4vw,1.6rem)', lineHeight: 1.4 }}>
            {award.title}
          </div>
          <div className="font-mono text-[12px] mt-2 opacity-55">{award.org}</div>
          <div className="flex items-center gap-3 mt-4">
            <TierPill tier={tier} />
            <span className="font-mono text-[10px] opacity-35" style={{ color: C.green }}>⟲ 클릭해서 3D로 보기</span>
          </div>
          <Glare />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl px-8 py-8 flex flex-col items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            border: `1px solid ${C.green}`,
            background: 'rgba(0,200,83,.09)',
            boxShadow: `inset 0 0 40px ${C.greenGlow}`,
          }}
        >
          <div className="text-6xl mb-4">{icon}</div>
          <div className="text-white font-bold" style={{ fontSize: 'clamp(1.3rem,2.8vw,2rem)', lineHeight: 1.4 }}>
            {award.title}
          </div>
          <div className="font-mono text-[13px] mt-3" style={{ color: C.green }}>{award.org}</div>
          <div className="font-mono text-[11px] mt-4" style={{ color: C.greenDim, letterSpacing: '.15em' }}>
            {award.date} 수상 · #{String(index + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AwardCard({ award, index }) {
  const [flipped, setFlipped] = useState(false)
  const tier = getTier(award.title)
  const icon = getIcon(award.title)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setFlipped((f) => !f)}
      onMouseMove={handleGlare}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFlipped((f) => !f) }}
      aria-label={`${award.title} 자세히 보기`}
      className="relative cursor-pointer select-none group"
      style={{ minHeight: 200, perspective: 1000 }}
    >
      <div
        className="relative w-full h-full"
        style={{
          minHeight: 200,
          transformStyle: 'preserve-3d',
          transition: 'transform .6s cubic-bezier(.22,.85,.25,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 flex flex-col rounded-md px-5 py-4"
          style={{
            backfaceVisibility: 'hidden',
            border: `1px solid ${C.greenBorder}`,
            borderLeft: `2px solid ${C.green}`,
            background: 'rgba(2,8,5,.55)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="text-2xl">{icon}</div>
            <span className="font-mono text-[10px] opacity-30" style={{ color: C.green }}>⟲ 3D</span>
          </div>
          <div className="flex-1 flex flex-col justify-center mt-2">
            <div className="text-white font-bold text-[15px]" style={{ lineHeight: 1.5 }}>
              {award.title}
            </div>
            <div className="font-mono text-[11px] mt-1 opacity-55" style={{ letterSpacing: '.04em' }}>
              {award.org}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[11px]" style={{ color: C.greenDim, letterSpacing: '.1em' }}>
              {award.date}
            </span>
            <TierPill tier={tier} />
          </div>
          <Glare />
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-md px-6 py-5"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            border: `1px solid ${C.green}`,
            background: 'rgba(0,200,83,.07)',
            boxShadow: `inset 0 0 30px ${C.greenGlow}`,
          }}
        >
          <div className="text-3xl mb-2">{icon}</div>
          <div
            className="font-mono text-[10px] mb-2"
            style={{ color: C.greenDim, letterSpacing: '.2em' }}
          >
            AWARD · {award.date}
          </div>
          <div className="text-white font-bold" style={{ fontSize: 17, lineHeight: 1.4 }}>
            {award.title}
          </div>
          <div className="font-mono text-[12px] mt-2" style={{ color: C.green, letterSpacing: '.04em' }}>
            {award.org}
          </div>
          {tier && <div className="mt-3"><TierPill tier={tier} /></div>}
        </div>
      </div>
    </motion.div>
  )
}

export default function AwardsSection() {
  const [featured, ...rest] = awards

  return (
    <section className="relative bg-black py-28 px-6 overflow-hidden">
      <AwardsGlowField />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,60,30,0.3) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs tracking-[0.4em] uppercase mb-3" style={{ color: C.green }}>
            Recent Awards
          </p>
          <h2 className="font-mono font-bold text-white" style={{ fontSize: 'clamp(1.6rem,3.6vw,2.6rem)', letterSpacing: '-0.03em' }}>
            수상 실적
          </h2>
          <div
            className="mx-auto mt-5"
            style={{ width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${C.green}, transparent)` }}
          />
        </motion.div>

        <FeaturedAward award={featured} index={0} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((a, i) => (
            <AwardCard key={i} award={a} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
