VIGIL-AE Protocol

AI-Powered Traffic Surveillance, Automated Incident Detection and Verifiable Evidence

VIGIL-AE Protocol is an AI-powered surveillance platform designed for Peru that combines real-time computer vision, automatic license plate recognition, incident detection, alerts, and Blockchain/Web3 to create secure, transparent, and traceable traffic evidence.

The platform transforms a conventional surveillance camera into an intelligent monitoring system capable of detecting vehicles, identifying potential traffic violations, generating digital incident records, and registering evidence in a verifiable blockchain workflow.

🚨 The Problem

Traffic surveillance systems commonly depend on human operators to continuously monitor cameras, identify incidents, read license plates, and generate reports.

This creates several challenges:

High dependence on manual monitoring.

Delayed detection of traffic incidents.

Difficulty identifying vehicles in real time.

Evidence scattered across different systems.

Limited traceability of generated reports.

Lack of a unified workflow between surveillance, AI analysis, notifications, and evidence verification.

In high-traffic environments, these limitations can reduce response speed and make it harder to preserve trustworthy evidence.

💡 The Solution

VIGIL-AE Protocol creates an intelligent surveillance layer on top of conventional camera infrastructure.

Instead of simply displaying video, the platform continuously analyzes the scene and connects multiple technologies into a single workflow:

Live Camera
     │
     ▼
Computer Vision
     │
     ├── Vehicle Detection
     ├── Vehicle Classification
     ├── Restricted-Zone Detection
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
     ├── License Plate
     ├── Time
     └── Location / Origin
     │
     ├───────────────┐
     ▼               ▼
Blockchain        WhatsApp
Verification      Alert
     │               │
     └───────┬───────┘
             ▼
        VIGIL-AE Dashboard

This architecture allows the system to move from surveillance → detection → evidence → verification → notification in a single workflow.

🎥 Dual Camera Visualization

VIGIL-AE provides two simultaneous visual perspectives from the same live camera input.

Camera 01 — Monitoring

Displays the live camera feed without AI overlays.

Purpose:

Real-time visual supervision.

Original camera perspective.

Continuous monitoring.

Easy comparison between the real scene and the AI interpretation.

Camera 01 — AI Analysis

Displays the live scene together with the intelligent analysis layer.

Purpose:

Vehicle detection.

Restricted-zone monitoring.

AI annotations.

Incident visualization.

ANPR/OCR integration.

Conceptually:

                    EZVIZ STREAM
                         │
                         ▼
                    LIVE FRAME
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       MONITORING VIEW          AI ANALYSIS
        Live / Raw Feed         YOLOv8 Processing
              │                     │
              ▼                     ▼
       Human Supervision      Vehicle Detection
                                    │
                                    ▼
                                  ANPR
                                    │
                                    ▼
                                  OCR
                                    │
                                    ▼
                              Incident Logic

Both views originate from the same camera stream.

🤖 Artificial Intelligence

YOLOv8

VIGIL-AE uses YOLOv8 for real-time object detection.

The system focuses on relevant traffic categories such as:

Cars

Motorcycles

Buses

Trucks

The detected vehicles are analyzed according to predefined surveillance zones.

🚧 Intelligent Restricted-Zone Detection

The platform defines polygonal regions representing monitored traffic areas.

When a vehicle enters a monitored restricted zone, VIGIL-AE evaluates its presence and monitors the situation over time.

Example:

             ROAD
────────────────────────────────

             Vehicle
                🚗
                 │
                 ▼

        ┌───────────────────┐
        │  RESTRICTED ZONE  │
        │                   │
        │       🚗          │
        │                   │
        └───────────────────┘

                │
                ▼
          Time Threshold
                │
                ▼
       Potential Infraction

This allows the platform to distinguish between simple presence and situations that remain inside a restricted area beyond a configured time threshold.

🔎 ANPR / OCR

VIGIL-AE integrates license plate recognition into the incident workflow.

The system can:

Detect a vehicle.

Crop the vehicle region.

Focus on the relevant license-plate area.

Run OCR.

Associate the result with the detected vehicle.

Store the resulting evidence in the incident record.

The OCR pipeline uses HyperLPR3.

When a plate cannot be reliably read, the current prototype may use a simulated demonstration plate so that the rest of the workflow can still be demonstrated.

For production deployment, simulated values should be disabled and replaced by validated OCR-only evidence.

📋 Automated Incident Records

When the system determines that a monitored situation meets the configured infraction conditions, VIGIL-AE can generate an incident record containing information such as:

Case ID

License plate

Vehicle type

Infraction type

Origin

Date

Time

Evidence image

Blockchain status

Blockchain transaction hash

Example:

{
  "actaId": "ACTA-2026-XXXXXXXXXX",
  "placa": "ABC-1234",
  "infraccion": "Restricted Zone",
  "vehiculo": "Auto",
  "origen": "Node 01 (South Shoulder)",
  "estado": "REGISTRADA"
}

⛓️ Blockchain / Web3

VIGIL-AE integrates blockchain into the evidence workflow.

The prototype uses:

Web3

Arbitrum Sepolia

Transaction-based evidence registration

Blockchain is used to create a verifiable record of generated incidents.

The workflow is conceptually:

Incident Detected
       │
       ▼
Digital Record
       │
       ▼
Blockchain Transaction
       │
       ▼
Transaction Hash
       │
       ▼
Confirmation
       │
       ▼
Verifiable Evidence

The system tracks different blockchain states, including:

NOT_SUBMITTED

BROADCASTING

CONFIRMED

FAILED

UNCONFIRMED

This prevents an incident from being incorrectly presented as confirmed before the blockchain transaction has actually been verified.

📲 WhatsApp Alerts

VIGIL-AE can send automated WhatsApp notifications when an incident is generated.

Example notification:

🚨 NEW INFRACTION REGISTERED

Case: ACTA-2026-XXXXXXXXXX
Plate: ABC-1234
Vehicle: Auto
Infraction: Restricted Zone
Origin: Node 01
Arbitrum Hash: 0x....

This allows the surveillance system to communicate incidents without requiring an operator to constantly monitor the dashboard.

💬 AI Copilot / Chat Interface

The platform also includes an AI-assisted chat interface.

The copilot can interact with the incident system and provide information about:

Detected incidents.

License plates.

Incident records.

Blockchain status.

Current surveillance statistics.

It can also trigger supported incident workflows from natural-language commands.

Example:

"Show me the status of plate ABC123."

"Create an infraction for ABC123."

"Is the blockchain transaction confirmed?"

📊 Real-Time Dashboard

VIGIL-AE includes a monitoring dashboard with real-time operational metrics.

The dashboard can display:

Total monitored vehicles.

Active vehicles.

Cars.

Trucks.

Motorcycles.

Buses.

Restricted-zone activity.

Roadway blocked time.

Capacity loss indicators.

Incident records.

ANPR information.

Blockchain status.

The dashboard is designed to provide both visual monitoring and operational intelligence.

🏗️ Architecture

┌──────────────────────────────────────────────┐
│                   FRONTEND                   │
│                                              │
│ React + Vite                                 │
│                                              │
│ ├── Camera Monitoring                        │
│ ├── AI Analysis                              │
│ ├── Metrics                                  │
│ ├── Vehicle Classification                   │
│ ├── OCR / ANPR                               │
│ ├── Incident Records                         │
│ └── AI Copilot                               │
└───────────────────────┬──────────────────────┘
                        │
                        │ HTTP / REST
                        ▼
┌──────────────────────────────────────────────┐
│                   BACKEND                    │
│                                              │
│ FastAPI + Python                             │
│                                              │
│ ├── EZVIZ Stream Integration                 │
│ ├── YOLOv8                                   │
│ ├── OCR / HyperLPR3                          │
│ ├── Incident Detection                       │
│ ├── Blockchain Integration                   │
│ ├── WhatsApp Notifications                   │
│ ├── Statistics                               │
│ └── AI Copilot API                           │
└───────────────┬─────────────────┬────────────┘
                │                 │
                ▼                 ▼
        ┌──────────────┐   ┌───────────────┐
        │ EZVIZ Camera │   │ Arbitrum      │
        │ HLS Stream   │   │ Sepolia       │
        └──────────────┘   └───────────────┘
                │
                ▼
          Live Video Input

                ┌─────────────────┐
                │ Twilio / WhatsApp│
                └─────────────────┘

🛠️ Technology Stack

Backend

Python

FastAPI

OpenCV

NumPy

Ultralytics YOLOv8

HyperLPR3

Requests

Web3.py

Pydantic

Frontend

React

Vite

JavaScript

REST API integration

Computer Vision

YOLOv8

OpenCV

HLS video processing

Vehicle classification

Polygon-based zone detection

OCR / ANPR

HyperLPR3

Vehicle-region cropping

License-plate extraction

Blockchain

Web3

Arbitrum Sepolia

Notifications

Twilio

WhatsApp

Deployment

GitHub

Railway

📁 Project Structure

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
    │
    ├── package.json
    └── vite.config.js

🔌 Main API Endpoints

Live video

GET /video_feed_1

AI-processed surveillance stream.

ANPR video

GET /video_feed_anpr

ANPR analysis stream.

Camera status

GET /api/camera/status

Returns technical camera and streaming information.

Statistics

GET /api/stats

Returns real-time surveillance metrics and incident data.

ANPR statistics

GET /api/anpr/stats

Returns ANPR activity statistics.

Incident records

GET /api/expedientes

Returns registered incident records.

Simulate incident

POST /api/simular_multa

Creates a test incident.

Plate focusing

POST /api/focalizar_placa

Sets the plate currently being monitored.

Change incident status

POST /api/expedientes/{acta_id}/estado

Updates the status of an incident.

AI Copilot

POST /api/chat

Natural-language interaction with the surveillance system.

⚙️ Environment Variables

The project uses environment variables for sensitive credentials and external services.

Typical configuration includes:

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

Never commit API keys, private keys, access tokens, or other credentials to GitHub.

🚀 Local Development

1. Clone the repository

git clone https://github.com/jfrank-code/VIGIL-AE-Protocol.git
cd VIGIL-AE-Protocol

2. Backend

cd backend

python -m venv venv

Windows

venv\Scripts\activate

Linux / macOS

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Configure the environment variables and start FastAPI:

python main.py

Backend:

http://localhost:8000

Swagger documentation:

http://localhost:8000/docs

💻 Frontend

From the frontend directory:

npm install
npm run dev

Configure the backend URL through:

VITE_API_URL=

Example:

VITE_API_URL=http://localhost:8000

☁️ Deployment

The backend can be deployed using Docker-compatible cloud infrastructure such as Railway.

General deployment flow:

GitHub
   │
   ▼
Railway
   │
   ▼
Docker Build
   │
   ▼
FastAPI Backend
   │
   ├── EZVIZ
   ├── YOLO
   ├── OCR
   ├── Blockchain
   └── Twilio

The frontend can be deployed separately and configured with the backend API URL.

🔐 Security Considerations

Because VIGIL-AE integrates cameras, blockchain wallets, APIs, and messaging services, secrets must always be stored outside the source code.

Never commit:

APP_SECRET
ACCESS_TOKEN
PRIVATE_KEY
TWILIO_AUTH_TOKEN

Use environment variables or a secure secrets manager.

🧪 Prototype Status

VIGIL-AE is currently a functional prototype / MVP designed to demonstrate the complete surveillance workflow.

The system integrates:

✅ Live surveillance
✅ AI vehicle detection
✅ Vehicle classification
✅ Restricted-zone detection
✅ ANPR / OCR
✅ Incident generation
✅ Evidence capture
✅ Blockchain registration
✅ Blockchain status tracking
✅ WhatsApp alerts
✅ AI Copilot
✅ Real-time dashboard

Some components, such as simulated license plates used when OCR does not obtain a valid reading, are intended for demonstration and should be replaced with validated production data sources before operational deployment.

🎯 Future Improvements

Potential future development includes:

Multi-camera scaling.

GPU-accelerated inference.

More robust HLS stream recovery.

Improved license plate recognition under difficult lighting.

Multi-zone traffic analysis.

Centralized persistent database storage.

Advanced vehicle tracking.

Event prioritization.

Government-system integrations.

Mobile operator application.

Expanded blockchain evidence schemas.

Production-grade authentication and authorization.

🌎 Impact

VIGIL-AE is designed around a practical challenge faced by modern cities: transforming large volumes of surveillance video into actionable and traceable information.

The system combines:

Computer Vision
       +
ANPR / OCR
       +
Automated Incident Detection
       +
Blockchain
       +
Real-Time Alerts
       +
Operational Dashboard

The result is a surveillance platform capable of moving from observation to verifiable digital evidence.

📌 Project

VIGIL-AE Protocol

AI-powered surveillance platform for traffic monitoring, automated incident detection, ANPR, alerts, and verifiable blockchain evidence.

GitHub:

https://github.com/jfrank-code/VIGIL-AE-Protocol

📄 License

This project is provided for research, experimentation, and prototype development purposes.

Before deploying the system in a real-world surveillance environment, appropriate legal, privacy, security, and operational requirements should be evaluated.
