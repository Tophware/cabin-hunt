import '@mantine/core/styles.css'

import {
  Badge,
  Card,
  Container,
  Group,
  MantineProvider,
  Stack,
  Text,
  Title,
  createTheme,
} from '@mantine/core'

import { LpcCharacter } from './components/LpcCharacter'
import { defineLpcCharacter } from './types/lpc-character'

const theme = createTheme({
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
})

const demoCharacter = defineLpcCharacter({
  animation: '1h_slash',
  orientation: 'down',
  body: { type: 'muscular' },
  head: { style: 'human_female' },
  face: { style: 'neutral' },
  hair: { color: 'ginger', style: 'bangs_bun' },
  clothes: [
    { spritePath: 'torso/aprons/overalls', color: 'green' },
    { spritePath: 'legs/pants', color: 'black' },
    { spritePath: 'feet/boots/basic', color: 'brown' },
    { spritePath: 'arms/gloves', color: 'black' }
  ],
})

function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2}>LPC Character Preview</Title>
            <Badge color="teal" variant="light">
              Typed Character
            </Badge>
          </Group>

          <Text c="dimmed">
            This preview uses a typed character definition with optional body,
            head, face, hair, animation, and orientation fields. Omitted fields
            fall back to defaults.
          </Text>

          <Card withBorder radius="md" shadow="sm" p="xl">
            <Stack gap="md" align="center">
              <LpcCharacter character={demoCharacter} />

              <Stack gap={4} align="center">
                <Title order={4}>LpcCharacter Definition</Title>
                <Text size="sm" c="dimmed" ta="center">
                  Pass any, all, or none of the supported character properties.
                  The component resolves defaults and renders the matching LPC
                  sprite layers.
                </Text>
              </Stack>

              <Group gap="xs" justify="center">
                <Badge variant="default">animation: 1h_slash</Badge>
                <Badge variant="default">orientation: down</Badge>
                <Badge variant="default">body: muscular</Badge>
                <Badge variant="default">hair: random</Badge>
              </Group>

              <Text size="sm" c="dimmed">
                The renderer is now centered around a reusable LpcCharacter
                component instead of a hardcoded walking demo.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </MantineProvider>
  )
}

export default App
