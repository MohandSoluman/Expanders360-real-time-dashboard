import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { computed, inject } from "@angular/core";

import { pipe, switchMap, tap, merge, catchError, EMPTY } from "rxjs";
import { ToastService } from "../../shared/services/toast.service";
import { DashboardDataService } from "../services/dashboard-data.service";
import { RealtimeService } from "../services/realtime.service";
import { TimelineEvent, Metrics, Anomaly, VolumeMetric } from "./event.models";

export interface DashboardState {
  events: TimelineEvent[];
  metrics: Metrics;
  anomalies: Anomaly[];
  volumeHistory: VolumeMetric[];
  isPaused: boolean;
  isLoading: boolean;
}

const initialState: DashboardState = {
  events: [],
  metrics: {
    activeUsers: 0,
    transactionsPerSecond: 0,
    errorRate: 0,
    systemHealth: 100,
    slaCompliance: 100,
    averageCycleTime: "0m 0s",
    totalWorkflows: 0,
  },
  anomalies: [],
  volumeHistory: [],
  isPaused: false,
  isLoading: true,
};

export const DashboardStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed(({ events, anomalies }) => ({
    eventCount: computed(() => events().length),
    hasCriticalAnomalies: computed(() =>
      anomalies().some((a) => a.severity === "high")
    ),
  })),
  withMethods(
    (
      store,
      dataService = inject(DashboardDataService),
      realtimeService = inject(RealtimeService),
      toastService = inject(ToastService)
    ) => ({
      toggleSimulation: () => {
        patchState(store, (state) => ({ isPaused: !state.isPaused }));
      },

      initializeData: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            const timeline$ = dataService.getTimelineEvents();
            const anomalies$ = dataService.getAnomalies();
            const stats$ = dataService.getOverviewStats();
            const volume$ = dataService.getVolumeHistory();
            return merge(
              timeline$.pipe(tap((events) => patchState(store, { events }))),
              anomalies$.pipe(
                tap((anomalies) => patchState(store, { anomalies }))
              ),
              stats$.pipe(
                tap((stats) =>
                  patchState(store, (state) => ({
                    metrics: {
                      ...state.metrics,
                      totalWorkflows: stats.totalWorkflowsToday,
                      averageCycleTime: `${stats.averageCycleTime}m`,
                      slaCompliance: stats.slaCompliance,
                    },
                  }))
                )
              ),
              volume$.pipe(
                tap((volumeHistory) => patchState(store, { volumeHistory }))
              )
            ).pipe(
              catchAndLog("Failed to load initial data"),
              tap(() => patchState(store, { isLoading: false }))
            );
          })
        )
      ),

      connectRealtime: rxMethod<void>(
        pipe(
          tap(() => realtimeService.connect()),
          switchMap(() =>
            merge(
              realtimeService.listen<any>("new-event").pipe(
                tap((event) => {
                  if (store.isPaused()) return;
                  const newEvent: TimelineEvent = {
                    id: event.id,
                    title: event.type,
                    timestamp: new Date(event.timestamp),
                    status: mapStatus(event.type),
                    description: `Real-time event: ${event.type}`,
                  };
                  patchState(store, (state) => ({
                    events: [...state.events, newEvent],
                  }));
                  toastService.show(`New Event: ${event.type}`, "info");
                }),
                catchError((err) => {
                  console.error("Error in new-event stream", err);
                  return EMPTY;
                })
              ),
              realtimeService.listen<any>("new-anomaly").pipe(
                tap((event) => {
                  if (store.isPaused()) return;
                  const anomaly: Anomaly = {
                    id: event.id,
                    severity: event.severity.toLowerCase(),
                    message: `${event.type} detected`,
                    timestamp: new Date(event.timestamp),
                  };
                  const newEvent: TimelineEvent = {
                    id: event.id,
                    title: event.type,
                    timestamp: new Date(event.timestamp),
                    status: "anomaly",
                    description: `Anomaly detected: ${event.type}`,
                  };
                  patchState(store, (state) => ({
                    anomalies: [anomaly, ...state.anomalies],
                    events: [...state.events, newEvent],
                  }));
                  toastService.show(
                    `Anomaly Detected: ${event.type}`,
                    "error",
                    5000
                  );
                }),
                catchError((err) => {
                  console.error("Error in new-anomaly stream", err);
                  return EMPTY;
                })
              ),
              realtimeService.listen<any>("stats-update").pipe(
                tap((stats) => {
                  if (store.isPaused()) return;
                  patchState(store, (state) => ({
                    metrics: {
                      ...state.metrics,
                      totalWorkflows: stats.totalWorkflowsToday,
                      averageCycleTime: `${stats.averageCycleTime}m`,
                      slaCompliance: stats.slaCompliance,
                    },
                  }));
                }),
                catchError((err) => {
                  console.error("Error in stats-update stream", err);
                  return EMPTY;
                })
              ),
              realtimeService.listen<VolumeMetric>("volume-update").pipe(
                tap((updatedVolume) => {
                  if (store.isPaused()) return;
                  patchState(store, (state) => {
                    const history = state.volumeHistory;
                    const index = history.findIndex(
                      (h) => h.hourDisplay === updatedVolume.hourDisplay
                    );
                    let newHistory;
                    if (index !== -1) {
                      newHistory = [...history];
                      newHistory[index] = updatedVolume;
                    } else {
                      newHistory = [...history, updatedVolume];
                      if (newHistory.length > 24) newHistory.shift();
                    }
                    return { volumeHistory: newHistory };
                  });
                }),
                catchError((err) => {
                  console.error("Error in volume-update stream", err);
                  return EMPTY;
                })
              )
            )
          )
        )
      ),
    })
  ),
  withHooks({
    onInit(store) {
      store.initializeData();
      store.connectRealtime();
    },
    onDestroy(store) {
      const realtimeService = inject(RealtimeService);
      realtimeService.disconnect();
    },
  })
);

function mapStatus(type: string): "completed" | "pending" | "anomaly" {
  const lower = type.toLowerCase();
  if (lower.includes("error") || lower.includes("breach")) return "anomaly";
  if (lower.includes("review") || lower.includes("intake")) return "pending";
  return "completed";
}

function catchAndLog(message: string) {
  return (source: any) =>
    source.pipe(
      tap({ error: (e) => console.error(message, e) }),
      catchError(() => EMPTY)
    );
}
