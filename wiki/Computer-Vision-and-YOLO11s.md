# Computer Vision & YOLO11s Engine

<div align="center">

**Edge-Capable Deep Learning for Real-World Municipal Waste Detection**

</div>

---

## 👁️ Visual Intelligence Overview

The visual intelligence engine in SafaiOS is engineered to solve a difficult real-world challenge: detecting, localizing, and categorizing unorganized, overlapping, and weathered litter in dynamic municipal streetscapes.

Unlike standard clean-room object detection benchmarks, municipal street waste exhibits:
- **Severe Occlusion & Clutter**: Waste items piled haphazardly on curbs and vacant lots.
- **Material Degradation**: Crushed cans, crumpled paper, torn plastics, and soiled cardboard.
- **Extreme Scale Variance**: Tiny cigarette wrappers and bottle caps alongside large shipping cartons.
- **Lighting & Background Noise**: Harse tropical sunlight, deep monsoonal shadows, dusty asphalt, and variegated vegetation.

To solve this, SafaiOS employs an optimized **Ultralytics YOLO11s** backbone running a customized 768px input pipeline with class-specific post-processing.

---

## 🏷️ Approved Waste Taxonomy

SafaiOS classifies detected waste into five standard municipal material classes:

| Class ID | Identifier | Target Real-World Material | Typical Examples |
| :---: | :--- | :--- | :--- |
| **0** | `plastic_bottle` | Rigid PET water, soda, and consumer bottles | Disposable mineral water bottles, juice jugs, shampoo bottles |
| **1** | `plastic_wrapper_bag` | Thin film polymers, packaging wraps, and carry bags | Snack packets, grocery bags, chip wraps, multipack films |
| **2** | `paper_cardboard` | Cellulose packaging, newsprint, and corrugated boards | Shipping boxes, take-away cartons, paper cups, newspapers |
| **3** | `glass_bottle_container` | Clear and colored glass beverage containers | Beer bottles, soda bottles, condiment jars, broken glass |
| **4** | `metal_can` | Ferrous and non-ferrous metal beverage/food containers | Aluminium beverage cans, tin food cans, aerosol spray cans |

---

## 🧬 Model Architecture & Pipeline

```text
[ Incoming Frame / Image ]
            │
            ▼
[ Letterbox Preprocessing ] ────► Resizes aspect ratio cleanly to 768x768 with grey padding
            │
            ▼
[ YOLO11s Backbone ] ──────────► Modified CSPDarknet with C3k2 blocks and SPPF pooling
            │
            ▼
[ Path Aggregation Neck ] ─────► Multi-scale feature fusion across shallow and deep layers
            │
            ▼
[ Decoupled Detection Head ] ──► Dual-branch regression and classification heads
            │
            ▼
[ Class-Specific NMS ] ────────► Non-Maximum Suppression (conf=0.25, iou=0.60)
            │
            ▼
[ Normalized Output ] ─────────► Normalized bounding boxes [x_center, y_center, width, height]
```

### Preprocessing Protocol
- **Resolution**: 768px input dimension (`imgsz=768`) balancing fine-grained feature resolution against low latency.
- **Letterbox Padding**: Aspect-ratio preserving bilinear resize with symmetric border padding (`color=(114, 114, 114)`).
- **Normalization**: Zero-mean, unit-variance tensor conversion (`0.0 - 1.0` float32 range).

### Operational Post-Processing Parameters
- **Operating Confidence Threshold (`conf`)**: `0.25` for operational deployment.
- **NMS IoU Threshold (`iou`)**: `0.60` preventing duplicate candidate suppression in dense heaps.
- **Evaluation Matching IoU**: Strict `0.50` IoU for formal evaluation and precision/recall calculations.

---

## 📈 Model Evolution & Experimental Milestones

SafaiOS model development follows strict experimental gates tracked under `reports/experiments/`:

### 1. `E001` - Baseline Configuration & Verification
- Established the baseline input resolution scaling and dataset loading contracts.
- Confirmed initial inference latency targets across CPU and edge accelerators.

### 2. `E002` - Production YOLO11s Model
- Trained on the complete **SafaiOS_Dataset_v10k** dataset at 768px input resolution.
- **Weights Path**: `runs/detect/runs/detect/runs/safaios/safaios_yolo11s_v10k_img768/weights/best.pt`.
- **Checkpoint SHA-256**: `8bd30b05a0b4a84d95c5e71f213b967d255144a8fe57791ef110b920fc86d073`.
- **Operational Performance**: Serves as the signed-off production detector for Phase 1.

### 3. `E003` - High-Resolution Evaluation Protocol
- Stratified evaluation across fine-grained scale strata (Small, Medium, Large area tiers).
- Benchmarked peak F1 thresholds against operational confidence thresholds.

### 4. `E004` - CoarseDropout Occlusion Invariance
- Implements specialized data augmentation simulating extreme real-world occlusion.
- Injects 2 to 8 rectangular dropout holes (`hole_height: 0.05-0.20`, `hole_width: 0.05-0.20`) during training iterations.
- Significantly increases recall on partially buried or overlapping waste instances in dense municipal dumps.

---

## 📦 Dataset Engineering (`SafaiOS_Dataset_v10k`)

The model family is trained on a rigorously curated dataset adhering to strict split hygiene:

```text
SafaiOS_Dataset_v10k/
├── train/              # 7,000+ training images with multi-material labels
├── val/                # 1,500 validation images for epoch checkpoint selection
├── test_locked_v2/     # 1,500 locked test images (unmodified frozen benchmark)
└── india_real_world/   # Specialized independent Indian municipal evaluation set
```

### Dataset Hygiene Rules
1. **Zero Cross-Split Contamination**: Deterministic split allocation ensures that identical or near-duplicate scenes never span across train and evaluation sets.
2. **Provenance & License Integrity**: Every image is logged with source origin, attribution, and license compliance in the acquisition registry.
3. **Class Balance Calibration**: Strategic sample weighting to prevent majority-class domination by single-use plastic wrappers.

---

## 🔬 Stratified Evaluation Methodology

To ensure transparent reporting, SafaiOS models are evaluated along two orthogonal stratification dimensions:

### 1. Relative Scale Stratum
- **Small Instances**: Normalized bounding box area $< 0.025$ (e.g., bottle caps, crushed cans).
- **Medium Instances**: Normalized area between $0.025$ and $0.050$ (e.g., standard water bottles).
- **Large Instances**: Normalized area $> 0.050$ (e.g., large cardboard boxes, bulk dump heaps).

### 2. Overlap Stratum
- Evaluates model performance on heavily congested scenes where ground-truth boxes exhibit pairwise IoU $\ge 0.10$ with neighboring instances.

---

<div align="center">

[← Previous: System Architecture](System-Architecture) | [Next: Database & Security Foundation →](Database-and-Security-Foundation)

</div>

