import { CallEvent, CallEvents } from '../../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent, TaskRouterEventTypes } from '../../../twilio';

/**
 *
 * TaskQueueEnteredHandler converts the `task-queue.entered` TaskRouter's
 * events to the equivalent Teravoz's event `call.waiting`.
 *
 * The mapped structure will be:
 *
|   Teravoz    |    TaskRouter's Event    |             Value             |
|:------------:|:------------------------:|:-----------------------------:|
|     type     |        EventType         | Converted into "call.waiting" |
|   call_id    |  TaskAttributes.call_id  |    TaskAttributes.call_id     |
|  direction   | TaskAttributes.direction |   TaskAttributes.direction    |
|  our_number  |  TaskAttributes.called   |     TaskAttributes.called     |
| their_number |   TaskAttributes.from    |      TaskAttributes.from      |
|    queue     |       TaskQueueSid       |         TaskQueueSid          |
|  timestamp   |       TimestampMs        |    Timestamp UTC's string     |
|     sid      |           Sid            |      Twilio's Event Sid       |
 *
 * @param taskRouterEvent the incoming taskRouterEvent to be converted.
 */
export const taskQueueEnteredHandler = ({
  Sid,
  EventType,
  TaskAttributes,
  TaskQueueSid,
  TimestampMs,
}: TaskRouterEvent): [CallEvent] => {
  if (EventType !== TaskRouterEventTypes.taskQueueEntered) {
    throw new Error(`Only tasks of type ${TaskRouterEventTypes.taskQueueEntered} can be handled by taskQueueEnteredHandler.`);
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
