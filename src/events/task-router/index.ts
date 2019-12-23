import { eventsMapping } from './events-map';
import { TeravozEvent } from '../../teravoz';
import { TaskRouterEvent } from '../../twilio';
import { converter } from '../converter';

/**
 * taskRouterEventConverter receives any TaskRouterEvent and convert it to an array of
 * Teravoz's events. If the event provided to convert has not a mapped conversion, then
 * an empty array will be returned.
 *
 * @param event The original TaskRouter event to be converted
 */
export const taskRouterEventConverter = (event: TaskRouterEvent): TeravozEvent[] =>
  converter(eventsMapping, event.EventType, event);
