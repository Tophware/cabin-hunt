import '@mantine/core/styles.css'

import {
  MantineProvider,
  createTheme,
} from '@mantine/core'

import { CharacterCreatorPage } from './pages/CharacterCreatorPage'

const theme = createTheme({
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
})

function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <CharacterCreatorPage />
    </MantineProvider>
  )
}

export default App
