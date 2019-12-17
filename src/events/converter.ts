import { TeravozEvent } from './teravoz';

/**
 * Abstract converter structure to be used as the conversion function to incomming Twilio's events
 *
 * @param mapping the event conversion mapping, that should be an object with the Twilio's
 * event identifier as key and the handler function to convert it to TeravozEvent[] as value.
 *
 * @param eventType the identifier of the actual incoming event; the handler for this event will
 * be searched inside the `mapping` parameter. If there's not a handler for this event, then an
 * empty array will be returned
 *
 * @param event The original Twilio event that triggered the conversor call,
 * to be used by the event handler to make the convertion
 */

export const converter = (
  mapping: Record<string, any>,
  eventType: string,
  event: any,
): TeravozEvent[] => {
  const handler = mapping[eventType];

  if (handler) {
    return handler(event);
  }

  return [];
};
