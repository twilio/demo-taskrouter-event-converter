/* eslint-disable @typescript-eslint/camelcase */
import moment from 'moment';
import { CallEvent, CallEvents, TeravozEvent } from '../teravoz';

const workerStatus = {
  available: 'available',
  break: 'break',
  unavailable: 'unavailable',
  offline: 'offline',
};

const taskCreatedHandler = ({
  EventType, TaskAttributes, TimestampMs,
}: any): CallEvent[] => {
  if (EventType !== 'task.created') {
    throw new Error("Only tasks of type 'task.created' can be handled by taskCreatedHandler.");
  }

  const {
    call_sid: callId, direction, called, from,
  } = JSON.parse(TaskAttributes);

  return [
    {
      type: CallEvents.new,
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      timestamp: moment(+TimestampMs).format(),
    },
  ];
};

const taskCanceledHandler = ({
  EventType, TaskAttributes, TimestampMs,
}: any): CallEvent[] => {
  if (EventType !== 'task.canceled') {
    throw new Error("Only tasks of type 'task.canceled' can be handled by taskCanceledhandler.");
  }

  const { call_sid: callId } = JSON.parse(TaskAttributes);

  return [
    {
      type: CallEvents.queueAbandon,
      call_id: callId,
      timestamp: moment(+TimestampMs).format(),
    },
  ];
};

const reservationAcceptedHandler = ({
  EventType, TaskAttributes, WorkerName, WorkerSid, TaskQueueSid, TimestampMs,
}: any) => {
  if (EventType !== 'reservation.accepted') {
    throw new Error("Only tasks of type 'reservation.accepted' can be handled by reservationAcceptedHandler.");
  }

  const {
    call_sid: callId, direction, called, from,
  } = JSON.parse(TaskAttributes);

  return [
    {
      type: 'actor.entered',
      call_id: callId,
      actor: WorkerName,
      number: WorkerSid,
      queue: TaskQueueSid,
      timestamp: moment(+TimestampMs).format(),
    },
    {
      type: 'call.ongoing',
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      timestamp: moment(+TimestampMs).format(),
    },
  ];
};

const workerActivityUpdateHandler = ({
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

/**
 * EventMapping from TaskRouter to teravoz events
 */
const eventsMapping: any = {
  'task.created': taskCreatedHandler,
  'task.canceled': taskCanceledHandler,
  'reservation.accepted': reservationAcceptedHandler,
  'worker.activity.update': workerActivityUpdateHandler,
  // 'reservation.timeout': () => 'actor.timeout',
};

/**
 * Handles events from TaskRouter and convert it to the equivalent event from Teravoz
 */
const taskRouterEventHandler = (event: any) => {
  const mapEvent = eventsMapping[event.EventType];

  if (mapEvent) {
    return mapEvent(event);
  }

  return [];
};

export { taskRouterEventHandler };
