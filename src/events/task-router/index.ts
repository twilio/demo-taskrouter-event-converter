import { eventsMapping } from './events-map';
import { TeravozEvent } from '../teravoz';
import { TaskRouterEvent } from '../twilio';
import { converter } from '../converter';

export const taskRouterEventConverter = (event: TaskRouterEvent): TeravozEvent[] => converter(eventsMapping, event.EventType, event);
