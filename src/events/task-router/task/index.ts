import { CallEvent, CallEvents, AgentEvent, AgentEvents } from '../../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent, TaskRouterEventTypes } from '../../../twilio';

/**
 * taskCreatedHandler converts the `task.created` TaskRouter's
 * event to the equivalent Teravoz's event `call.new`.
 *
 * The `task.created` TaskRouter's event is triggered each time a
 * new task is created. When using Twilio Flex, calls are created
 * using tasks, and that's the reason that is used these tasks events
 * to emit Teravoz's call events.
 *
 * The mapped structure will be:
 *
|   Teravoz    |    TaskRouter's Event    |           Value           |
|:------------:|:------------------------:|:-------------------------:|
|     type     |        EventType         | Converted into "call.new" |
|   call_id    |  TaskAttributes.call_id  |  TaskAttributes.call_id   |
|  direction   | TaskAttributes.direction | TaskAttributes.direction  |
|  our_number  |  TaskAttributes.called   |   TaskAttributes.called   |
| their_number |   TaskAttributes.from    |    TaskAttributes.from    |
|  timestamp   |       TimestampMs        |  Timestamp UTC's string   |
|     sid      |           Sid            |    Twilio's Event Sid     |
 *
 * @param taskRouterEvent The incoming TaskRouter's event
 */
export const taskCreatedHandler = ({
  Sid,
  EventType,
  TaskAttributes,
  TimestampMs,
}: TaskRouterEvent): [CallEvent] => {
  if (EventType !== TaskRouterEventTypes.taskCreated) {
    throw new Error(
      `Only tasks of type '${TaskRouterEventTypes.taskCreated}' can be handled by taskCreatedHandler.`,
    );
  }

  if (!TaskAttributes) {
    throw new Error(`Missing TaskAttributes in '${TaskRouterEventTypes.taskCreated}' event.`);
  }

  const { call_sid: callId, direction, called, from } = JSON.parse(TaskAttributes);

  return [
    {
      type: CallEvents.new,
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      timestamp: getTime(TimestampMs),
      sid: Sid,
    },
  ];
};

/**
 * taskCanceledHandler converts the `task.canceled` TaskRouter's
 * event to the equivalent Teravoz's events `call.queue-abandon` and `call.finished`.
 *
 * The `task.canceled` TaskRouter's event is triggered each time a
 * task is canceled. When using Twilio Flex, when a caller that was waiting
 * on a TaskQueue give up of the call, the task is marked as canceled. That's
 * why we convert this event to the Teravoz's one `call.queue-abandon` and `call.finished`
 *
 * The mapped structure will be:
 *
 *  ### call.queue-abandon
|  Teravoz  |   TaskRouter's Event   |                Value                |
|:---------:|:----------------------:|:-----------------------------------:|
|  call_id  | TaskAttributes.call_id |       TaskAttributes.call_id        |
|    sid    |          Sid           |         Twilio's Event Sid          |
| timestamp |      TimestampMs       |       Timestamp UTC's string        |
|   type    |       EventType        | Converted into "call.queue-abandon" |
 *
 * ### call.finished
 *
|   Teravoz    |    TaskRouter's Event    |             Value              |
|:------------:|:------------------------:|:------------------------------:|
|     type     |        EventType         | Converted into "call.finished" |
|   call_id    |  TaskAttributes.call_id  |     TaskAttributes.call_id     |
|  direction   | TaskAttributes.direction |    TaskAttributes.direction    |
|  our_number  |  TaskAttributes.called   |     TaskAttributes.called      |
| their_number |   TaskAttributes.from    |      TaskAttributes.from       |
|  timestamp   |       TimestampMs        |     Timestamp UTC's string     |
|     sid      |           Sid            |       Twilio's Event Sid       |
 *
 * @param taskRouterEvent The incoming TaskRouter's event
 */
export const taskCanceledHandler = ({
  Sid,
  EventType,
  TaskAttributes,
  TimestampMs,
}: TaskRouterEvent): [CallEvent, CallEvent] => {
  if (EventType !== TaskRouterEventTypes.taskCanceled) {
    throw new Error(
      `Only tasks of type '${TaskRouterEventTypes.taskCanceled}' can be handled by taskCanceledhandler.`,
    );
  }

  if (!TaskAttributes) {
    throw new Error(`Missing TaskAttributes in '${TaskRouterEventTypes.taskCanceled}' event.`);
  }

  const { call_sid: callId, direction, called, from } = JSON.parse(TaskAttributes);
  const timestamp = getTime(TimestampMs);

  return [
    {
      type: CallEvents.queueAbandon,
      call_id: callId,
      timestamp,
      sid: Sid,
    },
    {
      type: CallEvents.finished,
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      timestamp,
      sid: Sid,
    },
  ];
};

/**
 * taskWrapupHandler converts the `task.wrapup` TaskRouter's
 * event to two Teravoz's events: `actor.left` AND `call.finished`
 *
 * The mapped events structure will be:
 *
 * ### actor.left
 *
|  Teravoz  |     TaskRouter's Event      |            Value            |
|:---------:|:---------------------------:|:---------------------------:|
|   type    |          EventType          | Converted into "actor.left" |
|  call_id  |   TaskAttributes.call_id    |   TaskAttributes.call_id    |
|   actor   |         WorkerName          |         WorkerName          |
|  number   | WorkerAttributes.client_uri | WorkerAttributes.client_uri |
|   queue   |        TaskQueueSid         |        TaskQueueSid         |
| timestamp |         TimestampMs         |   Timestamp UTC's string    |
|    sid    |             Sid             |     Twilio's Event Sid      |
 *
 * ### call.finished
 *
|   Teravoz    |    TaskRouter's Event    |             Value              |
|:------------:|:------------------------:|:------------------------------:|
|     type     |        EventType         | Converted into "call.finished" |
|   call_id    |  TaskAttributes.call_id  |     TaskAttributes.call_id     |
|  direction   | TaskAttributes.direction |    TaskAttributes.direction    |
|  our_number  |  TaskAttributes.called   |     TaskAttributes.called      |
| their_number |   TaskAttributes.from    |      TaskAttributes.from       |
|  timestamp   |       TimestampMs        |     Timestamp UTC's string     |
|     sid      |           Sid            |       Twilio's Event Sid       |
 *
 * @param taskRouterEvent The incoming TaskRouter's event
 */
export const taskWrapupHandler = ({
  Sid,
  EventType,
  TaskAttributes,
  TimestampMs,
  WorkerName = '',
  WorkerAttributes,
  TaskQueueSid,
}: TaskRouterEvent): [CallEvent, AgentEvent] => {
  if (EventType !== TaskRouterEventTypes.taskWrapup) {
    throw new Error(
      `Only tasks of type '${TaskRouterEventTypes.taskWrapup}' can be handled by taskWrapupHandler.`,
    );
  }

  if (!TaskAttributes) {
    throw new Error(`Missing TaskAttributes in '${TaskRouterEventTypes.taskWrapup}' event.`);
  }

  if (!WorkerAttributes) {
    throw new Error(`Missing WorkerAttributes in '${TaskRouterEventTypes.taskWrapup}' event.`);
  }

  const { call_sid: callId, direction, called, from } = JSON.parse(TaskAttributes);

  const { contact_uri: contactUri } = JSON.parse(WorkerAttributes);

  const timestamp = getTime(TimestampMs);

  return [
    {
      type: CallEvents.finished,
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      timestamp,
      sid: Sid,
    },
    {
      type: AgentEvents.left,
      call_id: callId,
      actor: WorkerName,
      number: contactUri,
      queue: TaskQueueSid,
      timestamp,
      sid: Sid,
    },
  ];
};
