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
