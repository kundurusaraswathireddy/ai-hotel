# 🏨 HotelGuard AI - Autonomous Hotel Cancellation Intelligence

**HotelGuard AI** is a production-grade machine learning platform designed to predict, diagnose, and mitigate hotel booking cancellations in real time. It combines an optimized LightGBM champion ML pipeline with a high-performance FastAPI backend and a modern React / TypeScript analytics dashboard.

---

## ✨ Features & Capabilities

- **🎯 Real-Time Risk Scoring**: Sub-millisecond booking cancellation risk inference with probability scoring and risk tiering (Low, Moderate, High, Critical).
- **🔬 Cancellation DNA & Signatures**: Uncovers behavioral patterns and risk clusters across guest demographics, market segments, and booking channels.
- **⚡ What-If Scenario Simulator**: Interactive scenario testing to simulate how ADR, deposit type, lead time, and room assignments influence cancellation probabilities.
- **🔄 Smart Waitlist & Dynamic Reallocation**: Matches high-risk potential cancellations with waitlisted guests to minimize revenue loss and prevent room inventory spoilage.
- **🌐 Risk Topology & Stress Testing**: Simulates market shocks, country-level disruptions, and segment anomalies across the booking portfolio.
- **📊 Model Arena & Registry**: Tracks model benchmarks, ROC-AUC (0.9442), Recall (0.9727), PR-AUC (0.9188), and threshold optimization curves.
- **🤖 Copilot AI Assistant**: Natural language query engine for hotel operational intelligence.

---

## 🛠️ Architecture & Tech Stack

```
hotelguard-ai/
├── backend/            # FastAPI ML REST API
│   ├── app.py          # API routes, inference engine & SPA static server
│   ├── requirements.txt# Python dependencies
│   └── train_pipeline.py# End-to-end ML training & validation pipeline
├── frontend/           # React 18 + Vite + TypeScript dashboard
│   ├── src/            # Components, pages, and API client
│   └── package.json    # Frontend dependencies
├── models/             # Serialized ML artifacts & metadata
│   ├── hotel_cancellation_champion.pkl
│   ├── model_metadata.json
│   └── model_registry.json
├── data/               # Historical booking demand datasets
│   └── hotel_bookings.csv
├── Dockerfile          # Multi-stage container build
├── Procfile            # Cloud PaaS process definition
└── render.yaml         # Render blueprint configuration
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: FastAPI, Uvicorn, Gunicorn, Pydantic
- **Machine Learning**: LightGBM, Scikit-Learn, Pandas, NumPy, Joblib
- **Containerization**: Docker (Node 18 Alpine + Python 3.11 Slim)

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/kundurusaraswathireddy/ai-hotel.git
cd ai-hotel
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

---

## 💻 Running the Application

### Option A: Unified Single-Port Mode (Recommended)
Build the frontend once and let FastAPI serve both the REST API and the React dashboard on a single port:

```bash
# 1. Build React frontend
cd frontend
npm run build
cd ..

# 2. Start FastAPI server
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
```
- **Dashboard UI**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Dual-Process Development Mode
For hot-reloading on both frontend and backend:

**Terminal 1 (Backend):**
```bash
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
- **Vite Dev Server**: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

The application includes a production-ready, multi-stage `Dockerfile` that packages the frontend and backend into a single lightweight container:

```bash
# Build the Docker image
docker build -t hotelguard-ai .

# Run the container
docker run -d -p 8000:8000 --name hotelguard hotelguard-ai
```
Access the application at `http://localhost:8000`.

---

## ☁️ Cloud Deployment (Free & HTTPS)

### Deploy on Render (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect the repository: `kundurusaraswathireddy/ai-hotel`.
3. Select **Docker** as the runtime (or use the included `render.yaml` Blueprint).
4. Choose the **Free** instance tier and click **Create Web Service**.
5. Your application will be live at `https://<your-service-name>.onrender.com`.

### Deploy on Koyeb
1. Sign in to [Koyeb](https://app.koyeb.com/) and click **Create App** $\rightarrow$ **GitHub**.
2. Select `kundurusaraswathireddy/ai-hotel`.
3. Choose **Dockerfile** builder on the **Free Eco** instance.
4. Deploy to get your public HTTPS URL (`https://<app-name>.koyeb.app`).

### Deploy on Hugging Face Spaces
1. Create a new Space at [huggingface.co/spaces](https://huggingface.co/spaces).
2. Choose **Docker** as the Space SDK and link the repository.
3. Your application will be hosted at `https://<user>-<space-name>.hf.space`.

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health, model status, and dataset connectivity |
| `GET` | `/model-info` | Metadata, performance metrics, and feature importances |
| `POST` | `/predict` | Real-time cancellation risk scoring for a single booking |
| `POST` | `/predict/batch` | Batch inference across multiple bookings |
| `POST` | `/what-if/simulate` | Simulates risk changes when booking parameters are modified |
| `POST` | `/validate-dataset` | Validates uploaded CSV datasets against feature schema |
| `POST` | `/copilot/query` | Natural language operational assistant queries |
| `GET` | `/analytics/overview` | High-level dataset metrics and cancellation breakdowns |
| `GET` | `/waitlist/entries` | Live smart waitlist queue |
| `POST` | `/waitlist/match` | Matches high-risk cancellations with waitlisted guests |

---

## 📄 License

This project is licensed under the MIT License.
