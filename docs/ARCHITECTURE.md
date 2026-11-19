# SafaiOS - Technical Architecture and System Design

**Tagline**: The Intelligence Behind Cleaner Cities.  
**Operating Principle**: Detect. Act. Verify.

---

## 1. System Overview and Topology

SafaiOS is a high-throughput, edge-native computer vision and municipal coordination operating system. It detects and classifies street-level solid waste in real time, automates driver dispatch to high-density accumulation zones, and enforces cryptographic verification before issuing civic reward tokens.

```text
+-----------------------------------------------------------------------------------+
|                                 SafaiOS Architecture                              |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Edge Camera / Vehicle ] ---> [ Letterbox Preprocessing (768px) ]               |
|                                            |                                      |
|                                            v                                      |
|                             [ YOLO11s Backbone & Head ]                           |
|                                            |                                      |
|                                            v                                      |
|                             [ Class-Specific NMS (conf=0.25) ]                    |
|                                            |                                      |
|                                            v                                      |
|                             [ Waste Density & Geotagging ]                        |
|                                            |                                      |
|       +------------------------------------+--------------------------------+     |
|       |                                                                     |     |
|       v                                                                     v     |
|  [ FastAPI Edge Gateway ]                                           [ Supabase ]  |
|  - POST /v1/detect                                                  - Auth & RLS  |
|  - POST /v1/detect/batch                                            - PostgreSQL  |
|  - GET  /v1/health                                                  - Storage     |
|       |                                                                     |     |
|       +------------------------------------+--------------------------------+     |
|                                            |                                      |
|                                            v                                      |
|                             [ Citizen PWA & Driver Dispatch ]                     |
|                             - Geo-tracked Pickup Routing                          |
|                             - Performer Cleanup Verification                      |
|                             - Safai Coins Ledger Rewards                          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Waste Classification Taxonomy

SafaiOS classifies solid waste into 5 mutually exclusive, real-world municipal classes optimized for automated sorting, recycling stream segregation, and field deployment:

| Class ID | Class Label | Real-World Target Materials | Processing Stream | Typical Dimensions |
| :---: | :--- | :--- | :--- | :--- |
| **0** | `plastic_bottle` | PET water/soft-drink bottles, detergent containers, rigid plastics | Dry Recyclables (Plastic) | 10 cm - 35 cm |
| **1** | `plastic_wrapper_bag` | Single-use polythene bags, chip packets, snack wrappers, packaging films | Non-Recyclable / RDF | 5 cm - 50 cm |
| **2** | `paper_cardboard` | Corrugated boxes, packaging cartons, newspapers, beverage cups | Dry Recyclables (Paper) | 8 cm - 80 cm |
| **3** | `glass_bottle_container` | Glass beverage bottles, food jars, broken glass shards | Dry Recyclables (Glass) | 8 cm - 30 cm |
| **4** | `metal_can` | Aluminium soda cans, tin food cans, metal aerosol containers | Dry Recyclables (Metal) | 6 cm - 20 cm |

---

## 3. Computer Vision Inference Pipeline

### 3.1 Preprocessing and Letterbox Resizing
Raw camera frames of arbitrary aspect ratios (e.g. 1920x1080 or 3840x2160) are converted into deterministic square inputs for the YOLO11s detection backbone:
- Target resolution: **768x768 pixels**.
- Aspect ratio preservation with uniform padding (letterboxing using grey pad value `114`).
- Channel ordering: BGR to RGB conversion.
- Normalization: Floating point conversion to `[0.0, 1.0]`.

### 3.2 YOLO11s Detection Backbone
The detection engine is powered by an optimized YOLO11s backbone:
- Pre-trained weights fine-tuned on the curated **SafaiOS Dataset v10k**.
- Trained using specialized CoarseDropout and spatial augmentation techniques to prevent edge hallucination and maintain robustness under direct sunlight, shadows, and low-light urban environments.
- Anchor heads predict normalized bounding boxes `[xmin, ymin, xmax, ymax]` and 5-class probability distributions.

### 3.3 Postprocessing and Class-Specific NMS
Detections are filtered at a fixed operational threshold:
- **Operational Confidence Threshold**: `conf >= 0.25`.
- **Operational IoU Threshold**: `iou <= 0.60`.
- Class-specific Non-Maximum Suppression (NMS) prevents suppression of distinct items belonging to different classes that overlap in dense trash piles.

---

## 4. Backend and Data Coordination

The application layer leverages **Supabase PostgreSQL** with comprehensive Row Level Security (RLS) to enforce data integrity and user isolation:

1. **Incident Intake**:
   - Geotagged waste detections are logged with coordinates, estimated volume, and image storage references in the `incidents` table.
   - Storage bucket `incident-images` stores original evidence with private RLS access control.

2. **Automated Driver Dispatch**:
   - High-density clusters are assigned to certified municipal drivers in `driver_assignments`.
   - Drivers receive real-time updates and navigate optimized collection routes.

3. **Cleanup and Evidence Submission**:
   - Upon completing cleanup, drivers upload post-cleanup geotagged photos to the `cleanup_evidence` table and `cleanup-evidence` storage bucket.

4. **Cryptographic Verification and Rewards**:
   - Reporting citizens verify cleanup quality via `verification_decisions`.
   - Anti-tamper rules prevent drivers or performers from verifying their own work.
   - Once verified, the database trigger issues Safai Coins to the citizen wallet through an append-only ledger transaction.

---

## 5. Technology Stack Summary

- **Computer Vision**: PyTorch 2.x, Ultralytics YOLO11s, Albumentations, ONNX Runtime.
- **Edge API**: FastAPI, Starlette, Uvicorn, Pydantic v2.
- **Database & Storage**: PostgreSQL 15+, PostGIS, Supabase Auth, Supabase Storage.
- **Testing & Verification**: pytest (151 tests), pgTAP (24 tests), Node.js secret scanning.
