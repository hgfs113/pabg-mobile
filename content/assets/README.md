# assets/

Placeholder for campaign art assets.

Future contents:
- Region artwork (splash screens, map backgrounds)
- Waypoint icons (one per `waypoint.icon` value used in region files)
- Boss illustrations
- Loot/item artwork
- Achievement badges

## Icon Keys Used in v0

The following `icon` values are referenced in region YAML files.
Each must resolve to a sprite in the engine's icon registry.

### Linear Algebra (The Crystalline Vaults)
- `crystal_small`
- `crystal_medium`
- `crystal_sharp`
- `crystal_sphere`
- `crystal_crown`

### Optimization (The Gradient Wastes)
- `wasteland_marker`
- `wasteland_tower`
- `wasteland_obelisk`
- `wasteland_descent`
- `wasteland_peak`

### Machine Learning (The Emergent Forests)
- `forest_glow`
- `forest_tree`
- `forest_crystal`
- `forest_canopy`
- `forest_deep`
- `forest_peak`

### Computer Vision (The Seeing Peaks)
- `peak_base`
- `peak_climb`
- `peak_ridge`
- `peak_summit`
- `peak_eye`

## Naming Convention

Files should be named `{icon_key}.png` or `{icon_key}.svg`.
Recommended resolution: 64×64 px for waypoint icons, 512×512 px for region art.
