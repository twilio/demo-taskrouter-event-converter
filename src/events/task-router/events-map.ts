import { taskCreatedHandler, taskCanceledHandler, taskWrapupHandler } from './task';
import {
  reservationAcceptedHandler,
  reservationRejectedHandler,
  reservationCreatedHandler,
} from './reservation';
import { workerActivityUpdateHandler } from './worker';
import { taskQueueEnteredHandler } from './task-queue';
import { TeravozEvent } from '../../teravoz';
import { TaskRouterEventTypes, TaskRouterEvent } from '../../twilio';

/**
 * Handler defines a type of a TaskRouter's event handler function,
 * that can be used to convert to an array of Teravoz's events.
 */
type Handler = (event: TaskRouterEvent) => TeravozEvent[];

/**
 * EventsMapping defines the structure of an Javascript Object that
 * can be used as a handler mapping, which is defined by a key with the
 * Twilio's TaskRouter event type and a value that is a handler responsible
 * to convert the respective event to one or more teravoz events.
 */
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
