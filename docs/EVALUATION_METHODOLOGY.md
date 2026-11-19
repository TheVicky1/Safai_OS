# SafaiOS - Evaluation Methodology and Benchmark Protocol

This document defines the quantitative evaluation methodology, stratification dimensions, operational operating points, and benchmark datasets used to assess the SafaiOS YOLO11s detection engine.

---

## 1. Operating Metrics vs Summary Metrics

Computer vision research benchmarks often report peak metrics across an optimal confidence sweep curve. In real-world municipal deployments, however, edge camera hardware operates at a **fixed operating threshold**.

SafaiOS evaluates and reports both:

### 1.1 Summary Metrics (Optimal Sweep)
- **`box.mp` (Mean Precision)**: Mean precision across all classes at peak F1 threshold.
- **`box.mr` (Mean Recall)**: Mean recall across all classes at peak F1 threshold.
- **`box.map50` (mAP at IoU=0.50)**: Mean Average Precision at 0.50 intersection-over-union.
- **`box.map50-95` (COCO mAP)**: Mean Average Precision averaged across 10 IoU thresholds from 0.50 to 0.95 in steps of 0.05.

### 1.2 Operational Operating Point (Field Deployment)
Evaluated strictly at the fixed operational thresholds configured on edge devices:
- **Operational Confidence**: `conf = 0.25`.
- **Operational IoU Threshold**: `iou = 0.60`.
- **Class-Specific NMS**: Applied independently across all 5 classes to prevent cross-class suppression in dense waste piles.

---

## 2. Stratification Dimensions

To ensure model fairness, high recall on small litter items, and robustness in cluttered environments, test evaluations are stratified across three key dimensions:

### 2.1 Relative Scale Stratum
Waste items vary drastically in size, from small candy wrappers to large cardboard shipping boxes:
- **Small Objects**: Normalized bounding box area $< 0.025$ of the total frame.
- **Medium Objects**: Normalized bounding box area between $0.025$ and $0.050$.
- **Large Objects**: Normalized bounding box area $> 0.050$.

Evaluation reports track Precision, Recall, and F1 separately for each scale tier to prevent large object scores from masking small litter false negatives.

### 2.2 Pairwise Overlap Stratum
Real-world municipal waste frequently accumulates in overlapping piles:
- **Isolated Objects**: Ground truth boxes with pairwise IoU $< 0.10$ with all other boxes in the image.
- **Overlapping / Cluttered Objects**: Ground truth boxes with pairwise IoU $\ge 0.10$ with at least one other box in the image.

The greedy matching algorithm evaluates how effectively class-specific NMS separates overlapping instances.

### 2.3 Environmental Domain Stratum
- **Urban Paved Surfaces**: Concrete roads, footpaths, asphalt streets.
- **Unpaved / Natural Ground**: Soil, sand, grass, open fields.
- **Drainage & Water Channels**: Canals, gutters, stormwater drains.
- **Adverse Lighting**: Direct midday glare, deep cast shadows, low-light dusk conditions.

---

## 3. Benchmark Datasets and Split Isolation

SafaiOS enforces strict data hygiene to eliminate data leakage and ensure reproducible benchmarks:

```text
┌─────────────────────────────────────────────────────────────┐
│                 SafaiOS Benchmark Datasets                  │
│                                                             │
│  [ SafaiOS Dataset v10k ]                                   │
│  - 10,000 Curated, Verified Municipal Waste Images          │
│  - Training Split: 7,000 images (70%)                       │
│  - Validation Split: 1,500 images (15%)                     │
│  - Test Split: 1,500 images (15%)                           │
│                                                             │
│  [ India Real-World Benchmark ]                             │
│  - 2,500 Field-captured urban images                        │
│  - 100% Isolated from training splits                       │
│  - High visual complexity, varied camera angles             │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Zero Data Leakage Rule
1. **Sha256 Hash Deduplication**: Exact duplicates across splits are strictly prohibited and enforced by automated tests (`test_06_exact_duplicate_rejected`).
2. **Perceptual Near-Duplicate Filtering**: Phash algorithms flag near-duplicate video frames captured in rapid succession.
3. **Locked Test Set Immutability**: The test set is cryptographically sealed; training scripts are barred from accessing or modifying test split directories.

---

## 4. Mathematical Formulations

### 4.1 Intersection over Union (IoU)
For predicted bounding box $B_p$ and ground truth box $B_g$:
$$\text{IoU}(B_p, B_g) = \frac{\text{Area}(B_p \cap B_g)}{\text{Area}(B_p \cup B_g)}$$

### 4.2 Precision and Recall at Operational Threshold
For detections with confidence $\ge 0.25$ and matched at $\text{IoU} \ge 0.50$:
$$\text{Precision} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Positives}}$$
$$\text{Recall} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$$
$$\text{F1 Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
