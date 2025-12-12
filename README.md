# Legal Workflow Monitoring & Anomaly Detection Dashboard

A high-performance real-time dashboard for monitoring legal workflow volumes, detecting anomalies, and tracking event timelines. Built with Angular (Signals), NgRx, Node.js, and Socket.io.

## 📸 Dashboard Preview

<p align="center">
  <img src="client/public/images/dashboard/1.png" width="45%" />
  <img src="client/public/images/dashboard/2.png" width="45%" />
  <img src="client/public/images/dashboard/3.png" width="45%" />
  <img src="client/public/images/dashboard/4.png" width="45%" />
  <img src="client/public/images/dashboard/5.png" width="45%" />
  <img src="client/public/images/dashboard/6.png" width="45%" />
</p>

## 🚀 Features

- **Real-time Event Timeline**: Live stream of system events with status indicators.
- **Anomaly Detection**: Visual alerts for system anomalies (High/Medium/Low severity).
- **Live Metrics**: Real-time updates for active users, TPS, error rates, and SLA compliance.
- **Interactive Charts**: Dynamic volume history visualization.
- **Simulation Control**: Pause/Resume real-time data flow.
- **Resilience**: LocalStorage caching for data persistence.

## 🏗 Architecture

This project demonstrates **Advanced Agentic Coding** principles:

- **Frontend**: Angular v19 with **NgRx Signals** for state management.
- **Reactivity**: Full **RxJS** integration for WebSocket streams and data handling.
- **Backend**: Node.js with **Socket.io** for bi-directional communication.
- **Deployment**: Docker & Docker Compose for containerized deployment.

> See [ARCHITECTURE.md](ARCHITECTURE.md) for a deep dive into design decisions, scalability, and state management strategies.

## 🛠 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker (optional, for containerized run)

### Running Locally

1.  **Clone the repository**
2.  **Start the Backend**:
    ```bash
    cd server
    npm install
    node src/index.js
    ```
3.  **Start the Frontend**:
    ```bash
    cd client
    npm install
    ng serve
    ```
4.  Open `http://localhost:4200`

### Running with Docker

```bash
docker-compose up --build
```

Access the dashboard at `http://localhost:80`.

## 🧪 Testing

Run unit tests:

```bash
cd client
ng test
```

## 📈 Scalability

Designed for enterprise scale with:

- **Push-based Architecture**: Minimizes polling overhead.
- **Efficient DOM Updates**: Angular Signals + OnPush strategy.
- **Pattern-Ready**: Ready for Redis Adapter and Load Balancing (see ARCHITECTURE.md).
