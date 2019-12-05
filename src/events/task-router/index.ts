import { eventsMapping } from './events-map';

/* eslint-disable @typescript-eslint/camelcase */

export const taskRouterEventHandler = (event: any) => {
  const mapEvent = eventsMapping[event.EventType];

  if (mapEvent) {
    return mapEvent(event);
  }

  return [];
};
