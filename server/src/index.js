const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in this mock
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const PORT = 3000;

// Middleware to simulate 5% random 500 errors
app.use((req, res, next) => {
  if (Math.random() < 0.05) {
    console.log(`Simulating 500 Error for ${req.method} ${req.url}`);
    return res.status(500).json({ error: "Simulated Internal Server Error" });
  }
  next();
});

// --- Mock Data State ---
let workflowStats = {
  totalWorkflowsToday: 145,
  averageCycleTime: 42, // minutes
  slaCompliance: 94, // percent
  activeAnomaliesCount: 2,
};

let timelineEvents = [];
let anomalyEvents = [];
let volumeHistory = []; // { timestamp, hourDisplay, volume, completionRate }

// Initialize some mock data
const eventTypes = [
  "Case Intake",
  "Document Review",
  "Approval",
  "Case Closed",
  "Finalize",
  "Archive",
];
const anomalyTypes = ["SLA Breach", "Unusual Delay", "System Error"];
const severities = ["Low", "Medium", "High", "Critical"];

function generateTimestamp(minutesAgo = 0) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now.toISOString();
}

// Populate initial timeline
for (let i = 0; i < 20; i++) {
  timelineEvents.push({
    id: i,
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    timestamp: generateTimestamp(Math.floor(Math.random() * 1440)), // random time in last 24h
  });
}
// Sort timeline
timelineEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Populate initial anomalies
for (let i = 0; i < 2; i++) {
  anomalyEvents.push({
    id: i,
    type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    timestamp: generateTimestamp(Math.floor(Math.random() * 600)), // random time in last 10h
  });
}

// Populate initial volume history (24h)
const now = new Date();
for (let i = 23; i >= 0; i--) {
  const d = new Date(now.getTime() - i * 60 * 60 * 1000);
  const hour = d.getHours();

  volumeHistory.push({
    timestamp: d.getTime(),
    hourDisplay: `${hour.toString().padStart(2, "0")}:00`,
    volume: Math.floor(Math.random() * 50) + 10,
    completionRate: Math.floor(Math.random() * 20) + 80,
  });
}

// --- REST Endpoints ---

// GET /stats/overview
app.get("/stats/overview", (req, res) => {
  res.json({
    totalWorkflowsToday: workflowStats.totalWorkflowsToday,
    averageCycleTime: workflowStats.averageCycleTime,
    slaCompliance: workflowStats.slaCompliance,
    activeAnomaliesCount: anomalyEvents.length,
  });
});

// GET /stats/timeline
app.get("/stats/timeline", (req, res) => {
  res.json(timelineEvents);
});

// GET /stats/anomalies
app.get("/stats/anomalies", (req, res) => {
  res.json(anomalyEvents);
});

// GET /stats/volume
app.get("/stats/volume", (req, res) => {
  res.json(volumeHistory);
});

// --- Real-time Updates (Socket.io) ---

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Simulate events every 10-20 seconds
setInterval(() => {
  // RANDOM ERROR SIMULATION (5% chance)
  if (Math.random() < 0.05) {
    console.log("Simulating 500 Backend Error / Socket Failure");
    // Optionally emit an error event to the client if you want them to handle it explicitly,
    // or just "fail" to send successful data to simulate a drop.
    // For this task, let's emit a specific error event so the client can show a toast (as requested).
    io.emit("simulated-error", {
      message: "500 Internal Server Error (Simulated)",
    });
    return; // Skip normal processing
  }

  const isAnomaly = Math.random() < 0.3; // 30% chance of anomaly
  const newEvent = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };

  if (isAnomaly) {
    newEvent.type =
      anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    newEvent.severity =
      severities[Math.floor(Math.random() * severities.length)];

    anomalyEvents.unshift(newEvent);
    // Keep list reasonable
    if (anomalyEvents.length > 50) anomalyEvents.pop();

    io.emit("new-anomaly", newEvent);
    console.log("Emitted anomaly:", newEvent);
  } else {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    newEvent.type = type;

    timelineEvents.unshift(newEvent);
    // Keep list reasonable
    if (timelineEvents.length > 100) timelineEvents.pop();

    io.emit("new-event", newEvent);
    console.log("Emitted event:", newEvent);

    // Update stats slightly
    workflowStats.totalWorkflowsToday++;
    io.emit("stats-update", workflowStats);

    // Update Volume History
    const currentHourDisplay = `${new Date()
      .getHours()
      .toString()
      .padStart(2, "0")}:00`;
    const lastVolume = volumeHistory[volumeHistory.length - 1];

    if (lastVolume && lastVolume.hourDisplay === currentHourDisplay) {
      lastVolume.volume++;
      // emit only the updated last entry, or client can just fetch/increment
      // Let's emit the full updated list or just the update.
      // For simplicity/robustness, client can refetch or we emit the update.
      // Let's emit a specific volume-update event
      io.emit("volume-update", lastVolume);
    } else {
      // New hour started
      const newEntry = {
        timestamp: Date.now(),
        hourDisplay: currentHourDisplay,
        volume: 1,
        completionRate: Math.floor(Math.random() * 20) + 80,
      };
      volumeHistory.push(newEntry);
      if (volumeHistory.length > 24) volumeHistory.shift();
      io.emit("volume-update", newEntry);
    }
  }
}, 15000); // 15 seconds

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
