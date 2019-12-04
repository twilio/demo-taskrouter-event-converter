export interface Event {
  type: string;
  timestamp: string;
}

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

export interface CallEvent extends Event {
  type: CallEvents;
  call_id: string;
  direction: string;
  our_number: string;
  their_number: string;
  code?: string;
}

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

export interface AgentEvent extends Event {
  type: AgentEvents;
  actor: string;
  number: string;
  call_id?: string;
  code?: string;
  ringtime?: number;
}
