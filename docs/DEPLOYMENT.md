# SafaiOS - Production Deployment and Hardware Runbook

This runbook guides production deployment of the SafaiOS YOLO11s computer vision model and edge inference service across embedded devices, inspection vehicles, and centralized GPU servers.

---

## 1. Supported Hardware Targets

| Tier | Hardware Architecture | Recommended Format | Batch Size | Expected Latency | Target Throughput |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Tier 1** | NVIDIA Jetson Orin Nano / AGX Orin | TensorRT 10.x FP16 Engine | 1 | **12 - 16 ms** | 60+ FPS |
| **Tier 2** | NVIDIA RTX 4060 / T4 / L4 Cloud GPU | ONNX Runtime (CUDA Execution) | 4 - 8 | **6 - 9 ms** | 100+ FPS |
| **Tier 3** | x86-64 CPU / Intel Core i7 / AMD Ryzen | OpenVINO / ONNX CPU FP32 | 1 | **45 - 65 ms** | 15 - 20 FPS |

---

## 2. Model Export Pipeline

The trained SafaiOS YOLO11s PyTorch checkpoint (`.pt`) must be exported into optimized runtime formats for low-latency field execution.

### 2.1 Export to ONNX FP16
```bash
python -m src.export.exporter \
  --weights weights/best.pt \
  --format onnx \
  --imgsz 768 \
  --half \
  --opset 17
```
This produces `weights/best.onnx` optimized for TensorRT and ONNX Runtime.

### 2.2 Serialize to TensorRT Engine (Jetson / NVIDIA)
On the target NVIDIA Jetson device:
```bash
trtexec \
  --onnx=weights/best.onnx \
  --saveEngine=weights/best.engine \
  --fp16 \
  --inputIOFormats=fp16:chw \
  --outputIOFormats=fp16:chw
```

---

## 3. Systemd Service Deployment (Edge Linux)

For edge cameras, civic kiosks, and municipal vehicle mounted computers running Ubuntu Linux, configure SafaiOS as a self-healing systemd daemon.

### 3.1 Create Service Unit File
Create `/etc/systemd/system/safaios-vision.service`:

```ini
[Unit]
Description=SafaiOS Realtime Waste Detection Vision Service
After=network.target

[Service]
Type=simple
User=safai
WorkingDirectory=/opt/safaios
Environment="PATH=/opt/safaios/.venv/bin:/usr/local/cuda/bin:/usr/bin"
Environment="MODEL_PATH=/opt/safaios/weights/best.engine"
Environment="CONFIDENCE_THRESHOLD=0.25"
Environment="IOU_THRESHOLD=0.60"
ExecStart=/opt/safaios/.venv/bin/uvicorn src.api.server:app --host 0.0.0.0 --port 8000 --workers 1
Restart=always
RestartSec=5s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 3.2 Enable and Start the Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable safaios-vision.service
sudo systemctl start safaios-vision.service
sudo systemctl status safaios-vision.service
```

---

## 4. Docker Container Deployment

For cloud clusters or municipal central processing units:

### 4.1 Dockerfile
```dockerfile
FROM nvcr.io/nvidia/pytorch:24.01-py3

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN pip install --no-cache-dir -e .

EXPOSE 8000

CMD ["uvicorn", "src.api.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4.2 Build and Run
```bash
docker build -t safaios-vision:latest .
docker run --gpus all -d -p 8000:8000 --name safaios-vision safaios-vision:latest
```

---

## 5. Health Monitoring and Telemetry

The service exposes Prometheus metrics and JSON health checks:
- **Health Check**: `GET http://localhost:8000/v1/health`
- **System Metrics**: `GET http://localhost:8000/v1/metrics`
- **Log Monitoring**: `journalctl -u safaios-vision.service -f`
