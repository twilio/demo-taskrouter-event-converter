import moment from 'moment';

/**
 * getTime returns a string that represents the time that the event was emitted.
 * The value returned is the representation of the time in UTC.
 */
export const getTime = (timestampMs: string | number): string => moment(+timestampMs)
  .utc()
  .format();
