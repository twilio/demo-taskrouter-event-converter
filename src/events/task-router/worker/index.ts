import { AgentEvents, AgentEvent } from '../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent } from '../../twilio';
import { logger } from '../../../logger';

export const workerStatus = {
  available: 'available',
  break: 'break',
  unavailable: 'unavailable',
  offline: 'offline',
};

class WorkerActivityConverter {
  constructor(private event: TaskRouterEvent, private number: string, private queues: string[]) {
    this.event = event;
    this.number = number;
    this.queues = queues;
  }

  public mapEventsByQueues(type: AgentEvents): AgentEvent[] {
    const { WorkerName = '', TimestampMs, Sid } = this.event;

    return this.queues.map((queue): AgentEvent => ({
      type,
      number: this.number,
      actor: WorkerName,
      timestamp: getTime(TimestampMs),
      sid: Sid,
      queue,
    }));
  }
}

export const workerActivityUpdateHandler = (taskRouterEvent: TaskRouterEvent): AgentEvent[] => {
  const {
    EventType, WorkerActivityName, WorkerPreviousActivityName, WorkerAttributes,
  } = taskRouterEvent;

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

  const { contact_uri: contactUri, queues = [] } = JSON.parse(WorkerAttributes);


  if (!queues.length) {
    logger.warn(`Worker ${contactUri} doesn't belong to any queue. Events will be not emitted for this worker.`);
    return [];
  }

  const converter = new WorkerActivityConverter(taskRouterEvent, contactUri, queues);

  switch (WorkerActivityName.toLowerCase()) {
    case workerStatus.available: {
      if (WorkerPreviousActivityName && WorkerPreviousActivityName.toLowerCase() === workerStatus.break) {
        return converter.mapEventsByQueues(AgentEvents.unpaused);
      }

      return converter.mapEventsByQueues(AgentEvents.loggedIn);
    }
    case workerStatus.unavailable:
    case workerStatus.offline:
      if (WorkerPreviousActivityName
          && WorkerPreviousActivityName.toLowerCase() !== workerStatus.unavailable) {
        return converter.mapEventsByQueues(AgentEvents.loggedOut);
      }

      return [];
    case workerStatus.break:
      return converter.mapEventsByQueues(AgentEvents.paused);
    default:
      return [];
  }
};
