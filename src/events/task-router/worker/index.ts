import { AgentEvents, AgentEvent } from '../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent } from '../../twilio';

export const workerStatus = {
  available: 'available',
  break: 'break',
  unavailable: 'unavailable',
  offline: 'offline',
};

export const workerActivityUpdateHandler = ({
  EventType,
  WorkerActivityName,
  WorkerPreviousActivityName,
  WorkerName = '',
  WorkerAttributes,
  TimestampMs,
  Sid,
}: TaskRouterEvent): [AgentEvent] | [] => {
  if (EventType !== 'worker.activity.update') {
    throw new Error("Only tasks of type 'worker.activity.update' can be handled by workerActivityUpdateHandler.");
  }

  if (!WorkerAttributes) {
    throw new Error("Missing WorkerAttributes in 'worker.activity.update' event.");
  }

  if (!WorkerActivityName) {
    throw new Error("Missing WorkerActivityName in 'worker.activity.update' event.");
  }

  if (WorkerPreviousActivityName === WorkerActivityName) {
    return [];
  }

  const { contact_uri: contactUri } = JSON.parse(WorkerAttributes);

  switch (WorkerActivityName.toLowerCase()) {
    case workerStatus.available: {
      if (WorkerPreviousActivityName === workerStatus.break) {
        return [{
          type: AgentEvents.unpaused,
          actor: WorkerName,
          number: contactUri,
          timestamp: getTime(TimestampMs),
          sid: Sid,
        }];
      }

      return [{
        type: AgentEvents.loggedIn,
        actor: WorkerName,
        number: contactUri,
        timestamp: getTime(TimestampMs),
        sid: Sid,
      }];
    }
    case workerStatus.unavailable:
    case workerStatus.offline:
      if (WorkerPreviousActivityName
          && WorkerPreviousActivityName.toLowerCase() !== workerStatus.unavailable) {
        return [{
          type: AgentEvents.loggedOut,
          actor: WorkerName,
          number: contactUri,
          timestamp: getTime(TimestampMs),
          sid: Sid,
        }];
      }

      return [];
    case workerStatus.break:
      return [{
        type: AgentEvents.paused,
        actor: WorkerName,
        number: contactUri,
        timestamp: getTime(TimestampMs),
        sid: Sid,
      }];
    default:
      return [];
  }
};
