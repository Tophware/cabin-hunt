import { LpcCharacter } from './LpcCharacter'

import { type LpcWalkDirection } from '../hooks/useLpcWalkAnimation'

interface LpcWalkingCharacterProps {
    direction?: LpcWalkDirection
    scale?: number
    fps?: number
}

export function LpcWalkingCharacter({
    direction = 'down',
    scale = 3,
    fps = 8,
}: LpcWalkingCharacterProps) {
    return (
        <LpcCharacter
            character={{
                animation: 'walk',
                body: { type: 'male' },
                orientation: direction,
                hair: { random: true },
            }}
            scale={scale}
        />
    )
}
