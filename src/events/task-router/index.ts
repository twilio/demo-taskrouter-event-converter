import { eventsMapping } from './events-map';
import { TeravozEvent } from '../teravoz';
import { TaskRouterEvent } from '../twilio';

export const taskRouterEventConverter = (event: TaskRouterEvent): TeravozEvent[] => {
  const mapEvent = eventsMapping[event.EventType];

  if (mapEvent) {
    return mapEvent(event);
  }

  return [];
};
