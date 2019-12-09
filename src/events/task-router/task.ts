import {
  CallEvent, CallEvents, AgentEvent, AgentEvents,
} from '../teravoz';
import { getTime } from '../../date';

export const taskCreatedHandler = ({
  EventType, TaskAttributes, TimestampMs,
}: any): [CallEvent] => {
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
      timestamp: getTime(TimestampMs),
    },
  ];
};

export const taskCanceledHandler = ({
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
      timestamp: getTime(TimestampMs),
    },
  ];
};

export const taskWrapupHandler = ({
  EventType, TaskAttributes, TimestampMs, WorkerName, WorkerAttributes, TaskQueueSid,
}: any): [CallEvent, AgentEvent] => {
  if (EventType !== 'task.wrapup') {
    throw new Error("Only tasks of type 'task.wrapup' can be handled by taskWrapupHandler.");
  }

  const {
    call_sid: callId, direction, called, from,
  } = JSON.parse(TaskAttributes);

  const {
    contact_uri: contactUri,
  } = JSON.parse(WorkerAttributes);

  const timestamp = getTime(TimestampMs);

  return [
    {
      type: CallEvents.finished,
      call_id: callId,
      direction,
      our_number: called,
      their_number: from,
      timestamp,
    },
    {
      type: AgentEvents.left,
      call_id: callId,
      actor: WorkerName,
      number: contactUri,
      queue: TaskQueueSid,
      timestamp,
    },
  ];
};
