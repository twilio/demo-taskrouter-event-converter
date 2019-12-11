import { taskCreatedHandler, taskCanceledHandler, taskWrapupHandler } from './task';
import { reservationAcceptedHandler, reservationRejectedHandler, reservationCreatedHandler } from './reservation';
import { workerActivityUpdateHandler } from './worker';
import { taskQueueEnteredHandler } from './task-queue';
import { TeravozEvent } from '../teravoz';
import { TaskRouterEventTypes, TaskRouterEvent } from '../twilio';

type Handler = (event: TaskRouterEvent) => TeravozEvent[]
type EventsMapping = {
  [K in TaskRouterEventTypes]?: Handler;
};

/**
 * EventMapping from TaskRouter to converter handlers
 */
export const eventsMapping: EventsMapping = {
  'task.created': taskCreatedHandler,
  'task.canceled': taskCanceledHandler,
  'task.wrapup': taskWrapupHandler,
  'reservation.accepted': reservationAcceptedHandler,
  'reservation.rejected': reservationRejectedHandler,
  'reservation.created': reservationCreatedHandler,
  'worker.activity.update': workerActivityUpdateHandler,
  'task-queue.entered': taskQueueEnteredHandler,
  // 'reservation.timeout': () => 'actor.timeout',
};
