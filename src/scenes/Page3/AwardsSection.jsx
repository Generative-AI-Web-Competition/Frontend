import { motion } from 'framer-motion'
import { awards } from '../../data/awards'
import { C } from '../../constants/colors'

/* AI-contest-ver.chungs의 "수상 실적" 엔드크레딧을 demo 톤(그린/블랙, font-mono
   라벨, 좌측 그린 바)으로 다시 그렸다. 원본은 전용 가상 스크롤 위에서 아래→위로
   흐르는 크레딧 연출이었지만, demo는 일반 문서 스크롤이라 그 자리에 맞춰
   whileInView로 한 줄씩 떠오르는 방식으로 단순화했다. */

export default function AwardsSection() {
  return (
    <section className="relative bg-black py-28 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,60,30,0.3) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
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

        <div className="flex flex-col gap-5">
          {awards.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-5 rounded-md px-5 py-4"
              style={{
                border: `1px solid ${C.greenBorder}`,
                borderLeft: `2px solid ${C.green}`,
                background: 'rgba(2,8,5,.55)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div
                className="font-mono text-[11px] shrink-0 pt-0.5"
                style={{ color: C.greenDim, letterSpacing: '.1em', minWidth: 60 }}
              >
                {a.date}
              </div>
              <div>
                <div className="text-white font-bold text-[15px]" style={{ lineHeight: 1.5 }}>
                  {a.title}
                </div>
                <div className="font-mono text-[11px] mt-1 opacity-55" style={{ letterSpacing: '.04em' }}>
                  {a.org}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
