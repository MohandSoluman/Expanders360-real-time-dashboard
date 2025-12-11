# Architecture & Design Decisions

## System Overview

The system consists of a **Node.js** backend broadcasting real-time events to an **Angular** frontend.

### Backend (`/server`)

- **Tech**: Node.js, Express, Socket.io.
- **Role**: Simulates a workflow engine. Emits 'live' events via WebSockets and provides REST endpoints for initial state.
- **Mocking**: Generates random legal workflow events (Intake, Approvals) and anomalies.

### Frontend (`/client`)

- **Tech**: Angular (Latest), TailwindCSS, ECharts.
- **State Management**: **Angular Signals**.
  - Chosen for performance and fine-grained reactivity over NgRx (which would be boilerplate-heavy for this scope).
  - `DashboardStore` acts as the single source of truth.
- **Visualizations**:
  - **ECharts**: Used for Heatmap and Volume charts due to superior rendering performance for high-density data compared to Chart.js.
  - **Pure CSS/HTML**: Used for Status Cards and Timeline for maximum DOM performance.

## Design Patterns

- **Clean Architecture**: Separation of concerns (Store -> Logic, Components -> View, Services -> Data Access).
- **Smart/Dumb Components**: `DashboardComponent` acts as the orchestrator, while child components are largely presentational (consuming Store signals).
- **Dependency Injection**: All services and stores are injected using Angular's DI.

## Scalability

- **Frontend**: Signal-based change detection minimizes zone pollution. OnPush strategy (implied by Signals) ensures efficient rendering.
- **Containerization**: Docker multi-stage builds ensure lightweight production artifacts (Nginx serving static files).
