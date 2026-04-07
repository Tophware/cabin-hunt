import { LPC_SHEET_DEFINITION_GROUPS, type LpcSheetDefinitionGroup } from './lpc-assets'

const LPC_SHEET_DEFINITION_BODY_TYPES = [
    'male',
    'muscular',
    'female',
    'pregnant',
    'teen',
    'child',
] as const

const LPC_SHEET_BUCKETS = ['body', 'clothing', 'accessory', 'equipment'] as const

const GROUP_TO_BUCKET: Record<LpcSheetDefinitionGroup, LpcSheetBucket> = {
    arms: 'clothing',
    body: 'body',
    feet: 'clothing',
    hair: 'body',
    head: 'body',
    headwear: 'accessory',
    legs: 'clothing',
    tools: 'equipment',
    torso: 'clothing',
    weapons: 'equipment',
}

type LayerKey = `layer_${number}`

type RawImportedSheetDefinition = RawSheetDefinition | RawSheetMetaDefinition

interface RawSheetCredit {
    file: string
    notes?: string
    authors?: string[]
    licenses?: string[]
    urls?: string[]
}

interface RawSheetLayer {
    zPos: number
    custom_animation?: string
    male?: string
    muscular?: string
    female?: string
    pregnant?: string
    teen?: string
    child?: string
}

interface RawSheetRecolors {
    material?: string
    palettes?: string[]
}

interface RawSheetDefinition {
    name: string
    path?: string[]
    type_name?: string
    tags?: string[]
    priority?: number
    match_body_color?: boolean
    variants?: string[]
    animations?: string[]
    credits?: RawSheetCredit[]
    recolors?: RawSheetRecolors
    preview_row?: number
    preview_column?: number
    preview_x_offset?: number
    preview_y_offset?: number
    [key: LayerKey]: RawSheetLayer | undefined
}

interface RawSheetMetaDefinition {
    priority: number
}

export type LpcSheetBodyType = (typeof LPC_SHEET_DEFINITION_BODY_TYPES)[number]
export type LpcSheetBucket = (typeof LPC_SHEET_BUCKETS)[number]

export interface LpcSheetCatalogLayer {
    key: LayerKey
    index: number
    zPos: number
    customAnimation?: string
    bodyTypePaths: Partial<Record<LpcSheetBodyType, string>>
    availableBodyTypes: LpcSheetBodyType[]
}

export interface LpcSheetCatalogPreview {
    row?: number
    column?: number
    xOffset?: number
    yOffset?: number
}

export interface LpcSheetCatalogRecolors {
    material?: string
    palettes: string[]
}

export interface LpcSheetCatalogCredit {
    file: string
    notes: string
    authors: string[]
    licenses: string[]
    urls: string[]
}

export interface LpcSheetCatalogEntry {
    id: string
    filePath: string
    group: LpcSheetDefinitionGroup
    bucket: LpcSheetBucket
    name: string
    typeName: string
    catalogPath: string[]
    directoryPath: string[]
    tags: string[]
    priority?: number
    matchBodyColor: boolean
    variants: string[]
    animations: string[]
    layerCount: number
    layers: LpcSheetCatalogLayer[]
    availableBodyTypes: LpcSheetBodyType[]
    preview: LpcSheetCatalogPreview | null
    recolors: LpcSheetCatalogRecolors | null
    credits: LpcSheetCatalogCredit[]
}

export interface LpcSheetCatalogStats {
    definitions: number
    variants: number
    animations: number
    byGroup: Record<LpcSheetDefinitionGroup, number>
    byBucket: Record<LpcSheetBucket, number>
}

const rawSheetDefinitionModules = import.meta.glob<RawImportedSheetDefinition>(
    '../../external/lpc-generator/sheet_definitions/**/*.json',
    { eager: true, import: 'default' },
)

function getRelativeSheetDefinitionPath(modulePath: string) {
    const normalizedPath = modulePath.replaceAll('\\', '/')
    const marker = '/sheet_definitions/'
    const markerIndex = normalizedPath.indexOf(marker)

    if (markerIndex === -1) {
        throw new Error(`Unable to normalize LPC sheet definition path: ${modulePath}`)
    }

    return normalizedPath.slice(markerIndex + marker.length)
}

function isSheetDefinitionGroup(value: string): value is LpcSheetDefinitionGroup {
    return LPC_SHEET_DEFINITION_GROUPS.includes(value as LpcSheetDefinitionGroup)
}

function isRawSheetLayer(value: unknown): value is RawSheetLayer {
    return value !== null && typeof value === 'object' && 'zPos' in value
}

function isSelectableSheetDefinition(
    relativeFilePath: string,
    definition: RawImportedSheetDefinition,
): definition is RawSheetDefinition {
    const fileName = relativeFilePath.split('/').at(-1) ?? ''

    if (fileName.startsWith('meta_')) {
        return false
    }

    return Object.values(definition).some(isRawSheetLayer)
}

function createEmptyGroupRecord<T>(factory: () => T): Record<LpcSheetDefinitionGroup, T> {
    return Object.fromEntries(LPC_SHEET_DEFINITION_GROUPS.map((group) => [group, factory()])) as Record<
        LpcSheetDefinitionGroup,
        T
    >
}

function createEmptyBucketRecord<T>(factory: () => T): Record<LpcSheetBucket, T> {
    return Object.fromEntries(LPC_SHEET_BUCKETS.map((bucket) => [bucket, factory()])) as Record<LpcSheetBucket, T>
}

function uniqueBodyTypes(layers: LpcSheetCatalogLayer[]) {
    const bodyTypes = new Set<LpcSheetBodyType>()

    for (const layer of layers) {
        for (const bodyType of layer.availableBodyTypes) {
            bodyTypes.add(bodyType)
        }
    }

    return LPC_SHEET_DEFINITION_BODY_TYPES.filter((bodyType) => bodyTypes.has(bodyType))
}

function normalizeSheetLayer([key, layer]: [string, RawSheetLayer]) {
    const layerKey = key as LayerKey
    const bodyTypePaths: Partial<Record<LpcSheetBodyType, string>> = {}

    for (const bodyType of LPC_SHEET_DEFINITION_BODY_TYPES) {
        const pathValue = layer[bodyType]
        if (pathValue) {
            bodyTypePaths[bodyType] = pathValue
        }
    }

    const layerIndex = Number.parseInt(layerKey.slice('layer_'.length), 10)

    return {
        key: layerKey,
        index: layerIndex,
        zPos: layer.zPos,
        customAnimation: layer.custom_animation,
        bodyTypePaths,
        availableBodyTypes: LPC_SHEET_DEFINITION_BODY_TYPES.filter((bodyType) => Boolean(bodyTypePaths[bodyType])),
    } satisfies LpcSheetCatalogLayer
}

function normalizeCredits(credits: RawSheetCredit[] | undefined) {
    return (credits ?? []).map((credit) => ({
        file: credit.file,
        notes: credit.notes ?? '',
        authors: [...(credit.authors ?? [])],
        licenses: [...(credit.licenses ?? [])],
        urls: [...(credit.urls ?? [])],
    }))
}

function normalizePreview(definition: RawSheetDefinition) {
    const hasPreview =
        definition.preview_row !== undefined ||
        definition.preview_column !== undefined ||
        definition.preview_x_offset !== undefined ||
        definition.preview_y_offset !== undefined

    if (!hasPreview) {
        return null
    }

    return {
        row: definition.preview_row,
        column: definition.preview_column,
        xOffset: definition.preview_x_offset,
        yOffset: definition.preview_y_offset,
    } satisfies LpcSheetCatalogPreview
}

function normalizeRecolors(recolors: RawSheetRecolors | undefined) {
    if (!recolors) {
        return null
    }

    return {
        material: recolors.material,
        palettes: [...(recolors.palettes ?? [])],
    } satisfies LpcSheetCatalogRecolors
}

function normalizeSheetDefinition(relativeFilePath: string, definition: RawSheetDefinition): LpcSheetCatalogEntry {
    const pathSegments = relativeFilePath.replace(/\.json$/i, '').split('/')
    const [groupSegment, ...rest] = pathSegments

    if (!groupSegment || !isSheetDefinitionGroup(groupSegment)) {
        throw new Error(`Unexpected LPC sheet definition group for ${relativeFilePath}`)
    }

    const layers = Object.entries(definition)
        .filter((entry): entry is [string, RawSheetLayer] => /^layer_\d+$/.test(entry[0]) && isRawSheetLayer(entry[1]))
        .sort((left, right) => left[0].localeCompare(right[0], undefined, { numeric: true }))
        .map(normalizeSheetLayer)

    return {
        id: relativeFilePath.replace(/\.json$/i, ''),
        filePath: relativeFilePath,
        group: groupSegment,
        bucket: GROUP_TO_BUCKET[groupSegment],
        name: definition.name,
        typeName: definition.type_name ?? rest.at(-1) ?? groupSegment,
        catalogPath: [...(definition.path ?? pathSegments)],
        directoryPath: rest.slice(0, -1),
        tags: [...(definition.tags ?? [])],
        priority: definition.priority,
        matchBodyColor: definition.match_body_color ?? false,
        variants: [...(definition.variants ?? [])],
        animations: [...(definition.animations ?? [])],
        layerCount: layers.length,
        layers,
        availableBodyTypes: uniqueBodyTypes(layers),
        preview: normalizePreview(definition),
        recolors: normalizeRecolors(definition.recolors),
        credits: normalizeCredits(definition.credits),
    }
}

export const LPC_SHEET_CATALOG = Object.entries(rawSheetDefinitionModules)
    .map(([modulePath, definition]) => [getRelativeSheetDefinitionPath(modulePath), definition] as const)
    .flatMap(([relativeFilePath, definition]) => {
        if (!isSelectableSheetDefinition(relativeFilePath, definition)) {
            return []
        }

        return [normalizeSheetDefinition(relativeFilePath, definition)]
    })
    .sort((left, right) => left.filePath.localeCompare(right.filePath, undefined, { numeric: true }))

export const LPC_SHEET_CATALOG_BY_ID = Object.fromEntries(
    LPC_SHEET_CATALOG.map((definition) => [definition.id, definition]),
) as Record<string, LpcSheetCatalogEntry>

export const LPC_SHEET_CATALOG_BY_GROUP = (() => {
    const entries = createEmptyGroupRecord<LpcSheetCatalogEntry[]>(() => [])

    for (const definition of LPC_SHEET_CATALOG) {
        entries[definition.group].push(definition)
    }

    return entries
})()

export const LPC_SHEET_CATALOG_BY_BUCKET = (() => {
    const entries = createEmptyBucketRecord<LpcSheetCatalogEntry[]>(() => [])

    for (const definition of LPC_SHEET_CATALOG) {
        entries[definition.bucket].push(definition)
    }

    return entries
})()

export const LPC_BODY_SHEET_CATALOG = LPC_SHEET_CATALOG_BY_BUCKET.body
export const LPC_CLOTHING_SHEET_CATALOG = LPC_SHEET_CATALOG_BY_BUCKET.clothing
export const LPC_ACCESSORY_SHEET_CATALOG = LPC_SHEET_CATALOG_BY_BUCKET.accessory
export const LPC_EQUIPMENT_SHEET_CATALOG = LPC_SHEET_CATALOG_BY_BUCKET.equipment

export const LPC_SHEET_CATALOG_STATS = (() => {
    const byGroup = createEmptyGroupRecord<number>(() => 0)
    const byBucket = createEmptyBucketRecord<number>(() => 0)

    for (const definition of LPC_SHEET_CATALOG) {
        byGroup[definition.group] += 1
        byBucket[definition.bucket] += 1
    }

    return {
        definitions: LPC_SHEET_CATALOG.length,
        variants: LPC_SHEET_CATALOG.reduce((sum, definition) => sum + definition.variants.length, 0),
        animations: LPC_SHEET_CATALOG.reduce((sum, definition) => sum + definition.animations.length, 0),
        byGroup,
        byBucket,
    } satisfies LpcSheetCatalogStats
})()

export function getLpcSheetCatalogEntry(id: string) {
    return LPC_SHEET_CATALOG_BY_ID[id]
}

export function getLpcSheetCatalogByGroup(group: LpcSheetDefinitionGroup) {
    return LPC_SHEET_CATALOG_BY_GROUP[group]
}

export function getLpcSheetCatalogByBucket(bucket: LpcSheetBucket) {
    return LPC_SHEET_CATALOG_BY_BUCKET[bucket]
}