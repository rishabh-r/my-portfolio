import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NODE_COUNT = 42
const CONNECT_DIST = 2.6
const COLORS = ['#6c63ff', '#ff6584', '#00c9a7', '#ffd60a', '#ff9f43', '#54a0ff', '#ff78ac', '#a29bfe']

function Node({ position, color, size, speed, phase }) {
  const meshRef = useRef()
  const baseY = position[1]

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = baseY + Math.sin(clock.elapsedTime * speed + phase) * 0.18
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        roughness={0.25}
        metalness={0.3}
      />
    </mesh>
  )
}

function Network() {
  const groupRef = useRef()

  const { nodes, lineGeo } = useMemo(() => {
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
      ],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 0.085 + 0.04,
      speed: Math.random() * 0.55 + 0.3,
      phase: Math.random() * Math.PI * 2,
    }))

    const verts = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].position
        const b = nodes[j].position
        const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2]
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (d < CONNECT_DIST && verts.length < 600) {
          verts.push(...a, ...b)
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return { nodes, lineGeo }
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.032
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.022) * 0.065
    }
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#b3aeff" transparent opacity={0.18} />
      </lineSegments>
      {nodes.map((n, i) => (
        <Node key={i} {...n} />
      ))}
    </group>
  )
}

export default function NeuralScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 55 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={1} />
      <pointLight position={[8, 8, 8]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-8, -8, 4]} intensity={0.7} color="#6c63ff" />
      <pointLight position={[4, -4, 6]} intensity={0.5} color="#ff6584" />
      <Network />
    </Canvas>
  )
}
