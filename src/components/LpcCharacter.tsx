import { Box, Loader, Stack, Text } from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLpcAnimation } from '../hooks/useLpcWalkAnimation'
import {
    LPC_HAIR_COLORS,
    LPC_HAIR_STYLES,
    resolveLpcAnimationSpriteName,
    resolveLpcOrientation,
    type LpcAnimationName,
    type LpcBodyType,
    type LpcCharacterDefinition,
    type LpcClothingItem,
    type LpcCosmeticItem,
    type LpcHeadStyle,
    type LpcOrientation,
} from '../types/lpc-character'

const FRAME_SIZE = 64
const SPRITES_BASE = '/external/lpc-generator/spritesheets'

const DIRECTION_TO_ROW: Record<LpcOrientation, number> = {
    up: 0,
    left: 1,
    down: 2,
    right: 3,
}

const BODY_TO_DEFAULT_HEAD_STYLE: Record<LpcBodyType, LpcHeadStyle> = {
    male: 'human_male',
    female: 'human_female',
    muscular: 'human_male',
    pregnant: 'human_female',
    teen: 'human_male',
    child: 'human_male',
}

const BODY_SPRITE_FALLBACKS: Record<LpcBodyType, readonly LpcBodyType[]> = {
    male: ['male'],
    female: ['female', 'male'],
    muscular: ['muscular', 'male'],
    pregnant: ['pregnant', 'female', 'male'],
    teen: ['teen', 'male'],
    child: ['child', 'male'],
}

const HEAD_STYLE_TO_FOLDER: Record<LpcHeadStyle, 'male' | 'female'> = {
    human_male: 'male',
    human_female: 'female',
}

interface ResolvedCharacter {
    animation: LpcAnimationName
    orientation: LpcOrientation
    bodyType: LpcBodyType
    headStyle: LpcHeadStyle
    showBody: boolean
    showHead: boolean
    showFace: boolean
    showHair: boolean
}

interface ResolvedCosmetic {
    label: string
    candidates: string[]
}

interface LpcCharacterProps {
    character?: LpcCharacterDefinition
    scale?: number
    fps?: number
    showDetails?: boolean
}

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error(`Failed to load sprite: ${src}`))
        image.src = src
    })
}

async function loadFirstAvailable(candidates: readonly string[]) {
    for (const candidate of candidates) {
        try {
            return await loadImage(candidate)
        } catch {
            // Try next candidate path.
        }
    }

    return null
}

function getRandomItem<const T>(items: readonly T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}

function formatLabel(value: string) {
    return value.replaceAll('_', ' ')
}

function normalizePath(pathValue: string) {
    return pathValue.replace(/^\/+|\/+$/g, '').replace(/\.png$/i, '')
}

function resolveCharacter(character?: LpcCharacterDefinition): ResolvedCharacter {
    const animation = character?.animation ?? 'walk'
    const bodyType = character?.body?.type ?? 'male'
    const headStyle = character?.head?.style ?? BODY_TO_DEFAULT_HEAD_STYLE[bodyType]

    return {
        animation,
        orientation: resolveLpcOrientation(animation, character?.orientation ?? 'down'),
        bodyType,
        headStyle,
        showBody: character?.body?.visible ?? true,
        showHead: character?.head?.visible ?? true,
        showFace: character?.face?.visible ?? true,
        showHair: character?.hair === null ? false : (character?.hair?.visible ?? true),
    }
}

function buildBodyCandidates(resolved: ResolvedCharacter) {
    const spriteName = resolveLpcAnimationSpriteName(resolved.animation)
    return BODY_SPRITE_FALLBACKS[resolved.bodyType].map(
        (bodyType) => `${SPRITES_BASE}/body/bodies/${bodyType}/${spriteName}.png`,
    )
}

function buildHeadCandidates(resolved: ResolvedCharacter) {
    const spriteName = resolveLpcAnimationSpriteName(resolved.animation)
    const folder = HEAD_STYLE_TO_FOLDER[resolved.headStyle]
    return [`${SPRITES_BASE}/head/heads/human/${folder}/${spriteName}.png`]
}

function buildFaceCandidates(resolved: ResolvedCharacter) {
    const spriteName = resolveLpcAnimationSpriteName(resolved.animation)
    const folder = HEAD_STYLE_TO_FOLDER[resolved.headStyle]
    return [`${SPRITES_BASE}/head/faces/${folder}/neutral/${spriteName}.png`]
}

// Body-type resolution order for clothing (most specific to most generic).
const CLOTHING_BODY_FALLBACKS: Record<LpcBodyType, readonly LpcBodyType[]> = {
    male: ['male'],
    female: ['female', 'male'],
    muscular: ['muscular', 'male'],
    pregnant: ['pregnant', 'female', 'male'],
    teen: ['teen', 'male', 'female'],
    child: ['child', 'male'],
}

function buildClothingCandidates(
    item: LpcClothingItem,
    animation: LpcAnimationName,
    bodyType: LpcBodyType,
    headStyle: LpcHeadStyle,
) {
    const spriteName = resolveLpcAnimationSpriteName(animation)
    const sexFolder = headStyle === 'human_female' ? 'female' : 'male'

    const resolvedPath = normalizePath(item.spritePath)
        .replaceAll('{bodyType}', bodyType)
        .replaceAll('{sex}', sexFolder)

    // Build a de-duplicated folder list: bodyType fallback chain + sex-fallback + thin.
    const folders = [...new Set([
        ...CLOTHING_BODY_FALLBACKS[bodyType],
        sexFolder,
        'male',
        'female',
        'thin',
    ])] as string[]

    const candidates: string[] = []

    for (const folder of folders) {
        if (item.color) {
            candidates.push(`${SPRITES_BASE}/${resolvedPath}/${folder}/${spriteName}/${item.color}.png`)
        }
        candidates.push(`${SPRITES_BASE}/${resolvedPath}/${folder}/${spriteName}.png`)
    }

    // Fallback: no body-type folder (e.g. capes, quivers, accessories).
    if (item.color) {
        candidates.push(`${SPRITES_BASE}/${resolvedPath}/${spriteName}/${item.color}.png`)
    }
    candidates.push(`${SPRITES_BASE}/${resolvedPath}/${spriteName}.png`)

    return candidates
}

function buildCosmeticCandidates(
    item: LpcCosmeticItem,
    animation: LpcAnimationName,
    bodyType: LpcBodyType,
    headStyle: LpcHeadStyle,
) {
    const spriteName = resolveLpcAnimationSpriteName(animation)
    const ageFolder = bodyType === 'child' ? 'child' : 'adult'
    const sexFolder = headStyle === 'human_female' ? 'female' : 'male'

    const normalized = normalizePath(item.spritePath)
    const prefixed =
        normalized.startsWith('hair/') || normalized.startsWith('beards/')
            ? normalized
            : `hair/${normalized}`

    const resolvedPath = prefixed
        .replaceAll('{bodyType}', bodyType)
        .replaceAll('{body}', bodyType)
        .replaceAll('{age}', ageFolder)
        .replaceAll('{sex}', sexFolder)

    return [
        `${SPRITES_BASE}/${resolvedPath}/${spriteName}/${item.color}.png`,
        `${SPRITES_BASE}/${resolvedPath}/${spriteName}.png`,
        `${SPRITES_BASE}/${resolvedPath}/${item.color}.png`,
        `${SPRITES_BASE}/${resolvedPath}.png`,
    ]
}

function resolveCosmetics(
    character: LpcCharacterDefinition | undefined,
    resolved: ResolvedCharacter,
): ResolvedCosmetic[] {
    if (!resolved.showHair) {
        return []
    }

    const items = character?.hair?.items?.filter((item) => item.visible ?? true) ?? []
    if (items.length > 0) {
        return items.map((item) => ({
            label: normalizePath(item.spritePath),
            candidates: buildCosmeticCandidates(
                item,
                resolved.animation,
                resolved.bodyType,
                resolved.headStyle,
            ),
        }))
    }

    const requestedStyle = character?.hair?.style
    const requestedColor = character?.hair?.color
    const requestedRandom = character?.hair?.random ?? (!requestedStyle && !requestedColor)
    const ageFolder = resolved.bodyType === 'child' ? 'child' : 'adult'

    if (!requestedRandom && requestedStyle) {
        return [
            {
                label: formatLabel(requestedStyle),
                candidates: buildCosmeticCandidates(
                    { spritePath: `hair/${requestedStyle}/${ageFolder}`, color: requestedColor },
                    resolved.animation,
                    resolved.bodyType,
                    resolved.headStyle,
                ),
            },
        ]
    }

    const style = requestedStyle ?? getRandomItem(LPC_HAIR_STYLES)
    const color = requestedColor ?? getRandomItem(LPC_HAIR_COLORS)
    return [
        {
            label: `${formatLabel(style)} ${formatLabel(color)}`,
            candidates: buildCosmeticCandidates(
                { spritePath: `hair/${style}/${ageFolder}`, color },
                resolved.animation,
                resolved.bodyType,
                resolved.headStyle,
            ),
        },
    ]
}

export function LpcCharacter({ character, scale = 3, fps = 8, showDetails = true }: LpcCharacterProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [images, setImages] = useState<HTMLImageElement[] | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)

    const resolvedCharacter = useMemo(() => resolveCharacter(character), [character])
    const cosmetics = useMemo(
        () => resolveCosmetics(character, resolvedCharacter),
        [character, resolvedCharacter],
    )

    const { frame } = useLpcAnimation({
        animation: resolvedCharacter.animation,
        fps,
        isPlaying: true,
    })

    useEffect(() => {
        let isDisposed = false

        async function loadLayers() {
            const loaded: HTMLImageElement[] = []

            if (resolvedCharacter.showBody) {
                const bodyImage = await loadFirstAvailable(buildBodyCandidates(resolvedCharacter))
                if (bodyImage) {
                    loaded.push(bodyImage)
                }
            }

            if (resolvedCharacter.showHead) {
                const headImage = await loadFirstAvailable(buildHeadCandidates(resolvedCharacter))
                if (headImage) {
                    loaded.push(headImage)
                }
            }

            if (resolvedCharacter.showFace) {
                const faceImage = await loadFirstAvailable(buildFaceCandidates(resolvedCharacter))
                if (faceImage) {
                    loaded.push(faceImage)
                }
            }

            const clothingItems = character?.clothes?.filter((c) => c.visible ?? true) ?? []
            for (const clothingItem of clothingItems) {
                const clothingImage = await loadFirstAvailable(
                    buildClothingCandidates(
                        clothingItem,
                        resolvedCharacter.animation,
                        resolvedCharacter.bodyType,
                        resolvedCharacter.headStyle,
                    ),
                )
                if (clothingImage) {
                    loaded.push(clothingImage)
                }
            }

            for (const cosmetic of cosmetics) {
                const cosmeticImage = await loadFirstAvailable(cosmetic.candidates)
                if (cosmeticImage) {
                    loaded.push(cosmeticImage)
                }
            }

            if (!isDisposed) {
                setImages(loaded)
                setLoadError(null)
            }
        }

        setImages(null)
        loadLayers().catch((error: Error) => {
            if (!isDisposed) {
                setLoadError(error.message)
            }
        })

        return () => {
            isDisposed = true
        }
    }, [resolvedCharacter, cosmetics])

    useEffect(() => {
        if (!images || !canvasRef.current) {
            return
        }

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (!context) {
            return
        }

        const row = DIRECTION_TO_ROW[resolvedCharacter.orientation]
        const sourceX = frame * FRAME_SIZE
        const sourceY = row * FRAME_SIZE
        const targetSize = FRAME_SIZE * scale

        canvas.width = targetSize
        canvas.height = targetSize

        context.imageSmoothingEnabled = false
        context.clearRect(0, 0, canvas.width, canvas.height)

        for (const image of images) {
            context.drawImage(
                image,
                sourceX,
                sourceY,
                FRAME_SIZE,
                FRAME_SIZE,
                0,
                0,
                targetSize,
                targetSize,
            )
        }
    }, [frame, images, resolvedCharacter.orientation, scale])

    if (loadError) {
        return (
            <Stack align="center" gap="xs">
                <Text c="red.4" size="sm">
                    {loadError}
                </Text>
            </Stack>
        )
    }

    if (!images) {
        return (
            <Stack align="center" gap="xs" py="md">
                <Loader size="sm" />
                <Text c="dimmed" size="sm">
                    Loading LPC character...
                </Text>
            </Stack>
        )
    }

    return (
        <Stack align="center" gap="xs">
            <Box
                style={{
                    display: 'inline-flex',
                    padding: 12,
                    borderRadius: 16,
                    background:
                        'radial-gradient(circle at center, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02))',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
                }}
            >
                <canvas
                    ref={canvasRef}
                    aria-label="LPC character"
                    style={{
                        width: FRAME_SIZE * scale,
                        height: FRAME_SIZE * scale,
                        imageRendering: 'pixelated',
                    }}
                />
            </Box>

            {showDetails ? (
                <Text c="dimmed" size="sm" ta="center">
                    {formatLabel(resolvedCharacter.animation)} / {resolvedCharacter.orientation}
                    {cosmetics.length > 0
                        ? ` / layers: ${cosmetics
                            .map((item) => item.label)
                            .slice(0, 3)
                            .join(', ')}${cosmetics.length > 3 ? '...' : ''}`
                        : ''}
                </Text>
            ) : null}
        </Stack>
    )
}
