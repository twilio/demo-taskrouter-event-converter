import {
  CallEvent, CallEvents, AgentEvent, AgentEvents,
} from '../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent } from '../../twilio';

export const taskCreatedHandler = ({
  Sid, EventType, TaskAttributes, TimestampMs,
}: TaskRouterEvent): [CallEvent] => {
  if (EventType !== 'task.created') {
    throw new Error("Only tasks of type 'task.created' can be handled by taskCreatedHandler.");
  }

  if (!TaskAttributes) {
    throw new Error("Missing TaskAttributes in 'task.created' event.");
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
      sid: Sid,
    },
  ];
};

export const taskCanceledHandler = ({
  Sid, EventType, TaskAttributes, TimestampMs,
}: TaskRouterEvent): CallEvent[] => {
  if (EventType !== 'task.canceled') {
    throw new Error("Only tasks of type 'task.canceled' can be handled by taskCanceledhandler.");
  }

  if (!TaskAttributes) {
    throw new Error("Missing TaskAttributes in 'task.canceled' event.");
  }

  const { call_sid: callId } = JSON.parse(TaskAttributes);

  return [
    {
      type: CallEvents.queueAbandon,
      call_id: callId,
      timestamp: getTime(TimestampMs),
      sid: Sid,
    },
  ];
};

export const taskWrapupHandler = ({
  Sid, EventType, TaskAttributes, TimestampMs, WorkerName, WorkerAttributes, TaskQueueSid,
}: TaskRouterEvent): [CallEvent, AgentEvent] => {
  if (EventType !== 'task.wrapup') {
    throw new Error("Only tasks of type 'task.wrapup' can be handled by taskWrapupHandler.");
  }

  if (!TaskAttributes) {
    throw new Error("Missing TaskAttributes in 'task.wrapup' event.");
  }

  if (!WorkerAttributes) {
    throw new Error("Missing WorkerAttributes in 'task.wrapup' event.");
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
      sid: Sid,
    },
    {
      type: AgentEvents.left,
      call_id: callId,
      actor: WorkerName || '',
      number: contactUri,
      queue: TaskQueueSid,
      timestamp,
      sid: Sid,
    },
  ];
};
