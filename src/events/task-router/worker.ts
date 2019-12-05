import moment from 'moment';

import { TeravozEvent } from '../teravoz';

export const workerStatus = {
  available: 'available',
  break: 'break',
  unavailable: 'unavailable',
  offline: 'offline',
};

export const workerActivityUpdateHandler = ({
  EventType, WorkerActivityName, WorkerPreviousActivityName, WorkerName, WorkerSid, TimestampMs,
}: any): Record<string, any> & TeravozEvent[] => {
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
          type: 'actor.unpaused',
          actor: WorkerName,
          number: WorkerSid,
          timestamp: moment(+TimestampMs).format(),
        }];
      }

      return [{
        type: 'actor.logged-in',
        actor: WorkerName,
        number: WorkerSid,
        timestamp: moment(+TimestampMs).format(),
      }];
    }
    case workerStatus.unavailable:
    case workerStatus.offline:
      if (WorkerPreviousActivityName.toLowerCase() !== workerStatus.unavailable) {
        return [{
          type: 'actor.logged-out',
          actor: WorkerName,
          number: WorkerSid,
          timestamp: moment(+TimestampMs).format(),
        }];
      }

      return [];
    case workerStatus.break:
      return [{
        type: 'actor.paused',
        actor: WorkerName,
        number: WorkerSid,
        timestamp: moment(+TimestampMs).format(),
      }];
    default:
      return [];
  }
};
