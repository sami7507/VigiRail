# 🚆 RailGuard AI — Predictive Maintenance System
### Smart India Hackathon | Indian Railways | Smart Automation Track

## Quick Start — Windows

### Terminal 1 (Backend):
```cmd
cd railguard-ai\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Terminal 2 (Frontend):
```cmd
cd railguard-ai\frontend
npm install
npm start
```

## Login Credentials
| Username | Password | Role |
|---|---|---|
| admin | admin123 | Admin (full access) |
| engineer | eng456 | Engineer (ML + simulate) |
| operator | ops789 | Operator (status only) |
| inspector | insp321 | Inspector (read-only + reports) |

## Tech Stack
- Backend: Python FastAPI + scikit-learn Random Forest
- Frontend: React 18 + Chart.js
- Auth: JWT (Python stdlib, no jose needed)
- ML: RandomForest, 100 trees, RDSO-calibrated thresholds

See full README inside the zip for complete documentation.
