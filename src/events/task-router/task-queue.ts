import moment from 'moment';
import { CallEvent, CallEvents } from '../teravoz';
import { getTime } from '../date';

export const taskQueueEnteredHandler = ({
  EventType,
  TaskAttributes,
  TaskQueueSid,
  TimestampMs,
}: any): [CallEvent] => {
  if (EventType !== 'task-queue.entered') {
    throw new Error("Only tasks of type 'task-queue.entered' can be handled by taskQueueEnteredHandler.");
  }

  const {
    call_sid: callId, direction, called, from,
  } = JSON.parse(TaskAttributes);

  return [
    {
      type: CallEvents.waiting,
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      queue: TaskQueueSid,
      timestamp: getTime(TimestampMs),
    },
  ];
};
