import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei'

function AnimatedOrb() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.3
      meshRef.current.rotation.x = clock.elapsedTime * 0.15
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <Sphere ref={meshRef} args={[1.8, 80, 80]}>
        <MeshDistortMaterial
          color="#6c63ff"
          attach="material"
          distort={0.38}
          speed={2.5}
          roughness={0.1}
          metalness={0.2}
          emissive="#6c63ff"
          emissiveIntensity={0.2}
        />
      </Sphere>
      {/* Inner glow sphere */}
      <Sphere args={[1.4, 32, 32]}>
        <meshStandardMaterial
          color="#ff6584"
          transparent
          opacity={0.15}
          roughness={0}
          metalness={0.5}
          emissive="#ff6584"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  )
}

export default function OrbScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.9} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={1} color="#6c63ff" />
      <pointLight position={[2, -4, 2]} intensity={0.8} color="#ff6584" />
      <AnimatedOrb />
    </Canvas>
  )
}
