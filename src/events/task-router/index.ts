import { eventsMapping } from './events-map';
import { TeravozEvent } from '../teravoz';
import { TaskRouterEventTypes } from '../twilio';

interface IncommingEvent extends Record<string, any> {
  EventType: TaskRouterEventTypes;
}

export const taskRouterEventConverter = (event: IncommingEvent): TeravozEvent[] => {
  const mapEvent = eventsMapping[event.EventType];

  if (mapEvent) {
    return mapEvent(event);
  }

  return [];
};
