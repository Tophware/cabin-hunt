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

import { LpcCharacter, type LpcMissingLayerWarning } from './components/LpcCharacter'
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
  animation: 'run',
  orientation: 'down',
  body: { type: 'female' },
  head: { style: 'human_female' },
  face: { style: 'neutral' },
  hair: { color: 'ginger', style: 'bangs_bun' },
  clothes: [
    { sheet: 'feet/boots/feet_boots_basic', variant: 'brown' },
    { sheet: 'torso/dresses/dress_bodice', variant: 'teal' },
    { sheet: 'arms/arms_gloves', variant: 'black' },
  ],
})

function App() {

  const handleMissingLayers = (warnings: LpcMissingLayerWarning[]) => {
    if (warnings.length > 0) {
      console.warn('Missing LPC layers:', warnings)
    }
  }


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
            This preview uses the normalized LPC sheet catalog. Clothing now
            references sheet-definition ids plus variants, and the renderer
            resolves layered sprites using the source metadata.
          </Text>

          <Card withBorder radius="md" shadow="sm" p="xl">
            <Stack gap="md" align="center">
              <LpcCharacter
                fps={16}
                showDetails
                showWarnings
                hideOnMissingLayers
                onMissingLayers={handleMissingLayers}
                character={demoCharacter}
              />

              <Stack gap={4} align="center">
                <Title order={4}>LpcCharacter Definition</Title>
                <Text size="sm" c="dimmed" ta="center">
                  Pass catalog-backed clothing selections like
                  <Text span inherit ff="monospace"> {`{ sheet: 'arms/arms_gloves', variant: 'black' }`}</Text>
                  . The component looks up the sheet definition, expands its
                  layers, and draws them in z-order.
                </Text>
              </Stack>

              <Group gap="xs" justify="center">
                <Badge variant="default">animation: walk</Badge>
                <Badge variant="default">orientation: down</Badge>
                <Badge variant="default">body: female</Badge>
                <Badge variant="default">catalog clothes: 3</Badge>
              </Group>

              <Text size="sm" c="dimmed">
                The renderer still supports the older raw sprite-path clothing
                items, but this demo now uses the catalog format end to end.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </MantineProvider>
  )
}

export default App
