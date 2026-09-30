<div align="center">

VIGIL-AE Protocol

AI-Powered Traffic Surveillance & Verifiable Evidence

Real-time traffic monitoring that combines computer vision, ANPR/OCR, automated incident detection, blockchain verification and instant alerts.

<br>








<br>

GitHub Repository

</div>

Overview

VIGIL-AE Protocol turns a conventional surveillance camera into an intelligent traffic-monitoring system.

The platform combines live video with AI analysis to detect vehicles and monitored-zone events, integrate license-plate recognition, generate digital incident records, register evidence on-chain, and send notifications.

The project is designed as a functional prototype / MVP demonstrating the complete workflow from camera input to verifiable digital evidence.

The Problem

Traditional surveillance workflows often rely heavily on operators to continuously watch cameras, identify incidents, read plates and prepare reports.

This can create:

Delayed incident detection.

High dependence on manual monitoring.

Difficulty connecting video evidence with incident records.

Fragmented workflows between detection, reporting and verification.

Limited traceability of generated records.

VIGIL-AE addresses this by connecting the main steps into a single system.

The Solution

             LIVE CAMERA
                  │
                  ▼
        ┌──────────────────┐
        │  COMPUTER VISION  │
        │      YOLOv8      │
        └────────┬─────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
 Vehicle Detection    Zone Analysis
        │                 │
        └────────┬────────┘
                 ▼
              ANPR / OCR
                 │
                 ▼
          Incident Record
          ├── Vehicle
          ├── Plate
          ├── Time
          ├── Origin
          └── Evidence
                 │
        ┌────────┴────────┐
        ▼                 ▼
   Blockchain          WhatsApp
   Verification          Alert
        │                 │
        └────────┬────────┘
                 ▼
          VIGIL-AE DASHBOARD

Camera Architecture

VIGIL-AE exposes two visual perspectives from the same live camera input.

Camera 01 — Monitoring

Purpose: live supervision.

Original camera view.

No AI overlays.

Designed for fast visual monitoring.

Uses the raw camera frame.

Camera 01 — AI Analysis

Purpose: intelligent traffic analysis.

YOLOv8 vehicle detection.

Restricted-zone visualization.

Incident analysis.

ANPR/OCR workflow.

AI-generated overlays.

                    EZVIZ
                      │
                      ▼
                 LIVE FRAME
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
       MONITORING VIEW     AI ANALYSIS
        RAW / LIVE         YOLOv8 + Events
             │                 │
             │                 ▼
             │             ANPR / OCR
             │                 │
             │                 ▼
             │            Incident Logic
             │
             └───────────┬─────────────┘
                         ▼
                    DASHBOARD

Both views come from the same camera stream; the second view adds the AI processing layer.

Artificial Intelligence

YOLOv8

YOLOv8 is used for real-time vehicle detection.

The prototype focuses on:

Cars

Trucks

Motorcycles

Buses

Detections can be evaluated against predefined polygonal surveillance zones.

Restricted-Zone Monitoring

The system represents monitored road areas as polygons.

             ROAD
──────────────────────────────────

             🚗
              │
              ▼

       ┌──────────────────┐
       │  RESTRICTED ZONE │
       │                  │
       │       🚗         │
       │                  │
       └──────────────────┘
                  │
                  ▼
           Time threshold
                  │
                  ▼
        Potential incident

The prototype uses a configurable time threshold to identify vehicles that remain in a monitored area.

ANPR / OCR

VIGIL-AE integrates automatic license-plate recognition into the incident pipeline.

Workflow

Detect the vehicle.

Extract the vehicle region.

Focus on the relevant plate area.

Run OCR.

Associate the result with the vehicle.

Store the evidence with the incident record.

The OCR pipeline uses HyperLPR3.

Prototype note: when OCR does not obtain a reliable plate, the current demonstration may use a simulated value so the rest of the workflow can be demonstrated. Production deployments should replace this with validated OCR-only evidence.

Automated Incident Records

A detected event can generate a digital incident record containing fields such as:

Field

Example

Case ID

ACTA-2026-XXXXXXXXXX

Plate

ABC-1234

Vehicle

Auto

Infraction

Restricted Zone

Origin

Node 01

Date

2026-09-30

Time

12:15:42

Evidence

Captured image

Blockchain status

CONFIRMED

This record becomes the bridge between AI detection and verifiable evidence.

Blockchain Verification

VIGIL-AE integrates Web3 + Arbitrum Sepolia into the incident workflow.

Incident
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
Verifiable Record

The prototype tracks blockchain states such as:

NOT_SUBMITTED
BROADCASTING
CONFIRMED
FAILED
UNCONFIRMED

This allows the interface to distinguish between a transaction that was created, one that was broadcast, and one that has actually been confirmed on-chain.

WhatsApp Notifications

When an incident is generated, VIGIL-AE can send a WhatsApp notification through Twilio.

Example:

🚨 NEW INFRACTION REGISTERED

Case: ACTA-2026-XXXXXXXXXX
Plate: ABC-1234
Vehicle: Auto
Infraction: Restricted Zone
Origin: Node 01
Arbitrum Hash: 0x....

This enables the system to communicate incidents without requiring continuous dashboard supervision.

AI Copilot

The platform includes an AI-assisted operator interface.

The copilot can work with the surveillance data and explain information such as:

Incident records.

License plates.

Current surveillance statistics.

Blockchain status.

Example commands:

"Show the status of plate ABC123."

"Create an infraction for ABC123."

"Is the blockchain transaction confirmed?"

Real-Time Dashboard

The dashboard combines live video and operational metrics.

Monitoring

Live camera feed.

AI analysis feed.

Active vehicle detections.

Restricted-zone state.

Metrics

Total monitored vehicles.

Active vehicles.

Cars.

Trucks.

Motorcycles.

Buses.

Roadway blocked time.

Capacity-loss indicators.

Evidence

ANPR results.

Captured vehicle images.

Incident records.

Blockchain status.

Transaction hashes.

Technology Stack

Layer

Technologies

Frontend

React, Vite, JavaScript

Backend

Python, FastAPI

Computer Vision

YOLOv8, OpenCV, NumPy

ANPR / OCR

HyperLPR3

Video

EZVIZ HLS

Blockchain

Web3.py, Arbitrum Sepolia

Notifications

Twilio, WhatsApp

Deployment

GitHub, Railway

Architecture

┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│                                             │
│ React + Vite                                │
│                                             │
│ • Camera Monitoring                         │
│ • AI Analysis                               │
│ • Metrics                                   │
│ • Vehicle Classification                    │
│ • ANPR / OCR                                │
│ • Incident Records                          │
│ • AI Copilot                                │
└───────────────────────┬─────────────────────┘
                        │
                     REST API
                        │
                        ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                    │
│                                             │
│ FastAPI + Python                            │
│                                             │
│ • EZVIZ integration                         │
│ • YOLOv8                                    │
│ • OCR / ANPR                                │
│ • Incident detection                        │
│ • Blockchain integration                    │
│ • WhatsApp notifications                    │
│ • Statistics                                │
│ • AI Copilot API                            │
└──────────────┬───────────────────┬──────────┘
               │                   │
               ▼                   ▼
        ┌──────────────┐    ┌───────────────┐
        │ EZVIZ Camera │    │   Arbitrum    │
        │  HLS Stream  │    │    Sepolia    │
        └──────────────┘    └───────────────┘
               │
               ▼
           Live Input

               ┌─────────────────┐
               │ Twilio / WhatsApp│
               └─────────────────┘

Project Structure

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

API

Video

GET /video_feed_raw

Live monitoring stream without AI overlays.

GET /video_feed_1

AI-processed camera stream.

GET /video_feed_anpr

ANPR analysis stream.

Monitoring

GET /api/camera/status
GET /api/stats
GET /api/anpr/stats

Incidents

GET  /api/expedientes
POST /api/simular_multa
POST /api/focalizar_placa
POST /api/expedientes/{acta_id}/estado

AI Copilot

POST /api/chat

Environment Variables

Credentials and secrets must be supplied through environment variables.

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

Never commit API keys, access tokens, wallet private keys, or service credentials to GitHub.

Running Locally

Backend

cd backend
python -m venv venv

Windows

venv\Scripts\activate

Linux / macOS

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run:

python main.py

API:

http://localhost:8000

Swagger:

http://localhost:8000/docs

Frontend

cd frontend
npm install
npm run dev

Configure:

VITE_API_URL=http://localhost:8000

Deployment

The project can be deployed using GitHub + Railway.

GitHub
   │
   ▼
Railway
   │
   ▼
Docker
   │
   ▼
FastAPI
   ├── EZVIZ
   ├── YOLOv8
   ├── OCR
   ├── Blockchain
   └── Twilio

Prototype Status

The current prototype demonstrates an integrated surveillance workflow including:

✅ Live camera monitoring

✅ AI vehicle detection

✅ Vehicle classification

✅ Restricted-zone monitoring

✅ ANPR / OCR

✅ Evidence capture

✅ Incident generation

✅ Blockchain registration

✅ Blockchain status tracking

✅ WhatsApp alerts

✅ AI Copilot

✅ Real-time dashboard

Some demonstration-specific behavior, such as simulated plate values when OCR fails, should be replaced with validated production evidence before operational deployment.

Roadmap

Possible next steps include:

Multi-camera scaling.

Stronger HLS recovery.

GPU-accelerated inference.

Improved ANPR under difficult lighting.

Persistent database storage.

Multi-zone traffic analytics.

Advanced vehicle tracking.

Production authentication and authorization.

Integration with external traffic-management systems.

Why VIGIL-AE?

The core idea is simple:

Do more than watch the road — understand it, document it, and make the resulting record verifiable.

VIGIL-AE connects:

Camera + AI + ANPR + Incident Detection + Blockchain + Alerts

into one operational workflow.

Repository

VIGIL-AE Protocol

https://github.com/jfrank-code/VIGIL-AE-Protocol

License

This project is provided for research, experimentation, and prototype development purposes.

Before real-world deployment, applicable privacy, security, legal, and operational requirements should be evaluated.
