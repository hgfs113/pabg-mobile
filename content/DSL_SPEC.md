# Campaign DSL Specification

Version: 1  
Status: Canonical

---

## Overview

The Campaign DSL is a set of YAML files that completely describe a campaign — its educational content, world geography, progression graph, and rewards. The engine reads these files at startup and operates against the resulting data model. The engine knows nothing about specific subjects. It knows only the abstractions defined here.

Adding a new campaign requires writing YAML. No engine code changes.

---

## Guiding Principles

**One file per region.** Diffs are small. Authoring is focused. You never edit the whole campaign to change one topic.

**IDs are stable.** Once an ID is written and a player has progress against it, it must never change. IDs use `snake_case` with a region prefix: `la_vector_spaces`, `opt_duality`.

**No duplication.** A fact appears in exactly one place. Cross-references use IDs.

**List order is semantic.** Encounters within a topic are completed in list order (theory before practice before review). The engine enforces this.

**Everything optional is marked optional.** Missing keys are treated as empty/absent. No sentinel values.

**Versioned at every level.** Each file declares `dsl_version`. This allows safe schema migration: the engine checks versions before parsing and can transform old data.

---

## File Layout

```
content/
  campaign.yaml          # Root. Campaign metadata + world graph.
  DSL_SPEC.md            # This file.
  CAMPAIGN_DESIGN.md     # Authoring notes for this specific campaign.
  regions/
    linear-algebra.yaml
    optimization.yaml
    machine-learning.yaml
    computer-vision.yaml
  assets/
    README.md            # Placeholder for future art assets.
  map/
    README.md            # Placeholder for future map tiles.
```

**Why not one giant file?** A 2000-line YAML file is hard to diff, hard to review, and easy to break. One file per region means the authoring scope matches the cognitive scope.

**Why no `encounters/` directory?** Encounters are not independently reusable in v0. An encounter belongs to a topic. Splitting them into separate files would require cross-file references for no benefit. If encounters ever become reusable across topics, extract then.

**Why no `topics/` directory?** Same reason. A topic's identity is inseparable from its region. `regions/linear-algebra.yaml` contains all LA topics. This makes the region the unit of authoring, which matches how campaigns are designed.

---

## Schema Reference

### `campaign.yaml`

```yaml
dsl_version: "1"            # string, required
id: string                  # globally unique campaign ID, kebab-case
title: string               # display name
version: string             # semver, e.g. "0.1.0"
description: string         # multiline, displayed in campaign select screen

regions:                    # ordered list of region IDs
  - string

world:
  name: string              # atmospheric name of the world
  description: string       # flavor text
  nodes:                    # one per region
    - region: string        # region ID
      world_name: string    # atmospheric place name (same as in region file)
      x: int                # 0–100, normalized world map coordinate
      y: int                # 0–100, normalized world map coordinate
      color: string         # hex color for map rendering
  edges:                    # directed edges for world map visual connections
    - from: string          # region ID
      to: string            # region ID
```

**Why separate `edges` from prerequisites?** The world graph is a visual artifact — it describes how regions are drawn connected on the map. The prerequisite graph is encoded in `unlocks_after` in each region file. They may differ. The world map might show a direct path between two regions that are not educationally adjacent.

**Why normalized coordinates?** The engine can render the map at any resolution. Coordinates 0–100 give one decimal place of precision without floating point noise.

---

### Region file (`regions/*.yaml`)

```yaml
dsl_version: "1"            # string, required
id: string                  # short prefix, e.g. "la", "opt", "ml", "cv"
title: string               # educational name, e.g. "Linear Algebra"
world_name: string          # atmospheric name, e.g. "The Crystalline Vaults"
world_description: string   # flavor lore, shown on map hover
color: string               # hex color, used for UI accents in this region
unlocks_after:              # list of region IDs that must be completed first
  - string                  # empty list = starting region

boss:                       # optional — omit if no boss
  id: string
  hidden: bool              # if true, boss is not shown until unlock_condition is met
  title: string
  description: string
  unlock_condition: string  # "complete_all_topics" | future: custom expressions
  reward:
    xp: int
    item: string            # optional lore item name
    title: string           # optional achievement title
  encounter:
    type: review            # boss encounters are always review type
    title: string
    description: string
    tasks:
      - string

topics:
  - ...                     # see Topic schema below
```

**Why `unlocks_after` (region-level) vs `requires` (topic-level)?** They represent different things. `unlocks_after` gates access to an entire region. `requires` gates access to individual topics within any region. A player must complete region LA before entering region OPT. Within OPT, they must complete `opt_convex_sets` before `opt_duality`. The two mechanisms are independent.

**Why `hidden: true` for bosses?** Discovery is a design pillar. The boss is only revealed after completing all topics. If the boss were visible from the start, it would become a checklist item rather than a surprise encounter.

**Why `unlock_condition: string` instead of a structured type?** For v0, there is exactly one condition: `complete_all_topics`. A string is simpler to parse and easier to read. When conditions become more complex (e.g., `complete_topics: [la_spectral, la_inner_products]`), promote this field to a structured type at DSL v2.

---

### Topic schema

```yaml
id: string                  # globally unique, region-prefixed snake_case
title: string               # display name
description: string         # pedagogical purpose, shown to player
estimated_hours: int        # rough effort estimate in hours
requires:                   # topic IDs that must be completed before this one
  - string                  # can reference topics from any region
reward:
  xp: int                   # XP bonus awarded on topic completion (in addition to encounter XP)
  item: string              # optional lore item
  title: string             # optional achievement title
waypoint:
  x: int                    # 0–100, position within the world map
  y: int                    # 0–100
  icon: string              # icon key, resolved by engine to sprite
  label: string             # tooltip / hover label on map

encounters:
  - ...                     # see Encounter schema; must be in intended completion order
```

**Why `estimated_hours` as int?** Rough enough to be useful, precise enough to set expectations. Floating point adds false precision.

**Why `requires` at the topic level?** This makes the dependency graph explicit and queryable. The engine can topologically sort topics and validate that no cycles exist. The campaign author can express "you need inner products before spectral theorem" without relying on list order.

**Why `reward` on the topic in addition to encounter XP?** Encounter XP is earned incrementally during study. Topic reward XP is a bonus for completing the whole unit — a "conquest bonus." This creates a satisfying milestone moment distinct from the grind of individual encounters.

---

### Encounter schema

```yaml
id: string                  # unique within the topic (not globally)
type: theory | practice | review
title: string
description: string         # what happens in this encounter
xp: int                     # XP earned on completion
resources:                  # optional — present for theory, sometimes for practice
  - type: book | video | paper | url
    title: string
    ref: string             # human-readable citation (chapter, lecture number, URL)
    url: string             # optional direct link
tasks:                      # optional — present for practice and review
  - string                  # each task is a concrete, actionable prompt
```

**Why three types only (theory/practice/review)?** For v0, more types add complexity without adding value. Theory = consume knowledge. Practice = apply knowledge. Review = synthesize knowledge. This covers the full learning loop. Future types (e.g., `challenge`, `duel`, `boss`) can be added at DSL v2 without breaking existing data.

**Why `id` is locally unique, not globally unique?** Encounter IDs are only referenced within their topic (for logging, progress tracking). There is no need for global encounter IDs in v0. If encounters ever become reusable or cross-referenced, make IDs globally unique at DSL v2.

**Why are resources on encounters, not topics?** Because different encounters within a topic use different resources. Theory reads the textbook; practice reads the problem sets; review may read both. Putting resources at the encounter level keeps the reference precise.

**Why list order is completion order for encounters?** The canonical learning loop is: read (theory) → apply (practice) → reflect (review). Encoding this in list order is implicit but clear. The spec documents it. The alternative — adding `order: int` to each encounter — adds noise. If non-linear encounter dependencies ever arise, add a `requires` field to encounters at DSL v2.

---

## ID Conventions

| Entity    | Convention              | Example                    |
|-----------|-------------------------|----------------------------|
| Campaign  | `kebab-case`            | `ml-journey-v0`            |
| Region    | short `kebab-case`      | `la`, `opt`, `ml`, `cv`   |
| Topic     | `{region}_{slug}`       | `la_vector_spaces`         |
| Encounter | `{topic}_{type_abbrev}` | `la_vs_theory`             |
| Boss      | `{region}_boss`         | `la_boss`                  |

Encounter ID abbreviations: `theory` → `theory`, `practice` → `practice`, `review` → `review`. If a topic has multiple encounters of the same type, append `_1`, `_2`.

---

## Versioning

`dsl_version` is a string containing an integer. It is checked before parsing.

| Version | Notes                         |
|---------|-------------------------------|
| `"1"`   | Initial version (this spec)   |

When a breaking schema change is needed:
1. Increment `dsl_version`.
2. Write a migration function in the engine that transforms v1 → v2.
3. Old campaign files continue to work until migrated.

Non-breaking additions (new optional fields) do not require a version bump.

---

## Validation Rules (enforced by engine)

1. All region IDs listed in `campaign.yaml` must have a corresponding file in `regions/`.
2. All IDs referenced in `requires` and `unlocks_after` must exist.
3. No cycles in the topic dependency graph.
4. No cycles in the region `unlocks_after` graph.
5. Encounter list is non-empty for every topic.
6. Boss `unlock_condition: complete_all_topics` requires at least one topic in the region.
7. Waypoint coordinates must be in range [0, 100].

---

## Extension Points

The DSL is designed to be extended without breaking existing campaigns.

Future additions (non-breaking, can be added to v1 files):
- `topic.difficulty: easy | medium | hard` — player-visible effort signal
- `encounter.optional: true` — encounter can be skipped
- `region.recommended_level: int` — soft gate for display only
- `reward.unlock_region: string` — completing this topic unlocks a region (alternative to `unlocks_after`)
- `boss.encounter.type: boss` — dedicated boss encounter type

Future additions (breaking, require v2):
- Reusable encounters across topics (requires global encounter IDs)
- Conditional unlock expressions (requires structured `unlock_condition`)
- Non-linear encounter ordering within a topic (requires `encounter.requires`)
