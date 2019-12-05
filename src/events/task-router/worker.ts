import moment from 'moment';

import { AgentEvents, AgentEvent } from '../teravoz';

export const workerStatus = {
  available: 'available',
  break: 'break',
  unavailable: 'unavailable',
  offline: 'offline',
};

export const workerActivityUpdateHandler = ({
  EventType, WorkerActivityName, WorkerPreviousActivityName, WorkerName, WorkerSid, TimestampMs,
}: any): [AgentEvent] | [] => {
  if (EventType !== 'worker.activity.update') {
    throw new Error("Only tasks of type 'worker.activity.update' can be handled by workerActivityUpdateHandler.");
  }

  if (WorkerPreviousActivityName === WorkerActivityName) {
    return [];
  }

  switch (WorkerActivityName.toLowerCase()) {
    case workerStatus.available: {
      if (WorkerPreviousActivityName === workerStatus.break) {
        return [{
          type: AgentEvents.unpaused,
          actor: WorkerName,
          number: WorkerSid,
          timestamp: moment(+TimestampMs).format(),
        }];
      }

      return [{
        type: AgentEvents.loggedIn,
        actor: WorkerName,
        number: WorkerSid,
        timestamp: moment(+TimestampMs).format(),
      }];
    }
    case workerStatus.unavailable:
    case workerStatus.offline:
      if (WorkerPreviousActivityName.toLowerCase() !== workerStatus.unavailable) {
        return [{
          type: AgentEvents.loggedOut,
          actor: WorkerName,
          number: WorkerSid,
          timestamp: moment(+TimestampMs).format(),
        }];
      }

      return [];
    case workerStatus.break:
      return [{
        type: AgentEvents.paused,
        actor: WorkerName,
        number: WorkerSid,
        timestamp: moment(+TimestampMs).format(),
      }];
    default:
      return [];
  }
};
