# map/

Placeholder for world map assets.

Future contents:
- Background map image (the full world of "The Shattered Meridian")
- Tile sets for map terrain types
- Fog-of-war mask
- Region boundary overlays

## Coordinate System

The campaign uses a normalized coordinate system: x, y ∈ [0, 100].
- Origin (0, 0) is top-left.
- x increases to the right.
- y increases downward.

Map images should be rendered so that (0,0) corresponds to the top-left pixel
and (100,100) corresponds to the bottom-right pixel.

## Region Positions (from campaign.yaml)

| Region | World Name | x | y |
|--------|-----------|---|---|
| la | The Crystalline Vaults | 22 | 78 |
| opt | The Gradient Wastes | 45 | 55 |
| ml | The Emergent Forests | 65 | 32 |
| cv | The Seeing Peaks | 84 | 10 |

The map should read visually as a journey from bottom-left (foundations) to top-right (applications).
