import {
  AgentEvent, AgentEvents, CallEvent, CallEvents,
} from '../../teravoz';
import { getTime } from '../../../date';

export const reservationCreatedHandler = ({
  EventType, TaskAttributes, WorkerName, WorkerAttributes, TaskQueueSid, TimestampMs,
}: any): [AgentEvent] => {
  if (EventType !== 'reservation.created') {
    throw new Error("Only tasks of type 'reservation.created' can be handled by reservationCreatedHandler.");
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
    },
  ];
};

export const reservationAcceptedHandler = ({
  EventType, TaskAttributes, WorkerName, WorkerAttributes, TaskQueueSid, TimestampMs,
}: any): [AgentEvent, CallEvent] => {
  if (EventType !== 'reservation.accepted') {
    throw new Error("Only tasks of type 'reservation.accepted' can be handled by reservationAcceptedHandler.");
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
    },
    {
      type: CallEvents.ongoing,
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      timestamp: getTime(TimestampMs),
    },
  ];
};

export const reservationRejectedHandler = ({
  EventType, TaskAttributes, WorkerAttributes, WorkerName, TaskAge, TaskQueueSid, TimestampMs,
}: any): [AgentEvent] => {
  if (EventType !== 'reservation.rejected') {
    throw new Error("Only tasks of type 'reservation.rejected' can be handled by reservationRejectedHandler.");
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
      ringtime: TaskAge,
      timestamp: getTime(TimestampMs),
    },
  ];
};
