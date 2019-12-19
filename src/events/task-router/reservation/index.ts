import {
  AgentEvent, AgentEvents, CallEvent, CallEvents,
} from '../../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent, TaskRouterEventTypes } from '../../../twilio';

/**
 * reservationCreateHandler converts the TaskRouter's event `reservation.created`
 * to the equivalent Teravoz's event `actor.ringing`.
 *
 * When a reservation is created at TaskRouter, the call starts ringing to the agent
 * on the Twilio's Flex, where the agent can accept or decline the call.
 *
 * The structure of the converted event is described below:
 *
|  Teravoz  |      TaskRouter's Event      |             Value              |
|:---------:|:----------------------------:|:------------------------------:|
|   type    |          EventType           | Converted into "actor.ringing" |
|  call_id  |   TaskAttributes.call_sid    |    TaskAttributes.call_sid     |
|   actor   |          WorkerName          |           WorkerName           |
|  number   | WorkerAttributes.contact_uri |  WorkerAttributes.contact_uri  |
|   queue   |         TaskQueueSid         |          TaskQueueSid          |
| timestamp |         TimestampMs          |     Timestamp UTC's string     |
|    sid    |             Sid              |       Twilio's Event Sid       |

 * @param TaskRouterEvent The incoming TaskRouter's event
 */
export const reservationCreatedHandler = ({
  Sid, EventType, TaskAttributes, WorkerName = '', WorkerAttributes, TaskQueueSid, TimestampMs,
}: TaskRouterEvent): [AgentEvent] => {
  if (EventType !== TaskRouterEventTypes.reservationCreated) {
    throw new Error(`Only tasks of type '${TaskRouterEventTypes.reservationCreated}' can be handled by reservationCreatedHandler.`);
  }

  if (!TaskAttributes) {
    throw new Error(`Missing TaskAttributes in '${TaskRouterEventTypes.reservationCreated}' event.`);
  }

  if (!WorkerAttributes) {
    throw new Error(`Missing WorkerAttributes in '${TaskRouterEventTypes.reservationCreated}' event.`);
  }

  const { call_sid: callId } = JSON.parse(TaskAttributes);
  const { contact_uri: contactUri } = JSON.parse(WorkerAttributes);

  return [
    {
      type: AgentEvents.ringing,
      call_id: callId,
      actor: WorkerName,
      number: contactUri,
      queue: TaskQueueSid,
      timestamp: getTime(TimestampMs),
      sid: Sid,
    },
  ];
};

/**
 * reservationAcceptedHandler converts the TaskRouter's event `reservation.accepted`
 * into the Teravoz's events `actor.ringing` AND `call.ongoing`.
 *
 * When a reservation is accepted, the call gets out of the waiting state and the
 * agent is connected to it. That's why either the `actor.ringing` and `call.ongoing`
 * are converted from the same event.
 *
 * The structures of the converted events are described below:
 *
 * ### actor.entered
 *
|  Teravoz  |      TaskRouter's Event      |             Value              |
|:---------:|:----------------------------:|:------------------------------:|
|   type    |          EventType           | Converted into "actor.entered" |
|  call_id  |   TaskAttributes.call_sid    |    TaskAttributes.call_sid     |
|   actor   |          WorkerName          |           WorkerName           |
|  number   | WorkerAttributes.contact_uri |  WorkerAttributes.contact_uri  |
|   queue   |         TaskQueueSid         |          TaskQueueSid          |
| timestamp |         TimestampMs          |     Timestamp UTC's string     |
|    sid    |             Sid              |       Twilio's Event Sid       |

 * ### call.ongoing
|   Teravoz    |          Twilio          |             Value             |
|:------------:|:------------------------:|:-----------------------------:|
|     type     |        EventType         | Converted into "call.ongoing" |
|   call_id    |  TaskAttributes.call_id  |    TaskAttributes.call_id     |
|  direction   | TaskAttributes.direction |   TaskAttributes.direction    |
|  our_number  |  TaskAttributes.called   |     TaskAttributes.called     |
| their_number |   TaskAttributes.from    |      TaskAttributes.from      |
|  timestamp   |       TimestampMs        |    Timestamp UTC's string     |
|     sid      |           Sid            |      Twilio's Event Sid       |

 * @param TaskRouterEvent The incoming TaskRouter's event
 */
export const reservationAcceptedHandler = ({
  Sid, EventType, TaskAttributes, WorkerName = '', WorkerAttributes, TaskQueueSid, TimestampMs,
}: TaskRouterEvent): [AgentEvent, CallEvent] => {
  if (EventType !== TaskRouterEventTypes.reservationAccepted) {
    throw new Error(`Only tasks of type '${TaskRouterEventTypes.reservationAccepted}' can be handled by reservationAcceptedHandler.`);
  }

  if (!TaskAttributes) {
    throw new Error(`Missing TaskAttributes in '${TaskRouterEventTypes.reservationAccepted}' event `);
  }

  if (!WorkerAttributes) {
    throw new Error(`Missing WorkerAttributes in '${TaskRouterEventTypes.reservationAccepted}' event `);
  }

  const {
    call_sid: callId, direction, called, from,
  } = JSON.parse(TaskAttributes);

  const {
    contact_uri: contactUri,
  } = JSON.parse(WorkerAttributes);

  return [
    {
      type: AgentEvents.entered,
      call_id: callId,
      actor: WorkerName,
      number: contactUri,
      queue: TaskQueueSid,
      timestamp: getTime(TimestampMs),
      sid: Sid,
    },
    {
      type: CallEvents.ongoing,
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
 * reservationRejectedHandler converts the TaskRouter's event `reservation.rejected`
 * into the Teravoz event `actor.noanswer`
 *
 * A reservation is rejected either when the agent declines the call or if he doesn't
 * answer the call in time. In these two cases, the reservation / call is considered
 * not answered by the agent.
 *
 * The structures of the converted event is described below:
 *
|  Teravoz  |      TaskRouter's Event      |              Value              |
|:---------:|:----------------------------:|:-------------------------------:|
|   type    |          EventType           | Converted into "actor.noanswer" |
|  call_id  |   TaskAttributes.call_sid    |     TaskAttributes.call_sid     |
|   actor   |          WorkerName          |           WorkerName            |
|  number   | WorkerAttributes.contact_uri |  WorkerAttributes.contact_uri   |
|   queue   |         TaskQueueSid         |          TaskQueueSid           |
| ringtime  |           TaskAge            |             TaskAge             |
| timestamp |         TimestampMs          |     Timestamp UTC's string      |
|    sid    |             Sid              |       Twilio's Event Sid        |

 * @param TaskRouterEvent The incoming TaskRouter's event
 */
export const reservationRejectedHandler = ({
  Sid, EventType, TaskAttributes, WorkerAttributes, WorkerName = '', TaskAge, TaskQueueSid, TimestampMs,
}: TaskRouterEvent): [AgentEvent] => {
  if (EventType !== TaskRouterEventTypes.reservationRejected) {
    throw new Error(`Only tasks of type '${TaskRouterEventTypes.reservationRejected}' can be handled by reservationRejectedHandler.`);
  }

  if (!TaskAttributes) {
    throw new Error(`Missing TaskAttributes in '${TaskRouterEventTypes.reservationRejected}' event `);
  }

  if (!WorkerAttributes) {
    throw new Error(`Missing WorkerAttributes in '${TaskRouterEventTypes.reservationRejected}' event `);
  }

  const {
    call_sid: callId,
  } = JSON.parse(TaskAttributes);

  const {
    contact_uri: contactUri,
  } = JSON.parse(WorkerAttributes);

  return [
    {
      type: AgentEvents.noanswer,
      call_id: callId,
      actor: WorkerName,
      number: contactUri,
      queue: TaskQueueSid,
      ringtime: (TaskAge && +TaskAge) || 0,
      timestamp: getTime(TimestampMs),
      sid: Sid,
    },
  ];
};
