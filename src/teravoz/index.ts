/**
 * TeravozEvent is an interface that represents the common properties
 * between each Teravoz's event
 */
export interface TeravozEvent extends Record<string, any> {
  type: string;
  timestamp: string;
  sid?: string;
}

/**
 * CallEvents represents all the event types related to `call`.
 */
export enum CallEvents {
  cnpjProvided = 'call.cnpj-provided',
  cpfProvided = 'call.cpf-provided',
  dataProvided = 'call.data-provided',
  finished = 'call.finished',
  folllowMe = 'call.follow-me',
  new = 'call.new',
  ongoing = 'call.ongoing',
  overflow = 'call.overflow',
  queueAbandon = 'call.queue-abandon',
  standby = 'call.standby',
  waiting = 'call.waiting',
}

/**
 * CallEvent is the representation of a Teravoz's call event. It represents
 * all the events that has the type of a call event (see [[CallEvents]])
 * @extends TeravozEvent
 */
export interface CallEvent extends TeravozEvent {
  type: CallEvents;
  call_id: string;
  direction?: string;
  our_number?: string;
  their_number?: string;
  code?: string;
  nps?: string;
  data?: string;
}

/**
 * AgentEvents represents all the event types related to `actor`.
 */
export enum AgentEvents {
  entered = 'actor.entered',
  loggedIn = 'actor.logged-in',
  loggedOut = 'actor.logged-out',
  left = 'actor.left',
  noanswer = 'actor.noanswer',
  paused = 'actor.paused',
  ringing = 'actor.ringing',
  unpaused = 'actor.unpaused'
}

/**
 * AgentEvent is the representation of a Teravoz's actor event. It represents all the event
 * that has the type of a `actor` event (see [[AgentEvents]]).
 *
 * @extends TeravozEvent
 */
export interface AgentEvent extends TeravozEvent {
  type: AgentEvents;
  actor: string;
  number: string;
  queue?: string;
  call_id?: string;
  code?: string;
  ringtime?: number;
}

/**
 * DialerEvents represents all the event types related to `dialer`
 */
export enum DialerEvents {
  dialerAttempt = 'dialer.attempt',
  dialerSuccess = 'dialer.success',
  dialerFailure = 'dialer.failure',
  dialerExpired = 'dialer.expired',
  dialerExceeded = 'dialer.exceeded',
}

export type TeravozAmdStatus = 'human' | 'machine' | 'notsure';
export type FailureReasons = 'machine' | 'notsure' | 'noanswer' | 'busy' | 'unavailable' | 'invalid'

/**
 * DialerEvent is the representation of a Teravoz's dialer event. It represents all the event
 * that has the type of a `actor` event (see [[DialerEvents]]).
 *
 * @extends TeravozEvent
 */
export interface DialerEvent extends TeravozEvent {
  type: DialerEvents;
  number: string;
  code?: string;
  call_id?: string;
  amd_status?: string | null;
  reason?: TeravozAmdStatus;
}
