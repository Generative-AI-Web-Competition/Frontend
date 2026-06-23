import { useRef, useState } from 'react'
import { faculty } from '../data/faculty'
import { C } from '../constants/colors'
import PortraitPointCloud from './PortraitPointCloud'

const EASE = 'cubic-bezier(.22,.85,.25,1)'
const DUR = 460

export default function FacultyCarousel() {
  const [idx, setIdx] = useState(0)
  const stageRef = useRef(null)

  const animate = (dir) => {
    const el = stageRef.current
    if (!el) return
    const fromDeg = dir > 0 ? 78 : -78
    el.animate(
      [
        {
          transform: `rotateY(${fromDeg}deg) translateZ(-260px) translateX(${dir > 0 ? 40 : -40}px)`,
          opacity: 0,
          filter: 'blur(4px) brightness(0.6)',
        },
        {
          transform: `rotateY(${fromDeg * 0.35}deg) translateZ(-90px) translateX(${dir > 0 ? 12 : -12}px)`,
          opacity: 0.7,
          filter: 'blur(1px) brightness(0.85)',
          offset: 0.6,
        },
        { transform: 'rotateY(0deg) translateZ(0) translateX(0)', opacity: 1, filter: 'blur(0) brightness(1)' },
      ],
      { duration: DUR + 120, easing: EASE, fill: 'both' },
    )
  }

  const go = (next) => {
    const dir = next > idx ? 1 : -1
    setIdx(next)
    setTimeout(() => animate(dir), 0)
  }

  const prev = () => go((idx - 1 + faculty.length) % faculty.length)
  const next = () => go((idx + 1) % faculty.length)

  const prof = faculty[idx]

  return (
    <div className="relative w-full" style={{ minHeight: 560, perspective: 1200 }}>
      {/* 워드마크 */}
      <div
        className="absolute top-0 right-4 font-mono font-bold select-none"
        style={{
          fontSize: 'clamp(28px,5vw,64px)',
          letterSpacing: '.22em',
          color: 'rgba(255,255,255,0.06)',
        }}
      >
        FACULTY
      </div>

      {/* 좌상단 라벨 */}
      <div className="absolute top-2 left-2 font-mono text-xs" style={{ color: C.greenDim }}>
        [[ 교수진 {faculty.length}명 · 전용 연구실 7개 ]]
      </div>

      {/* 인디케이터 */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {faculty.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`교수 ${i + 1}`}
            style={{
              width: i === idx ? 36 : 18,
              height: 3,
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
              background: i === idx ? C.green : C.greenBorder,
              transition: 'width .3s, background .3s',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* 스테이지 */}
      <div ref={stageRef} className="pt-12" style={{ transformStyle: 'preserve-3d' }}>
        {/* 인물 사진 + 화살표 */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={prev}
            aria-label="이전 교수"
            className="absolute left-0 z-10 flex items-center justify-center rounded-full font-mono text-2xl"
            style={{
              width: 48, height: 48,
              border: `1px solid ${C.greenBorder}`,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              color: C.green,
              cursor: 'pointer',
            }}
          >
            ‹
          </button>

          <div
            className="select-none"
            style={{ height: 'min(46vh, 420px)', width: 'min(46vh, 420px)', maxWidth: '64vw' }}
          >
            <PortraitPointCloud src={prof.img} />
          </div>

          <button
            onClick={next}
            aria-label="다음 교수"
            className="absolute right-0 z-10 flex items-center justify-center rounded-full font-mono text-2xl"
            style={{
              width: 48, height: 48,
              border: `1px solid ${C.greenBorder}`,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              color: C.green,
              cursor: 'pointer',
            }}
          >
            ›
          </button>
        </div>

        {/* 정보 카드 */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {/* 이름 카드 */}
          <div
            className="rounded-xl px-6 py-5 text-left"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${C.greenBorder}`,
            }}
          >
            <div
              className="font-mono font-bold text-white"
              style={{ fontSize: 'clamp(22px,3vw,32px)' }}
            >
              :: {prof.name}
            </div>
            <p className="font-mono text-xs mt-1" style={{ color: C.green, letterSpacing: '.24em' }}>
              {prof.degree} · PROFESSOR
            </p>
            <div
              className="my-2.5"
              style={{ height: 1, width: 180, background: `linear-gradient(${C.green}, transparent)` }}
            />
            <p className="font-mono text-[11px]" style={{ color: C.greenDim }}>
              {String(idx + 1).padStart(2, '0')} / {String(faculty.length).padStart(2, '0')}
            </p>
          </div>

          {/* 상세 카드 */}
          <div
            className="rounded-xl px-6 py-5 text-left"
            style={{
              width: 'min(300px, 90vw)',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${C.greenBorder}`,
            }}
          >
            <p
              className="font-mono text-[11px] mb-2.5"
              style={{ color: C.green, letterSpacing: '.22em' }}
            >
              전공분야 // RESEARCH
            </p>
            <div className="flex flex-col gap-1">
              {prof.fields.map((f) => (
                <div key={f} className="font-sans font-bold text-sm text-white">{f}</div>
              ))}
            </div>
            <p className="font-mono text-xs mt-3 opacity-60 text-[#b8c4bd]">
              {prof.room} · {prof.tel}
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: C.green }}>
              {prof.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
