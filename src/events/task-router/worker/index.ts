import { AgentEvents, AgentEvent } from '../../../teravoz';
import { getTime } from '../../../date';
import { TaskRouterEvent, TaskRouterEventTypes } from '../../../twilio';
import { logger } from '../../../logger';

/**
 * workerStatus represents all the Twilio's activites names that is
 * present in the TaskRouter. This constant exists because the TaskRouter's
 * activites names is fully customizable, so if the activites name is changed, modifying this
 * map values should be enough to adapt the code.
 *
 * For example, case the available status is renamed to `online`, then changing
 * the available key value to `online` should be enough to the code work correctly.
 */
export const workerStatus = {
  available: 'available',
  break: 'break',
  unavailable: 'unavailable',
  offline: 'offline',
};

/**
 * WorkerActivityConvert is a helper class that provide utils to convert each Twilio's
 * TaskRouter event to multiple similar Teravoz's events where only the `queue` attribute varies.
 *
 * For example, when a Worker (agent) set his state as available in Twilio Flex, then an
 * `actor.logged-in` event will be emitted for **each** queue that this worker belongs to.
 * These events will be almost identical, and only the queue will change.
 */
class WorkerActivityConverter {
  /**
   * Creates a new WorkerActivityConvert instance
   * @param event The TaskRouter's event that is being proccessed
   *
   * @param number The representations of the Worker (agent) number, that usually isn't a
   * simple number but a contact_uri like `client:agentname`
   *
   * @param queues The array of queues which every event will be mapped for
   */
  constructor(private event: TaskRouterEvent, private number: string, private queues: string[]) {
    this.event = event;
    this.number = number;
    this.queues = queues;
  }

  /**
   * mapEventsByQueues receives a Teravoz's event type and produces an event within it
   * to each queue that was provided on the creation of this class. The number present in
   * these events will also be the number that was provided in the class constructor.
   *
   * @param type The type of event to be replicated to each queue
   */
  public mapEventsByQueues(type: AgentEvents): AgentEvent[] {
    const { WorkerName = '', TimestampMs, Sid } = this.event;

    return this.queues.map(
      (queue): AgentEvent => ({
        type,
        number: this.number,
        actor: WorkerName,
        timestamp: getTime(TimestampMs),
        sid: Sid,
        queue,
      }),
    );
  }
}

/**
 * workerActivityUpdateHandler converts a TaskRouter's worker.activity.update to
 * an array of AgentEvents.
 *
 * The event(s) that will be emitted will rely on the worker previous activity name and on the
 * new worker activity name. The number of events returned will depends of the number of queues
 * that this worker is assigned to, checked by the WorkerAttributes at the property `queues`.
 *
 * The transitions below represents the events that are emitted based on worker previous and
 * actual state:
 *
|    From     |     To      |      Result      |
|:-----------:|:-----------:|:----------------:|
|   offline   |  available  | actor.logged-in  |
|   offline   |    break    |   actor.paused   |
|  available  |   offline   | actor.logged-out |
|  available  |    break    |   actor.paused   |
|  available  | unavailable | actor.logged-out |
|    break    |   offline   | actor.logged-out |
|    break    |  available  |  actor.unpaused  |
|    break    | unavailable | actor.logged-out |
| unavailable |  available  | actor.logged-in  |
| unavailable |    break    |   actor.paused   |
| unavailable |   offline   |        -         |
| unavailable | unavailable |        -         |
|    break    |    break    |        -         |
|  available  |  available  |        -         |
|   offline   | unavailable |        -         |
|   offline   |   offline   |        -         |

When there isn't a result mapped, an empty array will be returned by the function

The structure of the converted events will be the follow:
 *
|  Teravoz  |            Twilio            |                      Value                       |
|:---------:|:----------------------------:|:------------------------------------------------:|
|   type    |          EventType           | Depends of the worker previous and actual status |
|  number   | WorkerAttributes.contact_uri |           WorkerAttributes.contact_uri           |
|   actor   |          WorkerName          |                    WorkerName                    |
|   queue   |  WorkerAttributes.queues[i]  |      (each) queue that the agent belongs to      |
| timestamp |         TimestampMs          |              Timestamp UTC's string              |
|    sid    |             Sid              |                Twilio's Event Sid                |
 *
 * @param taskRouterEvent The incoming TaskRouter's event to be converted to AgentEvents
 */
export const workerActivityUpdateHandler = (taskRouterEvent: TaskRouterEvent): AgentEvent[] => {
  const {
    EventType,
    WorkerActivityName,
    WorkerPreviousActivityName,
    WorkerAttributes,
  } = taskRouterEvent;

  if (EventType !== TaskRouterEventTypes.workerActivityUpdate) {
    throw new Error(
      `Only tasks of type '${TaskRouterEventTypes.workerActivityUpdate}' can be handled by workerActivityUpdateHandler.`,
    );
  }

  if (!WorkerAttributes) {
    throw new Error(
      `Missing WorkerAttributes in '${TaskRouterEventTypes.workerActivityUpdate}' event.`,
    );
  }

  if (!WorkerActivityName) {
    throw new Error(
      `Missing WorkerActivityName in '${TaskRouterEventTypes.workerActivityUpdate} event.`,
    );
  }

  if (WorkerPreviousActivityName === WorkerActivityName) {
    return [];
  }

  const { contact_uri: contactUri, queues = [] } = JSON.parse(WorkerAttributes);

  if (!queues.length) {
    logger.warn(
      `Worker ${contactUri} doesn't belong to any queue. Events will be not emitted for this worker.`,
    );
    return [];
  }

  const converter = new WorkerActivityConverter(taskRouterEvent, contactUri, queues);

  switch (WorkerActivityName.toLowerCase()) {
    case workerStatus.available: {
      if (
        WorkerPreviousActivityName &&
        WorkerPreviousActivityName.toLowerCase() === workerStatus.break
      ) {
        return converter.mapEventsByQueues(AgentEvents.unpaused);
      }

      return converter.mapEventsByQueues(AgentEvents.loggedIn);
    }
    case workerStatus.unavailable:
    case workerStatus.offline:
      if (
        WorkerPreviousActivityName &&
        WorkerPreviousActivityName.toLowerCase() !== workerStatus.unavailable
      ) {
        return converter.mapEventsByQueues(AgentEvents.loggedOut);
      }

      return [];
    case workerStatus.break:
      return converter.mapEventsByQueues(AgentEvents.paused);
    default:
      return [];
  }
};
