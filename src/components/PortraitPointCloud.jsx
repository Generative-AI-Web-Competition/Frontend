import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { C } from '../constants/colors'

const GRID = 64
const DARK_CUTOFF = 0.08 // 이보다 어두운 픽셀(배경)은 점을 찍지 않는다

function sampleImage(src, gridSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = gridSize
      canvas.height = gridSize
      const ctx = canvas.getContext('2d')
      const scale = Math.max(gridSize / img.width, gridSize / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (gridSize - w) / 2, (gridSize - h) / 2, w, h)

      const { data } = ctx.getImageData(0, 0, gridSize, gridSize)
      const positions = []
      const colors = []
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const i = (y * gridSize + x) * 4
          const bright = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255
          if (bright < DARK_CUTOFF) continue
          const px = (x / gridSize - 0.5) * 2.3
          const py = -(y / gridSize - 0.5) * 2.3
          const pz = bright * 0.55 - 0.2
          positions.push(px, py, pz)
          colors.push(0.05 + bright * 0.1, 0.3 + bright * 0.7, 0.15 + bright * 0.35)
        }
      }
      resolve({
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
      })
    }
    img.onerror = reject
    img.src = src
  })
}

function FacePoints({ src }) {
  const [cloud, setCloud] = useState(null)
  const pointsRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setCloud(null)
    sampleImage(src, GRID).then((result) => {
      if (!cancelled) setCloud(result)
    })
    return () => { cancelled = true }
  }, [src])

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.18
  })

  if (!cloud) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.032} vertexColors transparent opacity={0.92} sizeAttenuation depthWrite={false} />
    </points>
  )
}

export default function PortraitPointCloud({ src }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 36 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.9} color="#dffce8" />
      <pointLight position={[1, 1, 2]} intensity={0.6} color={C.green} />
      <FacePoints src={src} />
    </Canvas>
  )
}
