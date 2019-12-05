import moment from 'moment';
import { CallEvent, CallEvents } from '../teravoz';

export const taskCreatedHandler = ({
  EventType, TaskAttributes, TimestampMs,
}: any): CallEvent[] => {
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
      timestamp: moment(+TimestampMs).format(),
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
      timestamp: moment(+TimestampMs).format(),
    },
  ];
};
