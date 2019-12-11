import {
  AgentEvent, AgentEvents, CallEvent, CallEvents,
} from '../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent } from '../../twilio';

export const reservationCreatedHandler = ({
  Sid, EventType, TaskAttributes, WorkerName = '', WorkerAttributes, TaskQueueSid, TimestampMs,
}: TaskRouterEvent): [AgentEvent] => {
  if (EventType !== 'reservation.created') {
    throw new Error("Only tasks of type 'reservation.created' can be handled by reservationCreatedHandler.");
  }

  if (!TaskAttributes) {
    throw new Error("Missing TaskAttributes in 'reservation.created' event.");
  }

  if (!WorkerAttributes) {
    throw new Error("Missing WorkerAttributes in 'reservation.created' event.");
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

export const reservationAcceptedHandler = ({
  Sid, EventType, TaskAttributes, WorkerName = '', WorkerAttributes, TaskQueueSid, TimestampMs,
}: TaskRouterEvent): [AgentEvent, CallEvent] => {
  if (EventType !== 'reservation.accepted') {
    throw new Error("Only tasks of type 'reservation.accepted' can be handled by reservationAcceptedHandler.");
  }

  if (!TaskAttributes) {
    throw new Error("Missing TaskAttributes in 'reservation.accepted' event ");
  }

  if (!WorkerAttributes) {
    throw new Error("Missing WorkerAttributes in 'reservation.accepted' event ");
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

export const reservationRejectedHandler = ({
  Sid, EventType, TaskAttributes, WorkerAttributes, WorkerName = '', TaskAge, TaskQueueSid, TimestampMs,
}: TaskRouterEvent): [AgentEvent] => {
  if (EventType !== 'reservation.rejected') {
    throw new Error("Only tasks of type 'reservation.rejected' can be handled by reservationRejectedHandler.");
  }

  if (!TaskAttributes) {
    throw new Error("Missing TaskAttributes in 'reservation.rejected' event ");
  }

  if (!WorkerAttributes) {
    throw new Error("Missing WorkerAttributes in 'reservation.rejected' event ");
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
