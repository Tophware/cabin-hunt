# LPC Generator Integration Notes

## Submodule
- Added git submodule at external/lpc-generator.
- Upstream repository: Universal-LPC-Spritesheet-Character-Generator.

## Purpose
- Use LPC character generation in this app.
- Bring generated characters into the Phaser game as playable or NPC sprites.

## Important Folders
- external/lpc-generator/spritesheets
  - PNG sprite sheets used for character animation and equipment layers.
- external/lpc-generator/sheet_definitions
  - JSON files that define sprite sheet layout, animation frames, and relationships between layers/categories.

## Integration Intent
- Generate character sprites with lpc-generator.
- Use sheet definitions metadata to map frames and animation keys consistently in Phaser.
- Keep character assembly logic aligned with definitions so equipment/body layers stay synchronized.
