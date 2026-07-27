import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { Stack, Text, Group, Badge, Loader } from '@mantine/core'
import type { LpcCharacterConfig, LpcMissingLayerWarning } from '../types/lpc-character'

interface LpcCharacterProps {
  character: LpcCharacterConfig
  fps?: number
  showDetails?: boolean
  showWarnings?: boolean
  onMissingLayers?: (warnings: LpcMissingLayerWarning[]) => void
}

function Character3D() {
  return (
    <mesh>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#8888ff" />
    </mesh>
  )
}

export function LpcCharacter({
  character,
  fps = 8,
  showDetails = false,
  showWarnings = false,
  onMissingLayers,
}: LpcCharacterProps) {
  const [warnings, setWarnings] = useState<LpcMissingLayerWarning[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading character
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Check for missing layers
      const newWarnings: LpcMissingLayerWarning[] = []
      onMissingLayers?.(newWarnings)
      setWarnings(newWarnings)
    }, 500)

    return () => clearTimeout(timer)
  }, [character, onMissingLayers])

  if (isLoading) {
    return (
      <Stack align="center" gap="md">
        <Loader />
        <Text size="sm" c="dimmed">
          Loading character...
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md" align="center">
      <div style={{ width: '300px', height: '300px', border: '1px solid #444', borderRadius: '8px', background: '#1a1a1a' }}>
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Character3D />
          <OrbitControls />
        </Canvas>
      </div>

      {showDetails && (
        <Stack gap="xs" align="center" style={{ fontSize: '12px' }}>
          <Group gap="xs">
            <Badge size="sm" variant="dot">
              {character.body.type}
            </Badge>
            <Badge size="sm" variant="dot">
              {character.head.style}
            </Badge>
          </Group>
          <Group gap="xs">
            <Badge size="sm" variant="dot">
              {character.face.style}
            </Badge>
            <Badge size="sm" variant="dot">
              {character.hair.color}
            </Badge>
          </Group>
        </Stack>
      )}

      {showWarnings && warnings.length > 0 && (
        <Stack gap="xs" style={{ fontSize: '12px', color: '#ff8800' }}>
          {warnings.map((warning, index) => (
            <Text key={index} size="xs">
              ⚠️ {warning.layer}: {warning.reason}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export type { LpcMissingLayerWarning }