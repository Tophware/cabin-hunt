import { Box, Loader, Stack, Text } from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLpcAnimation } from '../hooks/useLpcWalkAnimation'
import {
    getLpcSheetCatalogEntry,
    type LpcSheetCatalogEntry,
    type LpcSheetCatalogLayer,
} from '../types/lpc-sheet-catalog'
import {
    LPC_HAIR_COLORS,
    LPC_HAIR_STYLES,
    resolveLpcAnimationSpriteName,
    resolveLpcOrientation,
    type LpcAnimationName,
    type LpcBodyType,
    type LpcCatalogClothingItem,
    type LpcCharacterDefinition,
    type LpcClothingItem,
    type LpcCosmeticItem,
    type LpcHeadStyle,
    type LpcOrientation,
    type LpcSpritePathClothingItem,
} from '../types/lpc-character'

const FRAME_SIZE = 64
const SPRITES_BASE = '/external/lpc-generator/spritesheets'
const BODY_Z_POS = 10
const HEAD_Z_POS = 100
const FACE_Z_POS = 101
const HAIR_Z_POS = 120

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
    zPos: number
    candidates: string[]
}

interface ResolvedImageLayer {
    label: string
    zPos: number
    image: HTMLImageElement
}

interface ResolvedRenderableLayer {
    label: string
    zPos: number
    candidates: string[]
    availableAnimations?: string[]
}

export interface LpcMissingLayerWarning {
    label: string
    zPos: number
    animation: LpcAnimationName
    candidatesTried: number
    availableAnimations?: string[]
}

interface LpcCharacterProps {
    character?: LpcCharacterDefinition
    scale?: number
    fps?: number
    showDetails?: boolean
    showWarnings?: boolean
    hideOnMissingLayers?: boolean
    onMissingLayers?: (warnings: LpcMissingLayerWarning[]) => void
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

function createRenderableLayer(
    label: string,
    zPos: number,
    candidates: string[],
    availableAnimations?: string[],
): ResolvedRenderableLayer {
    return { label, zPos, candidates, availableAnimations }
}

function buildHeadCandidates(resolved: ResolvedCharacter) {
    const spriteName = resolveLpcAnimationSpriteName(resolved.animation)
    if (resolved.bodyType === 'child') {
        return [`${SPRITES_BASE}/head/heads/human/child/${spriteName}.png`]
    }

    const folder = HEAD_STYLE_TO_FOLDER[resolved.headStyle]
    return [`${SPRITES_BASE}/head/heads/human/${folder}/${spriteName}.png`]
}

function buildFaceCandidates(resolved: ResolvedCharacter) {
    if (resolved.bodyType === 'child') {
        return []
    }

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
    item: LpcSpritePathClothingItem,
    animation: LpcAnimationName,
    bodyType: LpcBodyType,
    headStyle: LpcHeadStyle,
) {
    const spriteName = resolveLpcAnimationSpriteName(animation)
    const sexFolder = headStyle === 'human_female' ? 'female' : 'male'
    const ageFolder = bodyType === 'child' ? 'child' : 'adult'
    const color = item.color

    const resolvedPath = normalizePath(item.spritePath)
        .replaceAll('{bodyType}', bodyType)
        .replaceAll('{sex}', sexFolder)
        .replaceAll('{age}', ageFolder)

    // Build ordered probe folders: body-type chain → sex → age → thin → '' (no folder).
    const uniqueFolders: string[] = []
    const seen = new Set<string>()
    for (const f of [...CLOTHING_BODY_FALLBACKS[bodyType], sexFolder, ageFolder, 'thin', '']) {
        if (!seen.has(f)) { seen.add(f); uniqueFolders.push(f) }
    }

    const candidates: string[] = []

    for (const folder of uniqueFolders) {
        const base = folder
            ? `${SPRITES_BASE}/${resolvedPath}/${folder}`
            : `${SPRITES_BASE}/${resolvedPath}`
        if (color) candidates.push(`${base}/${spriteName}/${color}.png`)
        candidates.push(`${base}/${spriteName}.png`)
    }

    // Kimono-style: color is a folder name, then universal/{sex}/{anim}.png
    if (color) candidates.push(`${SPRITES_BASE}/${resolvedPath}/${color}/universal/${sexFolder}/${spriteName}.png`)
    candidates.push(`${SPRITES_BASE}/${resolvedPath}/universal/${sexFolder}/${spriteName}.png`)

    return candidates
}

function isCatalogClothingItem(item: LpcClothingItem): item is LpcCatalogClothingItem {
    return 'sheet' in item
}

function resolveCatalogEntry(sheet: LpcCatalogClothingItem['sheet']) {
    return typeof sheet === 'string' ? getLpcSheetCatalogEntry(sheet) : sheet
}

function getSheetLayerAnimationCandidates(
    entry: LpcSheetCatalogEntry,
    animation: LpcAnimationName,
    layer: LpcSheetCatalogLayer,
): readonly string[] {
    const requested = resolveLpcAnimationSpriteName(animation)

    if (layer.customAnimation) {
        return layer.customAnimation === requested ? [layer.customAnimation] : []
    }

    if (entry.animations.length === 0) {
        return [requested]
    }

    return entry.animations.includes(requested) ? [requested] : []
}

function getCatalogLayerBasePaths(layer: LpcSheetCatalogLayer, bodyType: LpcBodyType) {
    const paths: string[] = []
    const seen = new Set<string>()

    for (const fallbackBodyType of CLOTHING_BODY_FALLBACKS[bodyType]) {
        const pathValue = layer.bodyTypePaths[fallbackBodyType]
        if (!pathValue) {
            continue
        }

        const normalizedPath = normalizePath(pathValue)
        if (!seen.has(normalizedPath)) {
            seen.add(normalizedPath)
            paths.push(normalizedPath)
        }
    }

    return paths
}

function buildCatalogLayerCandidates(
    entry: LpcSheetCatalogEntry,
    layer: LpcSheetCatalogLayer,
    variant: string | undefined,
    animation: LpcAnimationName,
    bodyType: LpcBodyType,
) {
    const candidates: string[] = []
    const basePaths = getCatalogLayerBasePaths(layer, bodyType)
    const animationCandidates = getSheetLayerAnimationCandidates(entry, animation, layer)

    for (const basePath of basePaths) {
        for (const animationName of animationCandidates) {
            if (variant) {
                candidates.push(`${SPRITES_BASE}/${basePath}/${animationName}/${variant}.png`)
            }
            candidates.push(`${SPRITES_BASE}/${basePath}/${animationName}.png`)
        }
    }

    return createRenderableLayer(
        `${entry.name}${variant ? ` ${formatLabel(variant)}` : ''}`,
        layer.zPos,
        candidates,
        entry.animations,
    )
}

function resolveClothingLayers(
    character: LpcCharacterDefinition | undefined,
    resolved: ResolvedCharacter,
): ResolvedRenderableLayer[] {
    const clothingItems = character?.clothes?.filter((item) => item.visible ?? true) ?? []
    const layers: ResolvedRenderableLayer[] = []

    for (const item of clothingItems) {
        if (isCatalogClothingItem(item)) {
            const entry = resolveCatalogEntry(item.sheet)
            if (!entry) {
                continue
            }

            for (const layer of entry.layers) {
                layers.push(
                    buildCatalogLayerCandidates(
                        entry,
                        layer,
                        item.variant,
                        resolved.animation,
                        resolved.bodyType,
                    ),
                )
            }

            continue
        }

        layers.push(
            createRenderableLayer(
                normalizePath(item.spritePath),
                HEAD_Z_POS,
                buildClothingCandidates(
                    item,
                    resolved.animation,
                    resolved.bodyType,
                    resolved.headStyle,
                ),
            ),
        )
    }

    return layers
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
            zPos: HAIR_Z_POS,
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
                zPos: HAIR_Z_POS,
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
            zPos: HAIR_Z_POS,
            candidates: buildCosmeticCandidates(
                { spritePath: `hair/${style}/${ageFolder}`, color },
                resolved.animation,
                resolved.bodyType,
                resolved.headStyle,
            ),
        },
    ]
}

export function LpcCharacter({
    character,
    scale = 3,
    fps = 8,
    showDetails = true,
    showWarnings = true,
    hideOnMissingLayers = false,
    onMissingLayers,
}: LpcCharacterProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [images, setImages] = useState<ResolvedImageLayer[] | null>(null)
    const [missingLayers, setMissingLayers] = useState<LpcMissingLayerWarning[]>([])
    const [loadError, setLoadError] = useState<string | null>(null)

    const resolvedCharacter = useMemo(() => resolveCharacter(character), [character])
    const cosmetics = useMemo(
        () => resolveCosmetics(character, resolvedCharacter),
        [character, resolvedCharacter],
    )
    const clothingLayers = useMemo(
        () => resolveClothingLayers(character, resolvedCharacter),
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
            const loaded: ResolvedImageLayer[] = []
            const missing: LpcMissingLayerWarning[] = []

            async function tryLoadLayer(
                label: string,
                zPos: number,
                candidates: string[],
                availableAnimations?: string[],
            ) {
                const image = await loadFirstAvailable(candidates)
                if (image) {
                    loaded.push({ image, label, zPos })
                    return
                }

                missing.push({
                    label,
                    zPos,
                    animation: resolvedCharacter.animation,
                    candidatesTried: candidates.length,
                    availableAnimations,
                })
            }

            if (resolvedCharacter.showBody) {
                await tryLoadLayer('body', BODY_Z_POS, buildBodyCandidates(resolvedCharacter))
            }

            if (resolvedCharacter.showHead) {
                await tryLoadLayer('head', HEAD_Z_POS, buildHeadCandidates(resolvedCharacter))
            }

            if (resolvedCharacter.showFace) {
                await tryLoadLayer('face', FACE_Z_POS, buildFaceCandidates(resolvedCharacter))
            }

            for (const clothingLayer of clothingLayers) {
                await tryLoadLayer(
                    clothingLayer.label,
                    clothingLayer.zPos,
                    clothingLayer.candidates,
                    clothingLayer.availableAnimations,
                )
            }

            for (const cosmetic of cosmetics) {
                await tryLoadLayer(cosmetic.label, cosmetic.zPos, cosmetic.candidates)
            }

            loaded.sort((left, right) => left.zPos - right.zPos)

            if (!isDisposed) {
                setImages(loaded)
                setMissingLayers(missing)
                setLoadError(null)
            }

            if (missing.length > 0) {
                console.warn('LpcCharacter: unresolved sprite layers', missing)
            }
        }

        setImages(null)
        setMissingLayers([])
        loadLayers().catch((error: Error) => {
            if (!isDisposed) {
                setLoadError(error.message)
            }
        })

        return () => {
            isDisposed = true
        }
    }, [resolvedCharacter, clothingLayers, cosmetics])

    useEffect(() => {
        if (!onMissingLayers) {
            return
        }

        onMissingLayers(missingLayers)
    }, [missingLayers, onMissingLayers])

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
                image.image,
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

    const shouldHideCharacter = hideOnMissingLayers && missingLayers.length > 0

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
                {shouldHideCharacter ? (
                    <Stack align="center" gap={2} py="md" px="sm" style={{ width: FRAME_SIZE * scale }}>
                        <Text c="yellow.3" size="xs" ta="center">
                            Character hidden due to missing layers.
                        </Text>
                    </Stack>
                ) : (
                    <canvas
                        ref={canvasRef}
                        aria-label="LPC character"
                        style={{
                            width: FRAME_SIZE * scale,
                            height: FRAME_SIZE * scale,
                            imageRendering: 'pixelated',
                        }}
                    />
                )}
            </Box>

            {showDetails ? (
                <Text c="dimmed" size="sm" ta="center">
                    {formatLabel(resolvedCharacter.animation)} / {resolvedCharacter.orientation}
                    {clothingLayers.length + cosmetics.length > 0
                        ? ` / layers: ${[...clothingLayers, ...cosmetics]
                            .map((item) => item.label)
                            .slice(0, 3)
                            .join(', ')}${clothingLayers.length + cosmetics.length > 3 ? '...' : ''}`
                        : ''}
                </Text>
            ) : null}

            {showWarnings && missingLayers.length > 0 ? (
                <Text c="yellow.3" size="xs" ta="center">
                    Missing {missingLayers.length} layer{missingLayers.length > 1 ? 's' : ''} for
                    {' '}
                    {formatLabel(resolvedCharacter.animation)}:
                    {' '}
                    {missingLayers
                        .map((layer) => layer.label)
                        .slice(0, 2)
                        .join(', ')}
                    {missingLayers.length > 2 ? '...' : ''}
                    {missingLayers[0]?.availableAnimations && missingLayers[0].availableAnimations!.length > 0
                        ? ` / available: ${missingLayers[0].availableAnimations!.slice(0, 4).join(', ')}${missingLayers[0].availableAnimations!.length > 4 ? '...' : ''}`
                        : ''}
                </Text>
            ) : null}
        </Stack>
    )
}
