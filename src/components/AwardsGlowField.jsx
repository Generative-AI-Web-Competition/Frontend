import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* AwardsSection 배경용 가벼운 드리프팅 파티클 — 트로피 카드들이 떠 있는 듯한
   느낌을 주기 위한 것이라, ParticleField(터널 흡입용)와 달리 게이지 로직 없이
   그냥 천천히 표류·회전만 한다. */

function getCount() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return 0
  const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760
  return mobile ? 160 : 380
}

function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.3, 'rgba(120,255,180,0.55)')
  grd.addColorStop(1, 'rgba(120,255,180,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function Drift({ count }) {
  const ref = useRef()

  const { positions, glowTex } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4
    }
    return { positions: pos, glowTex: makeGlowTexture() }
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = Math.sin(t * 0.04) * 0.08
    ref.current.position.y = Math.sin(t * 0.15) * 0.4
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={1.6}
        map={glowTex}
        color="#7CFFC4"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export default function AwardsGlowField() {
  const count = useMemo(() => getCount(), [])
  if (count === 0) return null

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
      className="absolute inset-0 pointer-events-none"
    >
      <Drift count={count} />
    </Canvas>
  )
}
