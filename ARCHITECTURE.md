# Architecture Documentation

## 1. Real-Time Architecture

The system utilizes a **push-based architecture** to ensure immediate data updates for critical events and anomalies options.

- **Backend (Node.js/Socket.io)**:

  - The server mimics an event stream using `setInterval` to generate mock data.
  - **Socket.io** is used to broadcast events (`new-event`, `new-anomaly`, `stats-update`, `volume-update`) to all connected clients.
  - Events are payload-optimized to reduce bandwidth (sending only deltas where possible).

- **Frontend (Angular/RxJS)**:
  - **RealtimeService**: A dedicated service wraps the Socket.io client in **RxJS Observables**. This allows us to use powerful operators like `throttleTime`, `distinctUntilChanged`, and `catchError` to manage the stream.
  - **Reactive Streams**: The application treats everything as a stream. Components subscribe to data streams from the Store, which in turn subscribes to the RealtimeService. This creates a unidirectional data flow from Server → Socket → Service → Store → Component.

## 2. State Management

We utilize **@ngrx/signals** (Functional Signal Store) for a modern, lightweight, and reactive state management solution.

- **Single Source of Truth**: The `DashboardStore` holds the entire application state (events, metrics, anomalies, volume history).
- **Signals for Reactivity**: Angular Signals provide fine-grained reactivity. Components only re-render when the specific signal they read changes.
- **Encapsulated Logic**: The store uses `rxMethod` to encapsulate complex async logic (data fetching, socket listening), keeping components "dumb" and focused only on presentation.
- **Immutability**: State updates use `patchState` to ensure immutability, making state changes predictable and easier to debug.

## 3. Visualization Decisions

- **Event Timeline**:
  - **Custom Component**: Built from scratch to handle high-frequency updates without the overhead of heavy charting libraries.
  - **Design**: Uses a vertical flow with distinct status indicators (color-coded dots) for rapid scanning. Newer events are injected at the top/bottom as configured.
- **Workflow Volume (Bar Chart)**:
  - **ApexCharts / D3**: Selected for their performance with dynamic datasets.
  - **Data Handling**: The chart updates in real-time as new volume metrics for the current hour arrive, providing immediate feedback on system load.
- **Anomaly Heatmap**:
  - **Grid Layout**: A visual grid represents system segments.
  - **Color Encoding**: Severity is encoded with color (Red=High, Orange=Medium) to draw immediate attention to critical issues.

## 4. Deployment Strategy

The application is containerized using **Docker** for consistency across environments.

- **Client**: Built as a static asset bundle (Nginx).
  - `Dockerfile` uses a multi-stage build:
    1.  `build` stage: Installs dependencies and compiles Angular.
    2.  `runtime` stage: Copies artifacts to an Nginx Alpine image.
- **Server**: Node.js runtime.
  - `Dockerfile` installs production dependencies and runs the server.
- **Orchestration**: `docker-compose.yml` ties them together, handling networking and port mapping, making local development and "one-click" deployment simple.

## 5. Enterprise Scaling Strategy

To scale this dashboard to enterprise loads (thousands of users, millions of events):

- **Frontend Optimization**:

  - **OnPush Change Detection**: Strictly enforced to minimize change detection cycles.
  - **Virtual Scrolling**: For the Event Timeline, we would implement virtual scrolling (CDK Virtual Scroll) to handle thousands of DOM elements efficiently.
  - **Web Workers**: Offload heavy data processing (e.g., parsing huge JSON payloads) to background threads.

- **Backend Scaling**:

  - **Redis Adapter for Socket.io**: To scale horizontally across multiple server instances, we would use the Redis Adapter. This allows broadcasting events to clients connected to _any_ server node.
  - **Load Balancing**: Nginx or AWS ALB to distribute WebSocket connections across nodes.
  - **Message Queue (Kafka/RabbitMQ)**: In a real scenario, the dashboard server would consume events from a durable message queue rather than generating them, ensuring data reliability and decoupling from the ingestion service.

- **Resilience**:
  - **Automatic Reconnection**: Socket.io handles this, but we implement exponential backoff strategies.
  - **Offline Mode**: Caching initial data in LocalStorage (as currently implemented) ensures the dashboard is useful immediately upon load, even if the network is flaky.
