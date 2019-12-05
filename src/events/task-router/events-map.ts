import { taskCreatedHandler, taskCanceledHandler } from './task';
import { reservationAcceptedHandler } from './reservation';
import { workerActivityUpdateHandler } from './worker';
import { TeravozEvent } from '../teravoz';

type Handler = (event: any) => TeravozEvent[]

/**
 * EventMapping from TaskRouter to converter handlers
 */
export const eventsMapping: Record<string, Handler> = {
  'task.created': taskCreatedHandler,
  'task.canceled': taskCanceledHandler,
  'reservation.accepted': reservationAcceptedHandler,
  'worker.activity.update': workerActivityUpdateHandler,
  // 'reservation.timeout': () => 'actor.timeout',
};
