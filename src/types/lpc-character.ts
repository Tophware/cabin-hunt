export type LpcBodyType = 'male' | 'female'
export type LpcHeadStyle = 'human_male' | 'human_female' | 'elf_male' | 'elf_female'
export type LpcFaceStyle = 'neutral' | 'happy' | 'sad' | 'angry'
export type LpcHairStyle = 'bangs' | 'long' | 'short' | 'curly' | 'straight'
export type LpcHairColor = 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray'
export type LpcAnimationName = 'walk' | 'stand' | 'attack'
export type LpcOrientation = 'up' | 'down' | 'left' | 'right'

export const LPC_BODY_TYPES: LpcBodyType[] = ['male', 'female']
export const LPC_HEAD_STYLES: LpcHeadStyle[] = ['human_male', 'human_female', 'elf_male', 'elf_female']
export const LPC_FACE_STYLES: LpcFaceStyle[] = ['neutral', 'happy', 'sad', 'angry']
export const LPC_HAIR_STYLES: LpcHairStyle[] = ['bangs', 'long', 'short', 'curly', 'straight']
export const LPC_HAIR_COLORS: LpcHairColor[] = ['black', 'brown', 'blonde', 'red', 'white', 'gray']

export const LPC_ANIMATION_CONFIGS: Record<LpcAnimationName, { cycle: string[] }> = {
  walk: { cycle: ['frame_0', 'frame_1', 'frame_2', 'frame_3'] },
  stand: { cycle: ['frame_0'] },
  attack: { cycle: ['frame_0', 'frame_1', 'frame_2'] },
}

export interface LpcCharacterConfig {
  animation: LpcAnimationName
  orientation: LpcOrientation
  body: { type: LpcBodyType }
  head?: { style: LpcHeadStyle }
  face?: { style: LpcFaceStyle }
  hair?: { style?: LpcHairStyle; color?: LpcHairColor; random?: boolean }
}

export interface LpcMissingLayerWarning {
  layer: string
  reason: string
}