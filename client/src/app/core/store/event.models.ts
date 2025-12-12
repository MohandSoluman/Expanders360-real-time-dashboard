export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: Date;
  status: "completed" | "pending" | "anomaly";
  description?: string;
}

export interface Metrics {
  activeUsers: number;
  transactionsPerSecond: number;
  errorRate: number;
  systemHealth: number; // 0-100
  slaCompliance: number; // Percentage
  averageCycleTime: string; // e.g. "12m 30s"
  totalWorkflows: number;
}

export interface Anomaly {
  id: string;
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: Date;
}

export interface VolumeMetric {
  timestamp: number;
  hourDisplay: string;
  volume: number;
  completionRate: number;
}
