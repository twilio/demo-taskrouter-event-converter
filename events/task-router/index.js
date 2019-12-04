const moment = require('moment');
const twilio = require('twilio')(process.env.TWILIO_KEY_SID, process.env.TWILIO_SECRET_SID, {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
});

const workerStatus = {
  available: 'available',
  break: 'break',
  unavailable: 'unavailable',
  offline: 'offline',
};

const taskCreatedHandler = ({
  EventType, TaskAttributes, TimestampMs,
}) => {
  if (EventType !== 'task.created') {
    throw new Error("Only tasks of type 'task.created' can be handled by taskCreatedHandler.");
  }

  const {
    call_sid: callId, direction, called, from,
  } = JSON.parse(TaskAttributes);

  return [
    {
      type: 'call.new',
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
}) => {
  if (EventType !== 'task.canceled') {
    throw new Error("Only tasks of type 'task.canceled' can be handled by taskCanceledhandler.");
  }

  const { call_sid: callId } = JSON.parse(TaskAttributes);

  return [
    {
      type: 'call.queue-abandon',
      call_id: callId,
      timestamp: moment(+TimestampMs),
    },
  ];
};

const reservationAcceptedHandler = ({
  EventType, TaskAttributes, WorkerName, WorkerSid, TaskQueueSid, TimestampMs,
}) => {
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
    },
  ];
};

const workerActivityUpdateHandler = ({
  EventType, WorkerActivityName, WorkerPreviousActivityName, WorkerName, WorkerSid, TimestampMs,
}) => {
  if (EventType !== 'worker.activity.update') {
    throw new Error("Only tasks of type 'worker.activity.update' can be handled by workerActivityUpdateHandler.");
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
      if (![workerStatus.offline, workerStatus.unavailable]
        .includes(WorkerPreviousActivityName.toLowerCase())) {
        return [{
          type: 'actor.logged-out',
          actor: WorkerName,
          number: WorkerSid,
          timestamp: moment(+TimestampMs).format(),
        }];
      }

      return null;
    case workerStatus.break:
      return [{
        type: 'actor.paused',
        actor: WorkerName,
        number: WorkerSid,
        timestamp: moment(+TimestampMs).format(),
      }];
    default:
      return null;
  }
};

/**
 * EventMapping from TaskRouter to teravoz events
 */
const eventsMapping = {
  'task.created': () => taskCreatedHandler,
  'task.canceled': taskCanceledHandler,
  'reservation.accepted': reservationAcceptedHandler,
  'worker.activity.update': workerActivityUpdateHandler,
  // 'reservation.timeout': () => 'actor.timeout',
};

/**
 * Handles events from TaskRouter and convert it to the equivalent event from Teravoz
 * @param {object} event
 */
const taskRouterEventHandler = (event) => {
  const mapEvent = eventsMapping[event.EventType];

  if (mapEvent) {
    return mapEvent(event);
  }

  return null;
};

module.exports.taskRouterEventHandler = taskRouterEventHandler;
