import moment from 'moment';

export const reservationAcceptedHandler = ({
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
