import { eventsMapping } from './events-map';
import { TeravozEvent } from '../teravoz';

export const taskRouterEventConverter = (event: any): TeravozEvent[] => {
  const mapEvent = eventsMapping[event.EventType];

  if (mapEvent) {
    return mapEvent(event);
  }

  return [];
};
