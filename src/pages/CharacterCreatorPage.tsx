import { Badge, Card, Container, Grid, NativeSelect, Stack, Text, Title } from '@mantine/core'
import { useMemo, useState } from 'react'

import { LpcCharacter, type LpcMissingLayerWarning } from '../components/LpcCharacter'
import {
    LPC_BODY_TYPES,
    LPC_FACE_STYLES,
    LPC_HAIR_COLORS,
    LPC_HAIR_STYLES,
    LPC_HEAD_STYLES,
    type LpcBodyType,
    type LpcFaceStyle,
    type LpcHairColor,
    type LpcHairStyle,
    type LpcHeadStyle,
} from '../types/lpc-character'

export function CharacterCreatorPage() {
    const [bodyType, setBodyType] = useState<LpcBodyType>('male')
    const [headStyle, setHeadStyle] = useState<LpcHeadStyle>('human_male')
    const [faceStyle, setFaceStyle] = useState<LpcFaceStyle>('neutral')
    const [hairStyle, setHairStyle] = useState<LpcHairStyle>('bangs')
    const [hairColor, setHairColor] = useState<LpcHairColor>('black')

    const character = useMemo(
        () => ({
            animation: 'walk' as const,
            orientation: 'down' as const,
            body: { type: bodyType },
            head: { style: headStyle },
            face: { style: faceStyle },
            hair: { style: hairStyle, color: hairColor, random: false },
        }),
        [bodyType, headStyle, faceStyle, hairStyle, hairColor],
    )

    const handleMissingLayers = (warnings: LpcMissingLayerWarning[]) => {
        if (warnings.length > 0) {
            console.warn('Missing LPC layers:', warnings)
        }
    }

    return (
        <Container size="md" py="xl">
            <Stack gap="md">
                <Stack gap={4}>
                    <Title order={2}>LPC Character Creator</Title>
                    <Text c="dimmed">Animation is fixed to walk and direction is fixed to down for this first pass.</Text>
                </Stack>

                <Card withBorder radius="md" shadow="sm" p="xl">
                    <Stack gap="lg">
                        <Grid>
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <NativeSelect
                                    label="Body"
                                    data={LPC_BODY_TYPES.map((value) => ({ value, label: value }))}
                                    value={bodyType}
                                    onChange={(event) => setBodyType(event.currentTarget.value as LpcBodyType)}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <NativeSelect
                                    label="Head"
                                    data={LPC_HEAD_STYLES.map((value) => ({ value, label: value }))}
                                    value={headStyle}
                                    onChange={(event) => setHeadStyle(event.currentTarget.value as LpcHeadStyle)}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <NativeSelect
                                    label="Face"
                                    data={LPC_FACE_STYLES.map((value) => ({ value, label: value }))}
                                    value={faceStyle}
                                    onChange={(event) => setFaceStyle(event.currentTarget.value as LpcFaceStyle)}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
                                <NativeSelect
                                    label="Hair Style"
                                    data={LPC_HAIR_STYLES.map((value) => ({ value, label: value }))}
                                    value={hairStyle}
                                    onChange={(event) => setHairStyle(event.currentTarget.value as LpcHairStyle)}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
                                <NativeSelect
                                    label="Hair Color"
                                    data={LPC_HAIR_COLORS.map((value) => ({ value, label: value }))}
                                    value={hairColor}
                                    onChange={(event) => setHairColor(event.currentTarget.value as LpcHairColor)}
                                />
                            </Grid.Col>
                        </Grid>

                        <Stack align="center" gap="xs">
                            <LpcCharacter
                                character={character}
                                showDetails
                                showWarnings
                                onMissingLayers={handleMissingLayers}
                            />

                            <Badge variant="default">walk / down</Badge>
                        </Stack>
                    </Stack>
                </Card>
            </Stack>
        </Container>
    )
}
