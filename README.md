<div align="center">

<img src="https://img.shields.io/badge/Smart%20India%20Hackathon-2024-orange?style=for-the-badge&logo=train&logoColor=white" />
<img src="https://img.shields.io/badge/Indian%20Railways-Predictive%20Maintenance-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Track-Smart%20Automation-green?style=for-the-badge" />

# 🚆 RailGuard

### Predictive Maintenance System for Indian Railways

*Leveraging Machine Learning to prevent failures before they happen — keeping trains on track and passengers safe.*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-reference) • [Screenshots](#-screenshots) • [Team](#-team)

</div>

---

## 📌 Overview

**RailGuard AI** is an intelligent predictive maintenance platform built for Indian Railways under the **Smart India Hackathon — Smart Automation Track**. It uses a Random Forest ML model (calibrated to RDSO standards) to analyze sensor data in real time and predict component failures before they occur — reducing downtime, improving safety, and cutting maintenance costs.

> **Mission:** Shift Indian Railways from reactive to proactive maintenance.

---

## ✨ Features

- 🤖 **ML-Powered Predictions** — Random Forest model with 100 estimators, trained on RDSO-calibrated thresholds
- 📊 **Real-Time Dashboard** — Live charts and component health monitoring via Chart.js
- 🔐 **Role-Based Access Control** — Four distinct user roles with JWT authentication
- 🧪 **Failure Simulation Mode** — Engineers can simulate fault scenarios for testing
- 📄 **Automated Reports** — Inspector-grade maintenance and inspection reports
- ⚡ **Fast REST API** — FastAPI backend with async support and auto-generated Swagger docs

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.x · FastAPI · Uvicorn |
| **Machine Learning** | scikit-learn · Random Forest (100 trees) · RDSO-calibrated thresholds |
| **Frontend** | React 18 · Chart.js |
| **Authentication** | JWT (Python stdlib — no external jose dependency) |
| **Dev Tools** | Python venv · npm |

---

## 🚀 Quick Start

> **Prerequisites:** Python 3.8+, Node.js 16+, npm

### 1. Clone the Repository

```bash
git clone https://github.com/samiself07/railguard-ai.git
cd railguard-ai
```

### 2. Start the Backend

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**  
Swagger API docs at: **http://localhost:8000/docs**

### 3. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend will be live at: **http://localhost:3000**

---

## 🔑 Login Credentials

| Username | Password | Role | Access Level |
|---|---|---|---|
| `admin` | `admin123` | **Admin** | Full system access |
| `engineer` | `eng456` | **Engineer** | ML predictions + failure simulation |
| `operator` | `ops789` | **Operator** | Status monitoring only |
| `inspector` | `insp321` | **Inspector** | Read-only + report generation |

---

## 📁 Project Structure

```
railguard-ai/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── auth/            # JWT authentication
│   │   ├── models/          # ML model loading & inference
│   │   └── routes/          # API route handlers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components
│   │   ├── pages/           # Dashboard, Reports, Simulation
│   │   └── App.js
│   └── package.json
└── README.md
```

---

## 🔌 API Reference

Once the backend is running, visit **http://localhost:8000/docs** for the full interactive Swagger UI.

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Get JWT token |
| `GET` | `/api/status` | Component health status |
| `POST` | `/api/predict` | Run ML prediction on sensor data |
| `GET` | `/api/reports` | Fetch maintenance reports |
| `POST` | `/api/simulate` | Trigger failure simulation (Engineer+) |

---

## 🧠 ML Model Details

- **Algorithm:** Random Forest Classifier
- **Estimators:** 100 decision trees
- **Calibration:** RDSO (Research Designs & Standards Organisation) thresholds
- **Input:** Sensor readings (vibration, temperature, pressure, etc.)
- **Output:** Failure probability + component health classification

---

## 📸 Screenshots

> *Add screenshots of your dashboard, prediction results, and reports here.*

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

```bash
git checkout -b feature/your-feature-name
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sami** — [github.com/samiself07](https://github.com/sami7507)

---

<div align="center">

Built with ❤️ for **Smart India Hackathon** · Powering the future of Indian Railways 🇮🇳

</div>
