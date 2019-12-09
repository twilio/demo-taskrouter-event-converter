import moment from 'moment';

export const getTime = (timestampMs: string | number): string => moment(+timestampMs)
  .utc()
  .format();
