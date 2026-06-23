import GlowCursor   from './components/GlowCursor'
import NavBar       from './components/chrome/NavBar'
import BinaryRain   from './components/BinaryRain'

import CodeIntroScene from './scenes/Page1/CodeIntroScene'
import CoreChipScene from './scenes/Page1/CoreChipScene'

import CircuitScene from './scenes/Page2/CircuitScene'

import SparkScene   from './scenes/Page3/SparkScene'
import CareerNetwork from './scenes/Page3/CareerNetwork'
import FutureScene  from './scenes/Page3/FutureScene'

export default function App() {
  return (
    <main className="overflow-x-clip">
      {/* ── 전역 상시 데이터 레인 (v3 #2) ──
          body 가 이미 #000 이므로 main 배경은 비우고, 레인을 -z-10 으로 깔아
          전 페이지 뒤에 항상 은은히 흐르게 한다. 각 캔버스 씬은 자기 비주얼을
          이 위에 그린다(Tunnel/Core 캔버스는 자체 트레일로 거의 덮음). */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <BinaryRain opacity={0.08} speed={0.5} density={0.985} />
      </div>

      <GlowCursor />
      <NavBar />

      {/* ── Page 1: 코드 인트로(노트북 화면 0/1 흡입) → (분해→Rain→Core→Chip→회로큐) ──
          (v6) 별도 TunnelScene 제거 — 노트북 화면 속 0/1 터널이 직접 전체 화면을
          덮으며 다음 씬으로 이어진다. */}
      <CodeIntroScene />
      <CoreChipScene />

      {/* ── Page 2: 살아있는 PCB — 코어에서 과목 노드로 확장 ── */}
      <CircuitScene />

      <div className="section-divider" />

      {/* ── Page 3: 스파크 → 커리어 → 미래 ── */}
      <SparkScene />
      <CareerNetwork />
      <FutureScene />
    </main>
  )
}
