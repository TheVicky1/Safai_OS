# SafaiOS - Edge Detection API Specification

This document details the REST API endpoints, payload schemas, error formats, and performance expectations for the SafaiOS computer vision edge inference service.

---

## 1. Overview and Base URL

The SafaiOS inference service provides high-performance, low-latency object detection on edge devices (NVIDIA Jetson, edge gateways) and central GPU clusters.

- **Default Base URL**: `http://localhost:8000`
- **Protocol**: HTTP/1.1 and HTTP/2
- **Data Formats**: `multipart/form-data` for image ingestion; `application/json` for responses.

---

## 2. API Endpoints

### 2.1 Single Image Detection (`POST /v1/detect`)

Executes YOLO11s waste detection on a single uploaded image.

#### Request
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (Required): Binary image file (`image/jpeg`, `image/png`, `image/webp`). Max file size: 15 MB.
  - `confidence_threshold` (Optional, float): Minimum detection score (default: `0.25`, range: `[0.01, 1.0]`).
  - `iou_threshold` (Optional, float): NMS intersection-over-union threshold (default: `0.60`, range: `[0.01, 1.0]`).

#### Example Curl Command
```bash
curl -X POST "http://localhost:8000/v1/detect" \
  -F "file=@sample_waste.jpg" \
  -F "confidence_threshold=0.25"
```

#### Response (200 OK)
```json
{
  "status": "success",
  "num_detections": 2,
  "inference_time_ms": 11.4,
  "device": "cuda:0",
  "model_version": "safaios_yolo11s_v10k_img768",
  "detections": [
    {
      "class_id": 0,
      "class_name": "plastic_bottle",
      "confidence": 0.9412,
      "box": {
        "xmin": 0.1245,
        "ymin": 0.3412,
        "xmax": 0.2854,
        "ymax": 0.6521
      }
    },
    {
      "class_id": 1,
      "class_name": "plastic_wrapper_bag",
      "confidence": 0.8735,
      "box": {
        "xmin": 0.4512,
        "ymin": 0.5120,
        "xmax": 0.7812,
        "ymax": 0.8941
      }
    }
  ]
}
```

---

### 2.2 Batch Frame Detection (`POST /v1/detect/batch`)

Executes batched inference across multiple synchronized camera frames from municipal inspection vehicles.

#### Request
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `files` (Required): Multiple image files (up to 16 frames per request).

#### Response (200 OK)
```json
{
  "status": "success",
  "batch_size": 2,
  "total_detections": 4,
  "batch_inference_time_ms": 18.2,
  "results": [
    {
      "frame_index": 0,
      "num_detections": 2,
      "detections": [...]
    },
    {
      "frame_index": 1,
      "num_detections": 2,
      "detections": [...]
    }
  ]
}
```

---

### 2.3 Health Check (`GET /v1/health`)

Returns device compute status, loaded model checkpoint, and memory allocation.

#### Response (200 OK)
```json
{
  "status": "healthy",
  "service": "safaios-vision-engine",
  "version": "1.0.0",
  "device": {
    "type": "cuda",
    "name": "NVIDIA Jetson Orin Nano",
    "vram_allocated_mb": 412.5,
    "vram_total_mb": 7680.0
  },
  "model_loaded": true,
  "weights_checkpoint": "safaios_yolo11s_v10k_img768.pt"
}
```

---

## 3. Standard Error Responses

| HTTP Code | Reason | Example Response Body |
| :---: | :--- | :--- |
| **400** | Bad Request / Unsupported File Format | `{"status": "error", "message": "Unsupported media format. Expected JPEG, PNG, or WebP."}` |
| **413** | Payload Too Large | `{"status": "error", "message": "Uploaded file exceeds maximum limit of 15 MB."}` |
| **422** | Unprocessable Entity / Validation Error | `{"status": "error", "message": "confidence_threshold must be between 0.01 and 1.0."}` |
| **503** | Service Unavailable / Model Initializing | `{"status": "error", "message": "Vision engine is warming up. Retry in a few seconds."}` |

---

## 4. Latency and Performance Benchmarks

| Hardware Target | Execution Engine | Batch Size | Average Latency | Target FPS |
| :--- | :--- | :---: | :---: | :---: |
| **NVIDIA Jetson Orin Nano (8GB)** | TensorRT FP16 (768px) | 1 | **12 - 16 ms** | 60+ FPS |
| **NVIDIA RTX 4060 / T4** | PyTorch / CUDA FP16 | 4 | **6 - 9 ms** | 100+ FPS |
| **Intel Core i7-13700H** | OpenVINO / CPU FP32 | 1 | **45 - 65 ms** | 15 - 20 FPS |
