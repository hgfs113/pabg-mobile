#!/usr/bin/env python3
"""Generate region YAML from plan_2.md (per-lecture links)."""
from __future__ import annotations

import re
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / "plan_2.md"
REGIONS = ROOT / "content" / "regions"

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def yaml_quote(s: str) -> str:
    return s.replace('"', '\\"')


def block(text: str, indent: int = 0) -> str:
    pad = " " * indent
    return textwrap.indent(textwrap.dedent(text).strip("\n"), pad)


def resource_type(url: str) -> str:
    if "youtube.com" in url or "youtu.be" in url:
        return "video"
    if url.endswith(".pdf") or "axler.net" in url:
        return "book"
    return "url"


def strip_links(text: str) -> str:
    return LINK_RE.sub(r"\1", text).strip()


def parse_playlist_url(header_line: str) -> str | None:
    m = LINK_RE.search(header_line)
    return m.group(2) if m else None


def parse_table_rows(section: str) -> list[dict]:
    rows: list[dict] = []
    for line in section.splitlines():
        if not line.startswith("|"):
            continue
        if set(line.replace("|", "").replace("-", "").strip()) <= {" "}:
            continue
        cols = [c.strip() for c in line.split("|")[1:-1]]
        if len(cols) < 2 or not cols[0].isdigit():
            continue

        lectures_col = cols[1]
        practice_col = cols[2] if len(cols) > 2 else "—"
        links = [(label.strip(), url.strip()) for label, url in LINK_RE.findall(lectures_col)]
        practice = practice_col.strip()
        if practice in ("—", "-", ""):
            practice = None

        summary = strip_links(lectures_col)
        if "—" in summary:
            summary = summary.split("—", 1)[1].strip()

        rows.append(
            {
                "iteration": int(cols[0]),
                "links": links,
                "summary": summary,
                "practice": practice,
                "material": strip_links(lectures_col),
            }
        )
    return rows


def split_course_sections(block_text: str) -> list[tuple[str, str, str | None]]:
    """Return (course_name, table_text, playlist_url) chunks inside a block."""
    chunks: list[tuple[str, str, str | None]] = []
    parts = re.split(r"\n(\*\*[^*]+\*\*[^\n]*)\n", block_text)
    # parts[0] is preamble; then alternating header, body
    i = 1
    while i < len(parts):
        header = parts[i]
        body = parts[i + 1] if i + 1 < len(parts) else ""
        name = re.sub(r"^\*\*|\*\*.*$", "", header).split("—")[0].strip()
        playlist = parse_playlist_url(header)
        # table ends at next ### or ** section
        table = re.split(r"\n(?:\*\*|###)", body)[0]
        chunks.append((name, table, playlist))
        i += 2
    return chunks


def load_plan() -> dict[str, list[dict]]:
    text = PLAN.read_text(encoding="utf-8")
    blocks = dict(re.findall(r"### (Блок \d+\.[^\n]+)\n(.*?)(?=\n### |\n---|\Z)", text, re.S))

    opt_chunks = split_course_sections(blocks["Блок 1. Оптимизация"])
    la_table = blocks["Блок 2. Линейная алгебра"]
    ml_chunks = split_course_sections(blocks["Блок 3. Общая база по ML"])
    cv_section = blocks["Блок 4. CV"]
    cv_name, cv_table, cv_playlist = split_course_sections(cv_section)[0]

    opt_items: list[dict] = []
    for course, table, playlist in opt_chunks:
        for row in parse_table_rows(table):
            row["course"] = course
            row["playlist"] = playlist
            opt_items.append(row)

    la_items = parse_table_rows(la_table)
    for row in la_items:
        row["course"] = "LADR 4e"
        row["playlist"] = "https://linear.axler.net/LADR4e.pdf"

    ml_items: list[dict] = []
    for course, table, playlist in ml_chunks:
        for row in parse_table_rows(table):
            row["course"] = course.split()[0]  # CS109, CS229, CS229M
            row["playlist"] = playlist
            ml_items.append(row)

    cv_items = parse_table_rows(cv_table)
    for row in cv_items:
        row["course"] = "CS198-126"
        row["playlist"] = cv_playlist

    return {
        "opt": opt_items,
        "la": la_items,
        "ml": ml_items,
        "cv": cv_items,
    }


def resources_yaml(course: str, links: list[tuple[str, str]], playlist: str | None, summary: str) -> str:
    lines: list[str] = []
    for label, url in links:
        rtype = resource_type(url)
        title = f"{course} {label}" if label else course
        lines.extend(
            [
                f"          - type: {rtype}",
                f'            title: "{yaml_quote(title)}"',
                f'            url: "{url}"',
            ]
        )
    if playlist and all(playlist != url for _, url in links) and links:
        lines.extend(
            [
                f"          - type: {resource_type(playlist)}",
                f'            title: "{yaml_quote(course)} — playlist"',
                f'            ref: "{yaml_quote(summary)}"',
                f'            url: "{playlist}"',
            ]
        )
    elif summary and not links:
        lines.extend(
            [
                "          - type: url",
                f'            title: "{yaml_quote(course)}"',
                f'            ref: "{yaml_quote(summary)}"',
            ]
        )
    return "\n".join(lines)


def topic_from_row(
    *,
    tid: str,
    prefix: str,
    index: int,
    row: dict,
    requires: list[str],
    icon: str,
    default_hours: int = 8,
    default_xp: int = 110,
) -> str:
    course = row["course"]
    title_bits = [course]
    if row["summary"]:
        title_bits.append(row["summary"][:60])
    title = ": ".join(title_bits) if len(title_bits) > 1 else course

    practice = row["practice"]
    enc: list[str] = []
    material = row["material"].strip()
    has_theory = bool(row["links"]) or material not in ("—", "-", "")
    if has_theory:
        enc.append(
            f"""      - id: {tid}_theory
        type: theory
        title: "{yaml_quote(material[:120] if material not in ('—', '-') else row['summary'][:120])}"
        description: |
{block(material if material not in ('—', '-') else row['summary'] or course, 10)}
        resources:
{resources_yaml(course, row["links"], row.get("playlist"), row["summary"])}
        xp: {max(40, default_xp - 20)}"""
        )
    if practice:
        enc.append(
            f"""      - id: {tid}_practice
        type: practice
        title: "Практика"
        description: |
{block(practice, 10)}
        tasks:
          - "{yaml_quote(practice)}"
        xp: 40"""
        )

    req = "    requires: []\n" if not requires else "    requires:\n" + "".join(f"      - {r}\n" for r in requires)
    return f"""  - id: {tid}
    title: "{yaml_quote(f'Iteration {index}: {course}')}"
    description: |
{block(row['material'], 6)}
    estimated_hours: {default_hours}
{req}    reward:
      xp: {default_xp}
    waypoint:
      x: 0
      y: 0
      icon: {icon}
      label: "Iteration {index}"
    encounters:
{chr(10).join(enc)}
"""


def chain_from_rows(rows: list[dict], prefix: str, icon: str) -> str:
    out: list[str] = []
    prev: list[str] = []
    for i, row in enumerate(rows, 1):
        tid = f"{prefix}_i{i:02d}"
        out.append(topic_from_row(tid=tid, prefix=prefix, index=i, row=row, requires=prev.copy(), icon=icon))
        prev = [tid]
    return "\n".join(out)


def region_header(
    *,
    rid: str,
    title: str,
    world_name: str,
    world_description: str,
    color: str,
    unlocks_after: list[str],
    map_background: str | None = None,
    boss_yaml: str,
) -> str:
    unlock = "[]" if not unlocks_after else "\n".join(f"  - {u}" for u in unlocks_after)
    unlock_block = f"unlocks_after: {unlock}" if not unlocks_after else f"unlocks_after:\n{unlock}"
    bg = f'map_background: "{map_background}"\n' if map_background else ""
    return f"""dsl_version: "1"
id: {rid}
title: "{title}"
world_name: "{world_name}"
world_description: |
{block(world_description, 2)}
color: "{color}"
{bg}
{unlock_block}

{boss_yaml}

topics:
"""


LA_BOSS = """boss:
  id: la_boss
  hidden: true
  title: "The Decomposition Engine"
  description: |
    Capstone of linear algebra: SVD as the unified view of operators on inner product spaces.
  unlock_condition: complete_all_topics
  reward:
    xp: 500
    item: "Prism of Singular Values"
    title: "Decomposer"
  encounter:
    type: review
    title: "Operate the Engine"
    description: |
      Derive SVD from the spectral theorem. Connect to PCA and least squares.
    tasks:
      - "State and prove the SVD theorem for real matrices."
      - "Implement simplified SVD and compare with numpy.linalg.svd."
"""

OPT_BOSS = """boss:
  id: opt_boss
  hidden: true
  title: "The Saddle Point"
  description: |
    Duality, minimax, and why flat minima generalize better than sharp ones.
  unlock_condition: complete_all_topics
  reward:
    xp: 500
    item: "Lagrange Multiplier"
    title: "Dualist"
  encounter:
    type: review
    title: "The Minimax Duel"
    description: |
      Connect primal/dual optimization and stochastic methods.
    tasks:
      - "Formulate an ML problem with a meaningful dual."
      - "Compare GD, AGD, and ADMM on a toy problem."
"""

ML_BOSS = """boss:
  id: ml_boss
  hidden: true
  title: "The Generalization Demon"
  description: |
    Bias-variance, regularization, and limits of classical generalization theory.
  unlock_condition: complete_all_topics
  reward:
    xp: 500
    item: "Generalization Bound"
    title: "Theorist of Learning"
  encounter:
    type: review
    title: "Face the Demon"
    description: |
      Empirical bias-variance study and theoretical justification.
    tasks:
      - "Demonstrate bias-variance tradeoff on a controlled dataset."
      - "Explain one phenomenon standard VC theory cannot explain for deep nets."
"""

CV_BOSS = """boss:
  id: cv_boss
  hidden: true
  title: "The All-Seeing Eye"
  description: |
    End-to-end vision pipeline from pixels to structured understanding.
  unlock_condition: complete_all_topics
  reward:
    xp: 500
    item: "The Seeing Stone"
    title: "Computer Visionary"
  encounter:
    type: review
    title: "Build the Eye"
    description: |
      Design and prototype a complete vision system.
    tasks:
      - "Define a vision task, metric, and full pipeline."
      - "Implement a working prototype and analyze failure cases."
"""

NLP_BOSS = """boss:
  id: nlp_boss
  hidden: true
  title: "The Language Forge"
  description: |
    Placeholder boss for the NLP & LLM block — content coming soon.
  unlock_condition: complete_all_topics
  reward:
    xp: 500
    item: "Tokenizer of Ages"
    title: "Wordsmith"
  encounter:
    type: review
    title: "Forge the Model"
    description: |
      Will be defined when the NLP block is filled in plan_2.md.
    tasks:
      - "TBD"
"""


def main() -> None:
    if not PLAN.exists():
        raise SystemExit(f"Missing {PLAN}")

    data = load_plan()
    print(
        f"parsed: la={len(data['la'])}, opt={len(data['opt'])}, "
        f"ml={len(data['ml'])}, cv={len(data['cv'])}"
    )

    files = {
        "linear-algebra.yaml": region_header(
            rid="la",
            title="Linear Algebra",
            world_name="The Crystalline Vaults",
            world_description="LADR 4e — 10 chapters + capstone lab. Root of the journey.",
            color="#90caf9",
            unlocks_after=[],
            map_background="8b1e081f-e842-4308-853f-5acdebc1536d.png",
            boss_yaml=LA_BOSS,
        )
        + chain_from_rows(data["la"], "la", "crystal_small"),
        "optimization.yaml": region_header(
            rid="opt",
            title="Optimization",
            world_name="The Gradient Wastes",
            world_description="EE364A + Caramanis. Depends on linear algebra.",
            color="#ffb74d",
            unlocks_after=["la"],
            boss_yaml=OPT_BOSS,
        )
        + chain_from_rows(data["opt"], "opt", "wasteland_marker"),
        "machine-learning.yaml": region_header(
            rid="ml",
            title="Machine Learning",
            world_name="The Emergent Forests",
            world_description="CS109 + CS229 + CS229M. Parallel to optimization; depends only on linear algebra.",
            color="#81c784",
            unlocks_after=["la"],
            boss_yaml=ML_BOSS,
        )
        + chain_from_rows(data["ml"], "ml", "forest_glow"),
        "computer-vision.yaml": region_header(
            rid="cv",
            title="Computer Vision",
            world_name="The Seeing Peaks",
            world_description="CS198-126 — 22 lectures in 7 iterations. Depends on ML base.",
            color="#ce93d8",
            unlocks_after=["ml"],
            boss_yaml=CV_BOSS,
        )
        + chain_from_rows(data["cv"], "cv", "peak_base"),
        "nlp-llm.yaml": region_header(
            rid="nlp",
            title="NLP & LLM",
            world_name="The Scriptoria",
            world_description="Upper block: requires optimization and ML. Content TBD.",
            color="#f48fb1",
            unlocks_after=["opt", "ml"],
            boss_yaml=NLP_BOSS,
        )
        + chain_from_rows(
            [
                {
                    "iteration": 1,
                    "course": "NLP",
                    "links": [],
                    "summary": "Наполнение будет добавлено позже",
                    "practice": None,
                    "material": "NLP и LLM — placeholder",
                    "playlist": None,
                }
            ],
            "nlp",
            "scroll_marker",
        ),
    }

    REGIONS.mkdir(parents=True, exist_ok=True)
    for name, body in files.items():
        (REGIONS / name).write_text(body, encoding="utf-8")
        print(f"wrote {name}")


if __name__ == "__main__":
    main()
