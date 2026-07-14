#!/usr/bin/env python3
"""Generate region YAML from plan.md iteration tables."""
from __future__ import annotations

import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGIONS = ROOT / "content" / "regions"

# Official course pages / playlists referenced in plan.md
COURSE_URLS: dict[str, tuple[str, str]] = {
    # source key -> (resource type, url)
    "LADR 4e": ("book", "https://linear.axler.net/LADR4e.html"),
    "EE364A": ("video", "https://www.youtube.com/playlist?list=PLoROMvodv4rMJqxxviPa4AmDClvcbHi6h"),
    "Caramanis": ("video", "https://www.youtube.com/playlist?list=PLXsmhnDvpjORzPelSDs0LSDrfJcqyLlZc"),
    "CS109": ("video", "https://www.youtube.com/playlist?list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg"),
    "CS229": ("video", "https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy"),
    "CS229M": ("video", "https://www.youtube.com/playlist?list=PLoROMvodv4rP8nAmISxFINlGKSK4rbLKh"),
    "CS198-126": ("video", "https://www.youtube.com/playlist?list=PLzWRmD0Vi2KVsrCqA4VnztE4t71KnTnP5"),
    "Python / numpy": ("url", "https://numpy.org/doc/stable/reference/routines.linalg.html"),
}


def yaml_quote(s: str) -> str:
    return s.replace('"', '\\"')


def block(text: str, indent: int = 0) -> str:
    pad = " " * indent
    return textwrap.indent(textwrap.dedent(text).strip("\n"), pad)


def topic(
    *,
    tid: str,
    title: str,
    description: str,
    requires: list[str],
    source: str,
    material: str,
    practice: str | None,
    hours: int = 6,
    xp: int = 100,
    icon: str,
    label: str,
) -> str:
    enc: list[str] = []
    rtype, rurl = COURSE_URLS.get(source, ("url", ""))
    resource_lines = [
        f"          - type: {rtype}",
        f'            title: "{yaml_quote(source)}"',
        f'            ref: "{yaml_quote(material)}"',
    ]
    if rurl:
        resource_lines.append(f'            url: "{rurl}"')
    resources_yaml = "\n".join(resource_lines)

    enc.append(
        f"""      - id: {tid}_theory
        type: theory
        title: "{yaml_quote(material)}"
        description: |
{block(description, 10)}
        resources:
{resources_yaml}
        xp: {max(40, xp - 20)}"""
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

    req = ""
    if requires:
        req = "    requires:\n" + "".join(f"      - {r}\n" for r in requires)
    else:
        req = "    requires: []\n"

    encounters = "\n".join(enc)
    return f"""  - id: {tid}
    title: "{yaml_quote(title)}"
    description: |
{block(description, 6)}
    estimated_hours: {hours}
{req}    reward:
      xp: {xp}
    waypoint:
      x: 0
      y: 0
      icon: {icon}
      label: "{yaml_quote(label)}"
    encounters:
{encounters}
"""


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
      Will be defined when the NLP block is filled in plan.md.
    tasks:
      - "TBD"
"""


def chain_topics(items: list[dict], prefix: str, icon: str) -> str:
    out: list[str] = []
    prev: list[str] = []
    for i, item in enumerate(items, 1):
        tid = f"{prefix}_i{i:02d}"
        out.append(
            topic(
                tid=tid,
                requires=prev.copy(),
                icon=icon,
                label=f"Iteration {i}",
                **item,
            )
        )
        prev = [tid]
    return "\n".join(out)


def main() -> None:
    la_items = [
        dict(title="Vector Spaces", description="LADR Ch. 1 — vector spaces.", source="LADR 4e", material="Гл. 1 Vector Spaces", practice="Задачи из конца главы", hours=8, xp=120),
        dict(title="Finite-Dimensional Spaces", description="LADR Ch. 2 — dimension, basis, rank.", source="LADR 4e", material="Гл. 2 Finite-Dimensional Vector Spaces", practice="Задачи из конца главы", hours=8, xp=120),
        dict(title="Linear Maps", description="LADR Ch. 3 — linear maps and matrices.", source="LADR 4e", material="Гл. 3 Linear Maps", practice="Задачи из конца главы", hours=10, xp=140),
        dict(title="Polynomials", description="LADR Ch. 4 — polynomial tools (selective).", source="LADR 4e", material="Гл. 4 Polynomials", practice="Задачи выборочно", hours=6, xp=100),
        dict(title="Eigenvalues & Eigenvectors", description="LADR Ch. 5 — spectral foundations for ML.", source="LADR 4e", material="Гл. 5 Eigenvalues and Eigenvectors", practice="Задачи из конца главы — не пропускать", hours=10, xp=140),
        dict(title="Inner Product Spaces", description="LADR Ch. 6 — geometry, orthogonality.", source="LADR 4e", material="Гл. 6 Inner Product Spaces", practice="Задачи из конца главы", hours=8, xp=120),
        dict(title="SVD & Normal Operators", description="LADR Ch. 7 — operators on inner product spaces.", source="LADR 4e", material="Гл. 7 Operators on Inner Product Spaces (SVD)", practice="Задачи из конца главы", hours=10, xp=140),
        dict(title="Complex & Real Operators", description="LADR Ch. 8–9 — selective coverage.", source="LADR 4e", material="Гл. 8–9 Operators on Complex/Real Vector Spaces", practice="Задачи выборочно", hours=6, xp=100),
        dict(title="Trace & Determinant", description="LADR Ch. 10 — trace and determinant.", source="LADR 4e", material="Гл. 10 Trace and Determinant", practice="Задачи из конца главы", hours=8, xp=120),
        dict(title="Power Iteration & SVD Lab", description="Capstone: implement power iteration and simplified SVD.", source="Python / numpy", material="Итерация 10 — capstone", practice="Реализовать power iteration и упрощённый SVD, сверить с numpy.linalg", hours=8, xp=150),
    ]

    opt_items = [
        dict(title="EE364A: Intro & Convexity", description="Boyd EE364A lectures 1–3.", source="EE364A", material="EE364A 1–3 (intro, выпуклые множества, выпуклые функции)", practice=None, hours=8, xp=110),
        dict(title="EE364A: Problems & Duality", description="Boyd EE364A lectures 4–5.", source="EE364A", material="EE364A 4–5 (задачи выпуклой оптимизации, двойственность)", practice="Проверка выпуклости по Гессиану на 3–4 тестовых функциях", hours=8, xp=110),
        dict(title="EE364A: Approximation & Estimation", description="Boyd EE364A lectures 6–8.", source="EE364A", material="EE364A 6–8 (аппроксимация/fitting, стат. оценивание, геометрические задачи)", practice=None, hours=8, xp=110),
        dict(title="EE364A: Numerical LA & Unconstrained", description="Boyd EE364A lectures 9–10.", source="EE364A", material="EE364A 9–10 (численная линалгебра, безусловная минимизация)", practice="Градиентный спуск (1-й порядок) с нуля + тест сходимости", hours=10, xp=120),
        dict(title="EE364A: Constrained & Interior Point", description="Boyd EE364A lectures 11–14.", source="EE364A", material="EE364A 11–14 (условная минимизация, методы внутренней точки)", practice="Координатный спуск / random search (0-й порядок) с нуля, сравнение с GD", hours=10, xp=120),
        dict(title="EE364A: Remaining Topics", description="Boyd EE364A lectures 15–18.", source="EE364A", material="EE364A 15–18 (оставшиеся темы курса)", practice=None, hours=8, xp=110),
        dict(title="Caramanis: Introduction", description="Caramanis 1.1–1.4.", source="Caramanis", material="1.1–1.4 (введение, обзор, примеры, база линалгебры/анализа)", practice=None, hours=6, xp=100),
        dict(title="Caramanis: Convex Sets I", description="Caramanis 2.1–2.3.", source="Caramanis", material="2.1–2.3 (выпуклые множества, выпуклые функции)", practice=None, hours=6, xp=100),
        dict(title="Caramanis: Convex Sets II", description="Caramanis 2.4–2.6.", source="Caramanis", material="2.4–2.6 (эквивалентные определения, условия оптимальности, проекция)", practice="Проверка выпуклости по Гессиану", hours=8, xp=110),
        dict(title="Caramanis: Gradient Descent", description="Caramanis 3.1–3.4.", source="Caramanis", material="3.1–3.4 (Gradient & Subgradient Descent, smooth/strongly convex)", practice="Subgradient descent с нуля + тест скорости сходимости", hours=10, xp=120),
        dict(title="Caramanis: Acceleration", description="Caramanis 4.1–4.2.", source="Caramanis", material="4.1–4.2 (Oracle Lower Bounds, Accelerated Gradient Descent)", practice="Nesterov AGD с нуля, сравнение с обычным GD", hours=8, xp=110),
        dict(title="Caramanis: Proximal Methods", description="Caramanis 5.1–5.4.", source="Caramanis", material="5.1–5.4 (Proximal/Projected GD, ISTA/FISTA)", practice="ISTA/FISTA с нуля на L1-регуляризованной задаче", hours=10, xp=120),
        dict(title="Caramanis: Mirror & Frank-Wolfe", description="Caramanis 5.5–5.12.", source="Caramanis", material="5.5–5.12 (Mirror Descent, Frank-Wolfe)", practice="Mirror Descent или Frank-Wolfe с нуля", hours=8, xp=110),
        dict(title="Caramanis: SGD & SVRG", description="Caramanis 6.1–6.5.", source="Caramanis", material="6.1–6.5 (SGD, SVRG)", practice="SGD и SVRG с нуля, сравнение сходимости", hours=10, xp=120),
        dict(title="Caramanis: Newton's Method", description="Caramanis 7.1–7.4.", source="Caramanis", material="7.1–7.4 (метод Ньютона: вид, аффинные преобразования, сходимость)", practice="Метод Ньютона (2-й порядок) с нуля, тест квадратичной сходимости", hours=10, xp=120),
        dict(title="Caramanis: Quasi-Newton & IPM", description="Caramanis 8.1–9.4.", source="Caramanis", material="8.1–9.4 (Quasi-Newton/BFGS, Interior Point Methods)", practice="Опционально: BFGS с нуля", hours=8, xp=110),
        dict(title="Caramanis: Duality & Decomposition", description="Caramanis 10.1–11.6.", source="Caramanis", material="10.1–11.6 (Fenchel Dual, Dual Decomposition, Proximal Point/ALM)", practice=None, hours=8, xp=110),
        dict(title="Caramanis: ADMM", description="Caramanis 12.1–12.5.", source="Caramanis", material="12.1–12.5 (Monotone Operators, Douglas-Rachford, ADMM)", practice="ADMM с нуля на задаче Lasso, тест сходимости", hours=10, xp=130),
    ]

    ml_items = [
        dict(title="CS109: Counting & Probability", description="CS109 lectures 1–3.", source="CS109", material="1–3 (счёт, комбинаторика, что такое вероятность)", practice=None, hours=6, xp=90),
        dict(title="CS109: Bayes & Expectation", description="CS109 lectures 4–6.", source="CS109", material="4–6 (условная вероятность и Байес, независимость, случайные величины)", practice="Задачи на условную вероятность/Байеса", hours=8, xp=100),
        dict(title="CS109: Distributions I", description="CS109 lectures 7–10.", source="CS109", material="7–10 (дисперсия, Бернулли, Биномиальное, Пуассон, непрерывные, нормальное)", practice="Смоделировать распределения в Python, оценка Монте-Карло", hours=8, xp=100),
        dict(title="CS109: Joint & Inference I", description="CS109 lectures 11–14.", source="CS109", material="11–14 (совместные распределения, инференс I–II, моделирование)", practice=None, hours=8, xp=100),
        dict(title="CS109: CLT & Bootstrap", description="CS109 lectures 15–19.", source="CS109", material="15–19 (инференс, Beta, ЦПТ, bootstrap/p-values)", practice="Демонстрация ЦПТ и bootstrap в Python", hours=8, xp=100),
        dict(title="CS109: MLE & MAP", description="CS109 lectures 20–22.", source="CS109", material="20–22 (алгоритмический анализ, MLE, MAP)", practice="MLE/MAP с нуля для простого распределения", hours=8, xp=100),
        dict(title="CS109: Naive Bayes & LogReg", description="CS109 lectures 23–24.", source="CS109", material="23–24 (наивный Байес, логистическая регрессия)", practice="Наивный Байес и логрег с нуля", hours=8, xp=110),
        dict(title="CS109: Deep Learning Intro", description="CS109 lectures 25–29.", source="CS109", material="25–29 (Deep Learning intro, Fairness, Advanced Probability)", practice=None, hours=6, xp=90),
        dict(title="CS229: LMS & Regression", description="CS229 lectures 1–3.", source="CS229", material="1–3 (введение, LMS, Weighted LS/логрег/Ньютон)", practice="Линейная и логистическая регрессия с нуля", hours=10, xp=120),
        dict(title="CS229: GLM & Generative", description="CS229 lectures 4–6.", source="CS229", material="4–6 (экспоненциальное семейство/GLM, GDA/наивный Байес)", practice=None, hours=8, xp=100),
        dict(title="CS229: Kernels & Neural Nets", description="CS229 lectures 7–9.", source="CS229", material="7–9 (ядра, нейросети 1–2/backprop)", practice="Простая NN (forward/backward) с нуля", hours=10, xp=120),
        dict(title="CS229: Bias-Variance", description="CS229 lectures 10–11.", source="CS229", material="10–11 (bias-variance/регуляризация, feature/model selection)", practice=None, hours=8, xp=100),
        dict(title="CS229: Unsupervised", description="CS229 lectures 12–15.", source="CS229", material="12–15 (k-means, GMM/EM, factor analysis/PCA, PCA/ICA)", practice="k-means, GMM/EM и PCA с нуля", hours=10, xp=120),
        dict(title="CS229: RL & Impact", description="CS229 lectures 16–19.", source="CS229", material="16–19 (self-supervised, RL basics, societal impact, model-based RL)", practice=None, hours=8, xp=100),
        dict(title="CS229M: ERM & Concentration", description="CS229M lectures 1–4 (by number).", source="CS229M", material="1–4 (overview/ERM, Hoeffding, гипотезы классов, концентрационные неравенства)", practice="Эмпирически проверить границу Хёфдинга", hours=8, xp=100),
        dict(title="CS229M: Rademacher & Margin", description="CS229M lectures 5–6.", source="CS229M", material="5–6 (Rademacher complexity, margin theory)", practice=None, hours=8, xp=100),
        dict(title="CS229M: Deep Generalization", description="CS229M lectures 7–10.", source="CS229M", material="7–10 (генерализация для нейросетей, ядра, covering numbers, bounds)", practice=None, hours=8, xp=100),
        dict(title="CS229M: Nonconvex & Margins", description="CS229M lectures 11–12.", source="CS229M", material="11–12 (all-layer margin, невыпуклая оптимизация/PCA/matrix completion)", practice="Невыпуклая PCA или matrix completion — игрушечный пример", hours=8, xp=110),
        dict(title="CS229M: NTK & Implicit Reg", description="CS229M lectures 13–17.", source="CS229M", material="13–17 (NTK, implicit regularization)", practice=None, hours=8, xp=100),
        dict(title="CS229M: Unsupervised Theory", description="CS229M lectures 18–20.", source="CS229M", material="18–20 (mixture of Gaussians, spectral clustering)", practice="Spectral clustering vs GMM на модельных данных", hours=8, xp=110),
    ]

    cv_items = [
        dict(title="CV: Intro & Pretraining", description="CS198-126 lectures 1–5.", source="CS198-126", material="1–5 (Intro to ML, Intro to DL, Pretraining/Augmentations, Intro to CV)", practice=None, hours=8, xp=100),
        dict(title="CV: Architectures & Detection", description="CS198-126 lectures 6–7.", source="CS198-126", material="6–7 (Advanced CV Architectures, Object Detection)", practice="Обучить простую CNN на CIFAR-10 (PyTorch)", hours=10, xp=120),
        dict(title="CV: Segmentation & VAE", description="CS198-126 lectures 8–9.", source="CS198-126", material="8–9 (Semantic Segmentation, Autoencoders/VAE)", practice=None, hours=8, xp=100),
        dict(title="CV: GANs & Diffusion", description="CS198-126 lectures 10–12.", source="CS198-126", material="10–12 (GANs, Advanced GANs, Diffusion Models)", practice="Обучить GAN на MNIST (диффузию — опционально)", hours=10, xp=120),
        dict(title="CV: Transformers & ViT", description="CS198-126 lectures 13–16.", source="CS198-126", material="13–16 (Sequence Modeling, Transformers, ViT, Advanced Detection/Segmentation)", practice="Transfer learning: дообучить ViT/детектор", hours=10, xp=120),
        dict(title="CV: 3D & Pretraining", description="CS198-126 lectures 17–19.", source="CS198-126", material="17–19 (3D Vision Survey, Advanced Vision Pretraining)", practice=None, hours=8, xp=100),
        dict(title="CV: Multimodal & Audio", description="CS198-126 lectures 20–22.", source="CS198-126", material="20–22 (Stylizing Images, Generative Audio, Multimodal Learning)", practice=None, hours=8, xp=100),
    ]

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
        + chain_topics(la_items, "la", "crystal_small"),
        "optimization.yaml": region_header(
            rid="opt",
            title="Optimization",
            world_name="The Gradient Wastes",
            world_description="EE364A (18 lectures) + Caramanis (12 blocks). Depends on linear algebra.",
            color="#ffb74d",
            unlocks_after=["la"],
            boss_yaml=OPT_BOSS,
        )
        + chain_topics(opt_items, "opt", "wasteland_marker"),
        "machine-learning.yaml": region_header(
            rid="ml",
            title="Machine Learning",
            world_name="The Emergent Forests",
            world_description="CS109 + CS229 + CS229M. Parallel to optimization; depends only on linear algebra.",
            color="#81c784",
            unlocks_after=["la"],
            boss_yaml=ML_BOSS,
        )
        + chain_topics(ml_items, "ml", "forest_glow"),
        "computer-vision.yaml": region_header(
            rid="cv",
            title="Computer Vision",
            world_name="The Seeing Peaks",
            world_description="CS198-126 — 22 lectures in 7 iterations. Depends on ML base.",
            color="#ce93d8",
            unlocks_after=["ml"],
            boss_yaml=CV_BOSS,
        )
        + chain_topics(cv_items, "cv", "peak_base"),
        "nlp-llm.yaml": region_header(
            rid="nlp",
            title="NLP & LLM",
            world_name="The Scriptoria",
            world_description="Upper block: requires optimization and ML. Content TBD in plan.md.",
            color="#f48fb1",
            unlocks_after=["opt", "ml"],
            boss_yaml=NLP_BOSS,
        )
        + chain_topics(
            [
                dict(
                    title="Coming Soon",
                    description="Block 5 from plan.md — наполнение будет добавлено позже.",
                    source="TBD",
                    material="NLP и LLM — placeholder",
                    practice=None,
                    hours=1,
                    xp=10,
                )
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
