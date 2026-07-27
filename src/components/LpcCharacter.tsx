import { useEffect, useState } from 'react'
import { Stack, Text, Group, Badge, Loader, Box } from '@mantine/core'
import type { LpcCharacterConfig, LpcMissingLayerWarning } from '../types/lpc-character'

interface LpcCharacterProps {
  character: LpcCharacterConfig
  scale?: number
  showDetails?: boolean
  showWarnings?: boolean
  onMissingLayers?: (warnings: LpcMissingLayerWarning[]) => void
}

export function LpcCharacter({
  character,
  scale = 3,
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
      <Box
        style={{
          width: `${300 * (scale / 3)}px`,
          height: `${300 * (scale / 3)}px`,
          border: '1px solid #444',
          borderRadius: '8px',
          background: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
        }}
      >
        🧑
      </Box>

      {showDetails && (
        <Stack gap="xs" align="center" style={{ fontSize: '12px' }}>
          <Group gap="xs">
            <Badge size="sm" variant="dot">
              {character.body.type}
            </Badge>
            {character.head && (
              <Badge size="sm" variant="dot">
                {character.head.style}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            {character.face && (
              <Badge size="sm" variant="dot">
                {character.face.style}
              </Badge>
            )}
            {character.hair?.color && (
              <Badge size="sm" variant="dot">
                {character.hair.color}
              </Badge>
            )}
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