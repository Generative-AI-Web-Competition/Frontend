import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { C } from '../../constants/colors'

gsap.registerPlugin(ScrollTrigger)

const WELCOME = 'WELCOME SKU SOFTWARE'
const ENTER_END = 0.28 // 0→0.28 스크롤 진행도 동안 노트북이 멀리서 날아온다 (느리게)
const OPEN_END  = 0.46 // 0.28→0.46 동안 펼쳐진다
const TYPE_END  = 0.66 // 0.46→0.66 동안 화면에 타이핑
const CLOSE_END = 1.0  // 0.66→1.0 동안 닫히고, 화면 속으로 빨려들어간다

const LAPTOP_SCALE = 1.7 // 최종 노트북 크기

const CODE_LINES = [
  { indent: 0, tokens: [{ t: '@SpringBootApplication', c: C.green }] },
  { indent: 0, tokens: [
    { t: 'public ', c: '#c792ea' }, { t: 'class ', c: '#c792ea' },
    { t: 'ExceptionApplication', c: '#82aaff' }, { t: ' {', c: 'rgba(255,255,255,.7)' },
  ]},
  { indent: 26, tokens: [
    { t: 'public ', c: '#c792ea' }, { t: 'static ', c: '#c792ea' },
    { t: 'void ', c: '#c792ea' }, { t: 'main', c: '#ffcb6b' },
    { t: '(', c: 'rgba(255,255,255,.7)' }, { t: 'String', c: '#82aaff' },
    { t: '[] args) {', c: 'rgba(255,255,255,.7)' },
  ]},
  { indent: 52, tokens: [
    { t: 'SpringApplication', c: '#82aaff' }, { t: '.', c: 'rgba(255,255,255,.7)' },
    { t: 'run', c: '#ffcb6b' }, { t: '(', c: 'rgba(255,255,255,.7)' },
    { t: 'ExceptionApplication', c: '#82aaff' }, { t: '.class, args);', c: 'rgba(255,255,255,.7)' },
  ]},
  { indent: 52, tokens: [
    { t: 'System', c: '#82aaff' }, { t: '.', c: 'rgba(255,255,255,.7)' },
    { t: 'out', c: '#82aaff' }, { t: '.', c: 'rgba(255,255,255,.7)' },
    { t: 'println', c: '#ffcb6b' }, { t: '(', c: 'rgba(255,255,255,.7)' },
    { t: '"__TYPING__"', c: '#f78c6c' }, { t: ');', c: 'rgba(255,255,255,.7)' },
  ]},
  { indent: 26, tokens: [{ t: '}', c: 'rgba(255,255,255,.7)' }] },
  { indent: 0,  tokens: [{ t: '}', c: 'rgba(255,255,255,.7)' }] },
]

const keyGeo = new THREE.BoxGeometry(0.13, 0.015, 0.1)
const KEYBOARD_ROWS = 4
const KEYBOARD_COLS = 10
const CLOSED_ANGLE = Math.PI / 2.1
const OPEN_ANGLE = -0.371 // 화면 법선이 카메라 시선과 정확히 마주보는 각도 (사다리꼴 왜곡 제거)

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/* ── 3D 노트북: 멀리서 날아와 펼쳐지면 화면에 코드 인트로가 보인다 ── */
function Laptop({ progressRef, typed, isComplete }) {
  const groupRef = useRef(null)
  const screenRef = useRef(null)
  const glowRef = useRef(null)
  const [screenVisible, setScreenVisible] = useState(false)

  const keyboardKeys = useMemo(() => {
    const keys = []
    const spacingX = 0.17
    const spacingZ = 0.15
    for (let row = 0; row < KEYBOARD_ROWS; row++) {
      for (let col = 0; col < KEYBOARD_COLS; col++) {
        keys.push({
          x: (col - (KEYBOARD_COLS - 1) / 2) * spacingX,
          z: -0.5 + row * spacingZ,
        })
      }
    }
    return keys
  }, [])

  useFrame(() => {
    const group = groupRef.current
    const screen = screenRef.current
    if (!group || !screen) return
    const p = progressRef.current

    // 진입: 멀리서(작게, 어둡게) 날아와 제자리에 안착. 자리를 잡은 뒤로는
    // 움직이지 않는다 — 마지막엔 카메라가 화면 속으로 빨려들어간다(랩탑이 아니라
    // 시점이 다가가야 "빨려드는" 느낌이 난다).
    const enterT = Math.max(0, Math.min(1, p / ENTER_END))
    const eEnter = easeOutCubic(enterT)

    const z = -9 + 9 * eEnter
    const y = -1.7 + (-0.35 - -1.7) * eEnter
    const scale = LAPTOP_SCALE * (0.4 + 0.6 * eEnter)
    group.position.set(0, y, z)
    group.scale.setScalar(scale)

    // 펼침/닫힘: 진입 후 열리고, 타이핑이 끝나면 (닫힘 구간의 앞쪽 45%에서) 다시 닫힌다
    const closeT = p > TYPE_END ? Math.max(0, Math.min(1, (p - TYPE_END) / (CLOSE_END - TYPE_END))) : 0
    let openT
    if (p < ENTER_END) {
      openT = 0
    } else if (p < OPEN_END) {
      openT = (p - ENTER_END) / (OPEN_END - ENTER_END)
    } else if (p < TYPE_END) {
      openT = 1
    } else {
      openT = 1 - Math.min(1, closeT / 0.45)
    }
    openT = Math.max(0, Math.min(1, openT))
    const openAngle = CLOSED_ANGLE + (OPEN_ANGLE - CLOSED_ANGLE) * easeOutCubic(openT)
    screen.rotation.x = openAngle

    const openness = Math.max(0, Math.min(1, (CLOSED_ANGLE - openAngle) / (CLOSED_ANGLE - OPEN_ANGLE)))
    if (glowRef.current) glowRef.current.intensity = openness * 0.7

    // 화면 카드는 billboard라 뚜껑 회전을 따라가지 않으므로, 닫히기 시작하면
    // 뚜껑이 눈에 띄게 기울기 전에 먼저 사라지게 한다(어색한 분리 방지).
    const closeFadeT = p > TYPE_END ? closeT / 0.2 : 0
    const visible = p < TYPE_END ? openness > 0.7 : closeFadeT < 1
    if (visible !== screenVisible) setScreenVisible(visible)
  })

  return (
    <group ref={groupRef} position={[0, -1.7, -9]} scale={LAPTOP_SCALE * 0.4}>
      {/* contact glow pool — 바닥에 은은한 초록 빛, 검정 배경과 분리 */}
      <mesh position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 32]} />
        <meshBasicMaterial color={C.green} transparent opacity={0.07} depthWrite={false} />
      </mesh>

      {/* keyboard deck */}
      <RoundedBox args={[2.2, 0.12, 1.5]} radius={0.06} position={[0, -0.06, 0]}>
        <meshStandardMaterial color="#3a4060" roughness={0.3} metalness={0.55} />
      </RoundedBox>
      {/* deck edge highlight — 윤곽이 배경과 분리되도록 */}
      <mesh position={[0, -0.005, 0.76]}>
        <boxGeometry args={[2.2, 0.01, 0.01]} />
        <meshBasicMaterial color={C.green} transparent opacity={0.5} />
      </mesh>

      {keyboardKeys.map((key, i) => (
        <mesh key={i} geometry={keyGeo} position={[key.x, 0.008, key.z]}>
          <meshStandardMaterial color="#454c78" roughness={0.4} metalness={0.15} />
        </mesh>
      ))}

      {/* trackpad */}
      <mesh position={[0, 0.007, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.42]} />
        <meshStandardMaterial color="#454c78" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* screen / lid assembly */}
      <group ref={screenRef} position={[0, 0, -0.72]}>
        {/* hinge */}
        <mesh position={[0, 0.02, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2.1, 16]} />
          <meshStandardMaterial color="#2a2f50" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* lid / bezel */}
        <RoundedBox args={[2.2, 1.4, 0.08]} radius={0.06} position={[0, 0.68, 0.04]}>
          <meshStandardMaterial color="#363c64" roughness={0.3} metalness={0.55} />
        </RoundedBox>
        {/* lid edge outline — 뒷면 실루엣을 또렷하게 */}
        <mesh position={[0, 0.68, 0.001]}>
          <planeGeometry args={[2.24, 1.44]} />
          <meshBasicMaterial color={C.green} transparent opacity={0.16} depthWrite={false} />
        </mesh>

        {/* webcam dot */}
        <mesh position={[0, 1.3, 0.082]}>
          <circleGeometry args={[0.018, 16]} />
          <meshStandardMaterial color="#3a3f6b" roughness={0.2} emissive="#3a3f6b" emissiveIntensity={0.3} />
        </mesh>

        {/* screen panel */}
        <mesh position={[0, 0.68, 0.085]}>
          <planeGeometry args={[2.0, 1.2]} />
          <meshStandardMaterial color="#081a10" emissive="#06270f" emissiveIntensity={0.4} roughness={0.55} />
        </mesh>

        {/* backlight glow */}
        <mesh position={[0, 0.68, 0.086]}>
          <planeGeometry args={[1.9, 1.1]} />
          <meshBasicMaterial color={C.green} transparent opacity={0.05} depthWrite={false} />
        </mesh>

        <pointLight ref={glowRef} position={[0, 0.68, 0.6]} color={C.green} intensity={0} distance={3} />

        {screenVisible && (
          <Html position={[0, 0.68, 0.09]} center wrapperClass="pointer-events-none select-none">
            <div
              className="w-[567px] overflow-hidden rounded-lg font-mono text-[15px] leading-snug"
              style={{ background: 'rgba(8,10,8,.97)', boxShadow: `inset 0 0 28px ${C.greenGlow}`, height: 326 }}
            >
              <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: `1px solid ${C.greenBorder}`, background: 'rgba(0,0,0,.3)' }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#febc2e' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
                <span className="ml-1 opacity-60 text-sm tracking-wide">ExceptionApplication.java</span>
              </div>
              <div className="p-4">
                {CODE_LINES.map((line, li) => (
                  <div key={li} style={{ paddingLeft: line.indent * 0.6 }}>
                    {line.tokens.map((tok, ti) => {
                      if (tok.t === '"__TYPING__"') {
                        return (
                          <span key={ti} style={{ color: '#f78c6c' }}>
                            &quot;{typed}
                            {!isComplete && <span style={{ color: C.green }}>▍</span>}
                            &quot;
                          </span>
                        )
                      }
                      return <span key={ti} style={{ color: tok.c }}>{tok.t}</span>
                    })}
                  </div>
                ))}
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: `1px solid ${C.greenBorder}`, opacity: isComplete ? 1 : 0 }}
                >
                  <div style={{ color: C.greenDim, fontSize: 12 }}>$ java -jar ExceptionApplication.jar</div>
                  <div style={{ color: C.green, fontSize: 16, textShadow: `0 0 10px ${C.greenGlow}` }}>{WELCOME}</div>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

/* ── 카메라 리그: 닫힘 구간 후반부에 화면 속으로 빨려들어가듯 빠르게 다가간다 ── */
function CameraRig({ progressRef }) {
  const { camera } = useThree()

  useFrame(() => {
    const p = progressRef.current
    const closeT = p > TYPE_END ? Math.max(0, Math.min(1, (p - TYPE_END) / (CLOSE_END - TYPE_END))) : 0
    // 닫힘이 끝난 뒤(0.45~1.0)에만 빨려들어가는 가속 돌리인
    const suckT = Math.max(0, Math.min(1, (closeT - 0.45) / 0.55))
    const eSuck = suckT * suckT * suckT // easeIn — 점점 가속

    // 노트북 본체(약 ±1.3 z범위) 안으로 카메라가 파고들지 않도록 2.4까지만 접근
    camera.position.z = 7.2 - 4.8 * eSuck
    camera.position.y = 2.7 - 2.45 * eSuck
    camera.fov = 34 + 95 * eSuck
    camera.updateProjectionMatrix()
    camera.lookAt(0, -0.1 + 0.1 * eSuck, 0)
  })

  return null
}

export default function CodeIntroScene() {
  const containerRef = useRef(null)
  const progressRef  = useRef(0)
  const animRef      = useRef(null)
  const [typedCount, setTypedCount] = useState(0)
  const [suckFlash, setSuckFlash] = useState(0)
  const isComplete = typedCount >= WELCOME.length
  const typed = WELCOME.slice(0, typedCount)

  // 스크롤 동안 인트로가 고정되도록 pin (TunnelScene과 동일 패턴)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
        scrub: false,
        onUpdate: (self) => { progressRef.current = self.progress },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  // 스크롤 진행도(노트북 펼침 이후) → 타이핑 글자 수 + 빨려들어가는 플래시 강도
  useEffect(() => {
    function loop() {
      const p = progressRef.current
      const typeT = Math.max(0, Math.min(1, (p - OPEN_END) / (TYPE_END - OPEN_END)))
      const count = Math.round(typeT * WELCOME.length)
      setTypedCount((prev) => (prev === count ? prev : count))

      const closeT = p > TYPE_END ? Math.max(0, Math.min(1, (p - TYPE_END) / (CLOSE_END - TYPE_END))) : 0
      const suckT = Math.max(0, Math.min(1, (closeT - 0.45) / 0.55))
      const flash = suckT * suckT
      setSuckFlash((prev) => (Math.abs(prev - flash) < 0.005 ? prev : flash))

      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <section ref={containerRef} className="relative h-[380vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 2.7, 7.2], fov: 34 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: 'transparent' }}
            onCreated={({ camera }) => camera.lookAt(0, -0.1, 0)}
          >
            <ambientLight intensity={0.85} color="#dffce8" />
            <directionalLight position={[4, 6, 5]} intensity={1.8} color="#fff8ed" />
            <directionalLight position={[-4, 2, 4]} intensity={0.9} color="#cfe9ff" />
            <directionalLight position={[-5, 1, -3]} intensity={1.1} color={C.green} />
            <pointLight position={[0, 1.5, 3]} intensity={0.8} color={C.green} distance={10} />
            <Laptop progressRef={progressRef} typed={typed} isComplete={isComplete} />
            <CameraRig progressRef={progressRef} />
          </Canvas>
        </div>

        {/* 빨려들어가는 구간의 초록 플래시 — 다음 씬(터널)의 색감으로 자연스럽게 이어준다 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 38%, ${C.green} 0%, rgba(0,200,83,0.5) 30%, transparent 70%)`,
            opacity: suckFlash,
            mixBlendMode: 'screen',
          }}
        />

        {!isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.2em]"
            style={{ color: C.greenDim }}
          >
            ▾ 스크롤하여 계속
          </motion.div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 text-green/30 font-mono text-xs">[ 00 ]</div>
        <div className="absolute top-8 right-8 text-green/30 font-mono text-xs">SKU_SW</div>
        <div className="absolute bottom-8 left-8 text-green/20 font-mono text-[10px]">
          {'>>'} BOOT_SEQUENCE
        </div>
        <div className="absolute bottom-8 right-8 text-green/20 font-mono text-[10px]">
          v2025.1
        </div>
      </div>
    </section>
  )
}
