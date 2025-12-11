# Legal Workflow Monitoring & Anomaly Detection Dashboard

## 🧠 Business Context

Legal teams need real-time visibility to detect delays, anomalies, and potential SLA breaches in workflows (case intake, approvals, document reviews).

**Your Mission:** Build a real-time monitoring dashboard that displays workflow health, anomalies, and system activity in an intuitive, visually compelling way.

## 📌 The Challenge

### 1️⃣ Step 1 — Mock API for Real-Time Data

A small simulated backend provides endpoints and real-time updates:

- **GET /stats/overview**: Returns total workflows, average cycle time, SLA compliance %, and active anomalies.
- **GET /stats/timeline**: Returns workflow events from the past 24 hours.
- **GET /stats/anomalies**: Returns a list of anomalies with severity and timestamps.
- **WebSocket / SSE**: Broadcasts new events (e.g., "SLA breach", "Case delayed") every 10–20 seconds to update the dashboard in real-time.

### 2️⃣ Step 2 — Angular Real-Time Dashboard

The dashboard features four core components:

#### 📈 1. Real-Time Event Timeline

- Horizontal timeline chart.
- **Colors**: Green (Completed), Yellow (Pending), Red (Anomaly).
- **Features**: Auto-scroll on new events, Tooltip on hover.

#### 🚦 2. Workflow Health Status Cards

- Displays SLA Compliance, Cycle Time, Active Anomalies, and Total Workflows.
- Updates reactively as new events stream in.

#### 📊 3. Anomaly Heatmap

- Groups anomalies by hour & severity.
- Severity-based color coding.
- Interactive details panel on click.

#### 📉 4. Workflow Volume Chart

- Bar/line hybrid chart showing volume per hour.
- **Filters**: 6h / 12h / 24h.

### 3️⃣ Step 3 — Interactions & Filters

- ✔ Filter timeline events by category.
- ✔ Toggle anomaly types.
- ✔ Auto-refresh or WebSocket streaming controls.
- ✔ Smooth chart transitions.

### 4️⃣ Step 4 — State Management

- Uses **Angular Signals** (or NgRx) for scalable state management of live events, overview metrics, anomaly lists, and user filters.
- Optimized for performance and real-time updates.

### 5️⃣ Step 5 — Deployment & DevOps

- **Docker**: Containerized Angular frontend and Node.js backend.
- **Docker Compose**: Runs the full system with a single command.
- **Documentation**: Clear setup and deployment instructions.

### 6️⃣ Step 6 — Bonus Features

- ✨ Real-time toast notifications
- ✨ Dark mode
- ✨ Pause/resume live updates
- ✨ Global refresh
- ✨ Simulated backend errors

## 🗄️ Tech Stack

- **Frontend**: Angular 18+, Angular Signals, TailwindCSS.
- **Visualization**: D3.js / ECharts.
- **Backend**: Node.js (Mock API).
- **Real-time**: Socket.IO / WebSockets.
- **DevOps**: Docker, Docker Compose.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

### Local Development

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/MohandSoluman/Expanders360-real-time-dashboard.git
    cd Expanders360-real-time-dashboard
    ```

2.  **Start the Backend:**

    ```bash
    cd server
    npm install
    npm run dev
    ```

3.  **Start the Frontend:**
    ```bash
    cd client
    npm install
    npm start
    ```

### Running with Docker

Run the entire application (Frontend + Backend) with one command:

```bash
docker-compose up --build
```

Access the dashboard at `http://localhost:4200` (or the configured port).
