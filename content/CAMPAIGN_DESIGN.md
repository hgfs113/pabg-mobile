# Campaign Design Document — Path of the Researcher v0

This document explains every grouping and sequencing decision made in the campaign.
It is written for the campaign author, not the player.

---

## The Central Design Goal

This campaign is for two researchers who want to build genuine mathematical fluency
in machine learning — not just apply libraries. The content should feel like
exploring a coherent intellectual landscape, not completing a checklist.

Every grouping decision asks: *what is the minimum unit of understanding
that can stand alone as a satisfying achievement?*

---

## Region Sequence

### Why this order: LA → Opt → ML → CV?

This is the standard bottom-up mathematical stack for modern ML.

**Linear Algebra** is the substrate. Eigenvalues, inner products, and spectral theory
appear in every other region. You cannot read an optimization convergence proof without them.

**Optimization** is the engine. Every ML training procedure is an optimization problem.
You need to understand why gradient descent works before you can reason about why
a particular model trains well or poorly.

**Machine Learning** is the theory of learning itself. It builds on probability theory
(which requires no linear algebra prereqs beyond intuition), statistical inference,
and the matrix methods that connect LA to data. Supervised learning, EM, and learning
theory are prerequisites to understanding CV architectures at any depth.

**Computer Vision** is the application domain. It requires all three prior regions:
ConvNets require understanding gradient-based training, SVMs and feature learning
require statistical ML, and 3D vision requires linear algebra (camera matrices, SVD).

This order is not the only valid order. A "statistics-first" path (probability → inference → ML → LA) is also coherent.
But the bottom-up mathematical order is the most rigorous.

---

## Linear Algebra: Grouping Decisions

**Source:** Linear Algebra Done Right (Axler), 4th edition.

LADR has 10 chapters. We group them into 5 topics.

### Topic 1: Vector Spaces & Structure (Ch 1–2)
Chapters 1 and 2 are inseparable. Chapter 1 defines vector spaces.
Chapter 2 develops finite-dimensional vector spaces (span, independence, basis, dimension).
These are pure foundations. A player cannot study anything else without them.
**Grouping rationale:** same conceptual level; completing Ch 1 without Ch 2 leaves the story incomplete.

### Topic 2: Linear Maps & Matrices (Ch 3)
Chapter 3 is a natural standalone unit. It introduces the morphisms of vector spaces
and the crucial insight: matrices are representations, not maps.
The rank-nullity theorem is its capstone result.
**Grouping rationale:** Ch 3 is already a coherent unit in the book. No splitting needed.

### Topic 3: Eigenvalues & Eigenvectors (Ch 4–5)
Chapter 4 (Polynomials) provides algebraic tools (specifically, the existence of
eigenvalues over ℂ via the fundamental theorem of algebra) for Chapter 5.
By itself, Chapter 4 has no RPG "reward" — it is a technical tool.
Grouping it with Chapter 5 means the player studies polynomials purposefully.
**Grouping rationale:** Ch 4 is scaffolding for Ch 5; studying them separately would
be like building a bridge without a destination.

### Topic 4: Inner Products & Geometry (Ch 6)
Chapter 6 stands completely alone. It introduces inner product spaces,
orthonormality, Gram-Schmidt, and orthogonal projections.
This is when linear algebra becomes geometry.
**Grouping rationale:** natural standalone unit; the practice tasks (Gram-Schmidt,
least squares via projection) are a complete and satisfying set.

### Topic 5: Spectral Theorem & Normal Operators (Ch 7)
Chapter 7 is the payoff. It requires both eigentheory (Topic 3) and inner products (Topic 4).
The spectral theorem — self-adjoint operators are orthonormally diagonalizable — is
arguably the most important theorem in applied linear algebra.
**Grouping rationale:** Ch 7 is a natural capstone. Ch 8–9 (Jordan form) and Ch 10
(Trace/Determinant) are deferred to the Boss encounter, which synthesizes everything
through the SVD.

**Why not a Topic 6 for Ch 8–10?** The Jordan form and determinants are important
but not prerequisites for the subsequent regions. They appear in the Boss (SVD)
encounter instead, where they serve the synthesis narrative.

---

## Optimization: Grouping Decisions

**Sources:** Boyd & Vandenberghe EE364A (Stanford); Caramanis optimization notes.

### Topic 1: Convex Sets & Functions
The foundation of everything. Without understanding convexity (and why it matters),
the rest of the region is unmotivated. This is the "why are we here?" topic.
**Grouping rationale:** Sets and functions are inseparable — you need both to talk
about convex optimization problems. Separating them would be artificial.

### Topic 2: Optimization Problem Families (LP, QP, SOCP, SDP)
The taxonomy of tractable problems. This is primarily a formulation skill:
recognizing what form a problem has and what that implies about solvers.
**Grouping rationale:** These four families form a natural hierarchy (LP ⊂ QP ⊂ SOCP ⊂ SDP).
Studying them together makes the hierarchy explicit and memorable.

### Topic 3: Lagrangian Duality & KKT
The theoretical engine behind SVM, interior-point methods, and much of ML theory.
This is the hardest topic in the region and is given 12 hours.
**Grouping rationale:** Duality and KKT are two sides of the same coin.
The KKT conditions are exactly the stationarity conditions of the Lagrangian saddle point.
They cannot be understood in isolation.

### Topic 4: First-Order Methods
The workhorse of ML training. This is also the most practice-heavy topic:
implementing and benchmarking gradient descent is more educational than reading about it.
**Grouping rationale:** All first-order methods (GD, SGD, momentum, Nesterov) share the
same convergence analysis framework. They belong together.

### Topic 5: Newton's Method & Second-Order Methods
Qualitatively different from Topic 4: quadratic convergence, Hessian computation,
BFGS. A natural endpoint for the region.
**Grouping rationale:** Second-order methods are a coherent class.
L-BFGS is the natural "practical" endpoint — fast enough for medium scale,
theoretically justified, used in production (scipy.optimize, PyTorch L-BFGS).

---

## Machine Learning: Grouping Decisions

**Sources:** CS109 (Piech, Stanford); CS229M (Tengyu Ma, Stanford); CS229 (Ng, Stanford).

The ordering departs from playlist order. It follows pedagogical necessity.

### Topic 1: Probability Foundations (CS109)
CS109 is the prerequisite to everything. It is placed first not because it's easiest
but because it is foundational. Players who already know probability can complete this
quickly. Players who don't will thank us later.
**Grouping rationale:** All of introductory probability belongs together.
Splitting probability theory from distribution theory would be artificial.

### Topic 2: Statistical Inference (CS109 + CS229)
MLE and MAP are the bridge between probability theory and machine learning models.
They explain *why* cross-entropy is the right loss for classification (MLE under Bernoulli).
They explain *why* L2 regularization is Gaussian prior MAP.
**Grouping rationale:** MLE, MAP, and their connection are a single coherent narrative.
Placing this before supervised learning means students understand training objectives
before they encounter them.

### Topic 3: Matrix Methods (CS229M)
SVD and PCA are the bridge between linear algebra and data.
This topic is placed after inference but before supervised learning because it provides
the geometric vocabulary (low-rank structure, principal directions) that makes
the rest of ML interpretable.
**Grouping rationale:** SVD + PCA + matrix completion are all aspects of
"exploiting low-rank structure in data." They belong together.

### Topic 4: Supervised Learning (CS229)
The central ML problem, now studied with proper foundations.
A player who has done Topics 1–3 can derive the MLE for logistic regression,
understand the geometric interpretation of SVM, and reason about generalization.
**Grouping rationale:** Linear regression, logistic regression, GLMs, and SVMs all
fall under the "supervised learning" umbrella. They share the same evaluation framework
(train/test split, generalization) and are best studied as a family.

### Topic 5: Probabilistic Models & EM (CS229)
Unsupervised learning via latent variable models. The EM algorithm is introduced here
because it requires both probability theory (Topic 1) and supervised learning intuition
(Topic 4 — why MLE is hard for incomplete data).
**Grouping rationale:** GMMs and EM cannot be understood without both probability
foundations and MLE. Placing this after supervised learning ensures the prerequisites
are in place.

### Topic 6: Learning Theory (CS229M + CS229)
The capstone theory topic. PAC learning requires probability theory.
Generalization bounds become meaningful only after the player has seen overfitting
in the supervised learning topic.
**Grouping rationale:** Learning theory is the "meta" topic — it explains when and why
the algorithms in Topics 4–5 work. It belongs at the end when the player has
concrete experience with the phenomena the theory describes.

---

## Computer Vision: Grouping Decisions

**Source:** Berkeley CS194/294-26: Modern Computer Vision (Efros, Kanazawa).

### Topic 1: Images as Signals
Linear filtering, Fourier analysis, edge detection.
This is the signal-processing foundation that makes ConvNets comprehensible.
A player who has implemented Sobel edge detection understands what a convolutional
filter is doing in a way that a player who only read about ConvNets does not.
**Grouping rationale:** Image formation, filtering, and frequency analysis form the
signal processing foundation. They share the convolution primitive.

### Topic 2: Local Features & Correspondence
Harris, SIFT, RANSAC. Classical CV at its most mathematically elegant.
This topic is placed before deep vision because understanding hand-engineered
invariant features builds intuition for what learned features must achieve.
**Grouping rationale:** Feature detection and feature matching are two phases of the
same pipeline. The final artifact (panorama) requires both.

### Topic 3: Deep Learning for Vision
ConvNets, batch norm, residual connections, transfer learning.
This is the longest topic (14h) because it requires both implementation and visualization.
**Grouping rationale:** Architecture innovations (AlexNet, VGG, ResNet) are best studied
as a progression. Each solves a specific failure mode of the previous architecture.
Studying them as a family reveals the design principles.

### Topic 4: Detection & Segmentation
Localization and dense prediction. The two-stage (Faster R-CNN) vs one-stage (YOLO/RetinaNet) tradeoff.
**Grouping rationale:** Detection and segmentation share the same backbone and evaluation framework.
Instance segmentation (Mask R-CNN) is the natural synthesis of both.

### Topic 5: Generative Models & 3D Vision
VAEs, GANs, diffusion, stereo depth, NeRF.
This topic requires ML probabilistic models (for VAE/diffusion) and CV detection (for NeRF context).
**Grouping rationale:** Both generative models and 3D vision are "beyond recognition" tasks.
They test whether the player understands the underlying geometry, not just the classification surface.
Placing them together as the final topic before the Boss creates a sense of frontier.

---

## World Map Design

The world map uses atmospheric fantasy names to create emotional narrative without
educational jargon on the surface. The mapping is:

| Educational Region | World Name            | Atmosphere                          |
|--------------------|-----------------------|-------------------------------------|
| Linear Algebra     | The Crystalline Vaults | Mathematical precision, crystal structure |
| Optimization       | The Gradient Wastes   | Arid, harsh, requiring careful descent |
| Machine Learning   | The Emergent Forests  | Patterns emerging from apparent chaos |
| Computer Vision    | The Seeing Peaks      | Height, vantage point, perception  |

The coordinate layout reads bottom-left to top-right, south to north:
the journey is literally upward. This mirrors the narrative of ascending from
foundations to applications.

The world graph and the prerequisite graph are identical in v0.
They need not always be. Future campaigns could have regions accessible by
multiple prerequisite paths, creating a genuine exploration graph rather than
a linear chain.

---

## Boss Design Rationale

Each boss is designed as a **synthesis encounter**: a question that requires holding
the entire region's knowledge simultaneously.

| Region | Boss | Synthesis Challenge |
|--------|------|---------------------|
| LA | The Decomposition Engine | Derive SVD from spectral theorem |
| Opt | The Saddle Point | Minimax theorem, duality, why SGD finds flat minima |
| ML | The Generalization Demon | Bias-variance tradeoff, double descent |
| CV | The All-Seeing Eye | End-to-end vision system design |

Bosses are hidden (`hidden: true`) until all topics are complete.
This creates the discovery moment: the player completes what they think is the last topic
and a new waypoint appears on the map.

---

## XP Economy

The XP values in this campaign are initial estimates. They will need balancing
once two players begin using the system.

Rough intended shape:
- **Theory encounter:** 60 XP (minimum; reading has lower reward than doing)
- **Practice encounter:** 80–100 XP (variable by difficulty)
- **Review encounter:** 40 XP (reflection is valuable but quick)
- **Topic reward:** 150–200 XP (conquest bonus, varies by topic complexity)
- **Boss:** 500 XP (milestone moment)

Total campaign XP (approximate):
- Linear Algebra: 5 topics × ~320 XP avg + 500 boss = ~2100 XP
- Optimization: 5 topics × ~340 XP avg + 500 boss = ~2200 XP
- Machine Learning: 6 topics × ~335 XP avg + 500 boss = ~2500 XP
- Computer Vision: 5 topics × ~330 XP avg + 500 boss = ~2150 XP
- **Campaign total: ~9000 XP**

This number is arbitrary until the economy is designed. The relative weights
(practice > theory > review; boss >> topic) encode the design intent.

---

## Estimated Effort

| Region | Topics | Hours |
|--------|--------|-------|
| Linear Algebra | 5 | 46h |
| Optimization | 5 | 52h |
| Machine Learning | 6 | 60h |
| Computer Vision | 5 | 54h |
| **Total** | **21** | **~212h** |

At 10 hours per week shared between two people (5h each), this is ~21 weeks.
At 20 hours per week, ~10 weeks. These are topic-level estimates and will
be wrong by 2x in either direction for different people.

---

## What Is Missing from v0

v0 is intentionally incomplete. Notable omissions:

1. **No time complexity or algorithmic complexity content.** This would be a separate
   "Algorithms" region or campaign.

2. **No deep learning theory.** Transformers, attention mechanisms, and the theory
   of deep learning (NTK, mean field theory) are left for a future "Deep Learning" region.

3. **No statistics beyond CS109.** A "Statistical Inference" or "Bayesian Methods"
   region would sit between ML and the current campaign.

4. **No natural language processing.** A "Language" region would follow Computer Vision.

5. **No reinforcement learning.** A "Decision Making" region would extend the campaign.

These are not gaps to be filled in v0. They are hooks for future campaigns.
