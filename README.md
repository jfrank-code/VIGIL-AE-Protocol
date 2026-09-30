# VIGIL-AE Protocol

## **AI-Powered Traffic Surveillance & Verifiable Evidence**

**VIGIL-AE Protocol** is an AI-powered traffic surveillance platform designed to transform a conventional security camera into an intelligent monitoring system. It combines **real-time computer vision, vehicle classification, ANPR/OCR, automated incident detection, blockchain verification, WhatsApp alerts, and an operational dashboard** into a single workflow.

The core idea is to move beyond simply watching traffic. VIGIL-AE continuously analyzes the scene, detects relevant vehicles and monitored-zone events, extracts available license-plate information, creates a structured incident record, and connects that record to a verifiable blockchain transaction and an alerting workflow.

---

## **🚨 Problem**

Traffic surveillance still relies heavily on operators to watch video feeds, identify relevant events, read license plates, collect evidence, and prepare reports. This becomes difficult when several cameras or large traffic flows must be monitored at the same time.

The result can be **delayed incident detection, high dependence on manual monitoring, fragmented evidence, and limited traceability between what happened on camera and the final incident record**. A surveillance platform should not only show what is happening; it should help interpret the scene, organize the evidence, and make the resulting record easier to verify.

---

## **💡 Solution**

VIGIL-AE adds an intelligent analysis layer to a live camera stream. The system receives the video, detects vehicles with YOLOv8, evaluates predefined monitored zones, and triggers the incident workflow when the configured conditions are met. The resulting record can include the vehicle type, plate information, time, origin, evidence image, and blockchain status.

```text
Live Camera
     │
     ▼
YOLOv8 Vehicle Detection
     │
     ├── Vehicle Classification
     ├── Restricted-Zone Analysis
     └── Incident Monitoring
     │
     ▼
ANPR / OCR
     │
     ▼
Incident Record
     │
     ├── Evidence
     ├── Vehicle
     ├── Plate
     ├── Time
     └── Origin
     │
     ├───────────────┐
     ▼               ▼
Blockchain        WhatsApp
Verification       Alert
     │
     ▼
VIGIL-AE Dashboard
```

---

## **🎥 Dual Camera Visualization**

VIGIL-AE provides two visual perspectives from the same camera input. The first view is dedicated to **live monitoring**, showing the camera feed without AI overlays. The second view is dedicated to **AI analysis**, showing the same live scene together with the YOLOv8 and incident-analysis layer.

This separation makes the system easier to understand operationally: one panel represents what the camera is seeing, while the other represents what the intelligent system is extracting from that scene.

| **Camera View** | **Purpose** |
|---|---|
| **Camera 01 — Monitoring** | Live camera supervision without AI overlays. |
| **Camera 01 — AI Analysis** | Vehicle detection, monitored zones, incident analysis and AI overlays. |

Both views originate from the same live camera stream; the second view adds the processing layer.

---

## **🤖 AI & Computer Vision**

### **YOLOv8 Vehicle Detection**

VIGIL-AE uses **YOLOv8** to detect relevant traffic objects in the live scene. The current prototype focuses on **cars, trucks, motorcycles and buses**. Detected objects can then be evaluated according to predefined polygonal surveillance areas.

### **🚧 Restricted-Zone Monitoring**

The system represents monitored road areas as polygonal regions. When a detected vehicle enters one of these regions, VIGIL-AE tracks the situation over time. A configurable time threshold can then be used to distinguish simple presence from a potential incident.

```text
                 ROAD
────────────────────────────────────

                    🚗
                     │
                     ▼

             ┌────────────────┐
             │ RESTRICTED ZONE │
             │                │
             │       🚗       │
             │                │
             └────────────────┘
                     │
                     ▼
               Time Threshold
                     │
                     ▼
              Potential Event
```

This approach allows the system to combine **spatial information + object detection + time** instead of treating every detected vehicle as an incident.

---

## **🔎 ANPR / OCR**

VIGIL-AE integrates **Automatic Number Plate Recognition (ANPR)** into the incident workflow. Once a vehicle is detected, the system can crop the relevant vehicle region, focus on the plate area, run OCR, and associate the result with the corresponding event.

The prototype uses **HyperLPR3** as part of the OCR pipeline.

The workflow is:

```text
Vehicle Detection
      ↓
Vehicle Crop
      ↓
Plate Region
      ↓
OCR
      ↓
Plate Result
      ↓
Incident Record
```

> **Prototype note:** when OCR does not obtain a reliable plate, the current demonstration may use a simulated value so that the rest of the workflow can still be demonstrated. Production deployment should use validated OCR evidence only.

---

## **📋 Automated Incident Records**

When an event meets the configured conditions, VIGIL-AE generates a structured incident record. The record can contain the **case ID, license plate, vehicle type, infraction type, origin, date, time, evidence image, blockchain status, and transaction hash**.

Example:

```json
{
  "actaId": "ACTA-2026-XXXXXXXXXX",
  "placa": "ABC-1234",
  "infraccion": "Restricted Zone",
  "vehiculo": "Auto",
  "origen": "Node 01",
  "estado": "REGISTRADA"
}
```

This record acts as the bridge between **what the camera detected** and the evidence that is later shown to an operator or user.

---

## **⛓️ Blockchain & Verifiable Evidence**

The prototype integrates **Web3 and Arbitrum Sepolia** to register incident information through blockchain transactions.

The purpose is not to replace the incident system with a blockchain database, but to add a **verifiable on-chain reference** to the event workflow.

```text
Incident Detected
       ↓
Digital Incident Record
       ↓
Blockchain Transaction
       ↓
Transaction Hash
       ↓
Confirmation
       ↓
Verifiable Record
```

VIGIL-AE distinguishes between transaction states such as:

`NOT_SUBMITTED` · `BROADCASTING` · `CONFIRMED` · `FAILED` · `UNCONFIRMED`

This allows the interface to communicate whether a transaction was only created, broadcast to the network, or actually confirmed.

---

## **📲 WhatsApp Alerts**

VIGIL-AE can send incident notifications through **Twilio + WhatsApp**. The message can include the case number, vehicle, license plate, infraction, origin, and blockchain transaction hash.

```text
🚨 NEW INFRACTION REGISTERED

Case: ACTA-2026-XXXXXXXXXX
Plate: ABC-1234
Vehicle: Auto
Infraction: Restricted Zone
Origin: Node 01
Arbitrum Hash: 0x....
```

This provides a direct notification channel without requiring an operator to continuously watch the dashboard.

---

## **💬 AI Copilot**

The platform also includes an **AI-assisted operator interface** that can interact with the surveillance data and explain operational information in natural language.

Examples:

```text
"Show the status of plate ABC123."

"Create an infraction for ABC123."

"Is the blockchain transaction confirmed?"
```

The copilot can work with current statistics, incident records, plate information, and blockchain status exposed by the backend.

---

## **📊 Real-Time Dashboard**

The VIGIL-AE dashboard combines the visual layer with operational metrics and evidence.

The interface can present **live monitoring, AI analysis, vehicle counts, active detections, restricted-zone status, roadway blocked time, capacity-loss indicators, ANPR information, incident records, and blockchain status**.

The objective is to give the operator a single place to understand both the current traffic situation and the digital evidence generated by the system.

---

## **🏗️ System Architecture**

```text
┌───────────────────────────────────────────────┐
│                  FRONTEND                    │
│               React + Vite                   │
│                                               │
│ Camera Monitoring • AI Analysis • Metrics    │
│ Vehicle Classification • ANPR • Records      │
│ AI Copilot                                   │
└────────────────────────┬──────────────────────┘
                         │
                       REST
                         │
                         ▼
┌───────────────────────────────────────────────┐
│                  BACKEND                     │
│                 FastAPI                     │
│                                               │
│ EZVIZ • YOLOv8 • OCR • Incidents             │
│ Blockchain • WhatsApp • Statistics           │
│ AI Copilot                                   │
└───────────────┬──────────────────┬────────────┘
                │                  │
                ▼                  ▼
        ┌───────────────┐   ┌────────────────┐
        │ EZVIZ Camera  │   │ Arbitrum       │
        │ HLS Stream    │   │ Sepolia        │
        └───────────────┘   └────────────────┘
                │
                ▼
           Live Video

                    ┌──────────────────┐
                    │ Twilio / WhatsApp│
                    └──────────────────┘
```

---

## **🛠️ Technology Stack**

| **Layer** | **Technology** |
|---|---|
| **Frontend** | React, Vite, JavaScript |
| **Backend** | Python, FastAPI |
| **Computer Vision** | YOLOv8, OpenCV, NumPy |
| **ANPR / OCR** | HyperLPR3 |
| **Video** | EZVIZ HLS |
| **Blockchain** | Web3.py, Arbitrum Sepolia |
| **Notifications** | Twilio, WhatsApp |
| **Deployment** | GitHub, Railway |

---

## **📁 Project Structure**

```text
VIGIL-AE-Protocol/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── anpr_service.py
│   ├── blockchain_service.py
│   │
│   ├── services/
│   │   ├── vision_services.py
│   │   ├── ocr_service.py
│   │   ├── chatbot_service.py
│   │   └── twilio_services.py
│   │
│   ├── yolov8n.pt
│   ├── trafico.mp4
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── config/
    │   └── ...
    ├── package.json
    └── vite.config.js
```

---

## **🔌 Main API Endpoints**

### **Live Video**

```http
GET /video_feed_raw
GET /video_feed_1
GET /video_feed_anpr
```

`/video_feed_raw` serves the monitoring view without AI overlays, while `/video_feed_1` serves the AI-processed camera view. `/video_feed_anpr` provides the ANPR analysis stream.

### **Monitoring**

```http
GET /api/camera/status
GET /api/stats
GET /api/anpr/stats
```

These endpoints expose camera status, operational statistics and ANPR metrics.

### **Incident Management**

```http
GET  /api/expedientes
POST /api/simular_multa
POST /api/focalizar_placa
POST /api/expedientes/{acta_id}/estado
```

### **AI Copilot**

```http
POST /api/chat
```

---

## **⚙️ Environment Variables**

Sensitive credentials are provided through environment variables.

```text
ACCESS_TOKEN=
APP_KEY=
APP_SECRET=

SERIAL_CAMARA=
EZVIZ_API_URL=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_WHATSAPP_TO=

WEB3_RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=
```

> **Never commit API keys, access tokens, wallet private keys or service credentials to GitHub.**

---

## **🚀 Run Locally**

### **Backend**

```bash
cd backend
python -m venv venv
```

**Windows:**

```powershell
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
python main.py
```

FastAPI:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

### **Frontend**

```bash
cd frontend
npm install
npm run dev
```

Configure the backend URL:

```text
VITE_API_URL=http://localhost:8000
```

---

## **☁️ Deployment**

The project is structured for deployment through **GitHub + Railway**.

```text
GitHub
   ↓
Railway
   ↓
Docker Build
   ↓
FastAPI
   ├── EZVIZ
   ├── YOLOv8
   ├── OCR
   ├── Blockchain
   └── Twilio
```

---

## **🧪 Prototype Status**

VIGIL-AE is a **functional prototype / MVP** demonstrating an integrated surveillance workflow.

Current capabilities include:

- ✅ Live camera monitoring
- ✅ AI vehicle detection
- ✅ Vehicle classification
- ✅ Restricted-zone monitoring
- ✅ ANPR / OCR
- ✅ Evidence capture
- ✅ Automated incident records
- ✅ Blockchain registration
- ✅ Blockchain status tracking
- ✅ WhatsApp alerts
- ✅ AI Copilot
- ✅ Real-time dashboard

Prototype-specific behaviors, such as simulated plate values used when OCR fails, should be replaced with validated production evidence before operational deployment.

---

## **🔭 Roadmap**

Future development can extend the platform with **multi-camera scaling, GPU acceleration, more robust HLS recovery, stronger ANPR under difficult lighting, persistent databases, multi-zone analytics, advanced vehicle tracking, production authentication, and integration with external traffic-management systems**.

---

## **🌎 Project Vision**

The goal of VIGIL-AE is to connect the complete chain:

**Camera → AI → Detection → Evidence → Verification → Alert**

Instead of leaving surveillance video as isolated footage, the platform turns it into **structured, actionable and verifiable digital evidence**.

---

## **📌 Repository**

**VIGIL-AE Protocol**

https://github.com/jfrank-code/VIGIL-AE-Protocol

---

## **📄 License**

This project is provided for research, experimentation and prototype development purposes.

Before real-world deployment, applicable **privacy, security, legal and operational requirements** should be evaluated.

