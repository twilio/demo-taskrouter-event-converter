import { CallEvent, CallEvents } from '../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent } from '../../twilio';

export const taskQueueEnteredHandler = ({
  Sid,
  EventType,
  TaskAttributes,
  TaskQueueSid,
  TimestampMs,
}: TaskRouterEvent): [CallEvent] => {
  if (EventType !== 'task-queue.entered') {
    throw new Error("Only tasks of type 'task-queue.entered' can be handled by taskQueueEnteredHandler.");
  }

  if (!TaskAttributes) {
    throw new Error("Missing TaskAttributes in 'task-queue.entered' event.");
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
      sid: Sid,
    },
  ];
};
