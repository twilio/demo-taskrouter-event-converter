# TaskRouter Event Converter

# Table of Contents

- [Summary](#summary)
  * [Task events](#task-events)
  * [Task Queue Events](#task-queue-events)
  * [Reservation Events](#reservation-events)
  * [Worker Events](#worker-events)
- [Dialer events](#dialer-events)
- [Converted Inputs](#converted-inputs)
- [Conversion Mapping](#conversion-mapping)
  * [Call Events](#call-events)
    + [call.new](#callnew)
    + [call.waiting](#callwaiting)
    + [call.ongoing](#callongoing)
    + [call.queue-abandon](#callqueue-abandon)
    + [call.finished](#callfinished)
  * [Data events](#data-events)
  * [Actor events](#actor-events)
    + [actor.logged-in](#actorlogged-in)
    + [actor.logged-out](#actorlogged-out)
    + [actor.entered](#actorentered)
    + [actor.left](#actorleft)
    + [actor.ringing](#actorringing)
    + [actor.noanswer](#actornoanswer)
    + [actor.paused](#actorpaused)
    + [actor.unpaused](#actorunpaused)
  * [Dialer Events](#dialer-events)
    + [dialer.attempt](#dialerattempt)
    + [dialer.success](#dialersuccess)
    + [dialer.failure](#dialerfailure)
    + [dialer.expired](#dialerexpired)
    + [dialer.exceeded](#dialerexceeded)
- [Points to Review](#points-to-review)
- [Missing fields](#missing-fields)
  * [General](#general)
  * [call.new](#callnew-1)
  * [actor.* events](#actor-events)

# Summary
In general, most of the fields that exists on Teravoz's events could be converted from TaskRouter events. The main differences are on **number** fields when they're related to the agent. As in Twilio Flex the agents doesn't have a real peer number, the information present on this number fact is, actually, the `contact_uri` present on the Worker attributes. So,for an agent named `foo` is using flex, the number of the agent provided in the events will be equal to `client:foo`, and not a real peer number. 

Also, when the `queue` attribute is converted, it is converted to the TaskQueue SID, that also is not a phone number.

By the way, here is the list of the Task Router's events and their representation as teravoz events:

## Task events
* task.created -> **call.new**
* task.canceled -> **call.queue-abandon**
* task.wrapup -> **call.finished** AND **actor.left**

## Task Queue Events
* task-queue.entered -> **call.waiting**

## Reservation Events
* reservation.accepted -> **actor.entered** AND **call.ongoing**
* reservation.rejected -> **actor.noanswer**
* reservation.created -> **actor.ringing**

## Worker Events
*  worker.activity.update -> varies considering the WorkerActivityName:
* * If the WorkerActivityName is equal to `available` and he was not already available on the queue, then an **actor.logged-in** event is produced
* * If the WorkerActivityName is equal to `unavailable` or `offline`, while the agent was already not in these two status, then an **actor.logged-out** is produced
* * If the WorkerActivityName is equal to `break`, and the user was not already in the `break` status, then an **actor.paused** is produced
* * At least, if the WorkerActivityName is equal to available and the agent was in a break, then an **actor.unpaused** is produced.

# Dialer events

The Dialer's events are different from the TaskRouter's events. The Dialer's events aren't a default from Twilio, since the dialer itself is a custom implementation made by Teravoz. Therefore, these events are triggered manually in the Dialer's code by sending a POST to the `/dialer` endpoint.

By default, these dialer events names are defined by the name that it represents in Teravoz's events with the prefix `custom.`. So, the conversion of the events are simple:

* custom.dialer.attempt -> **dialer.attempt**
* custom.dialer.success -> **dialer.success**
* custom.dialer.failure -> **dialer.failure**
* custom.dialer.expired -> **dialer.expired**
* custom.dialer.exceeded -> **dialer.exceeded**


# Converted Inputs
The user inputs events are generated by custom Twilio's function and are not received by POSTing the `/webhook` endpoint. Instead, the input data will be received on the `/input` route, and will also convert the received input to Teravoz's events. As these events aren't officialy emitted by task-router, they've fully customizable names that can be changed. For now, only the NPS input gathered by user is converted:

* custom.nps-provided -> **call.data-provided**, with the fields `data` and `nps` filled with the user evaluation of the call.


# Conversion Mapping

Each conversion handler is docummented with the conversion of the fields from Taskrouter's events to Teravoz's events, and you can view then generating the docs using `yarn docs` or `npm run docs`, after you properly install the project dependencies.

Also, for reference, the conversion mapping of the fields from the events are described below.

## Call Events

### call.new

Converted from EventType `task.created`, when a task (call) starts. 

|   Teravoz    |    TaskRouter's Event    |           Value           |
|:------------:|:------------------------:|:-------------------------:|
|     type     |        EventType         | Converted into "call.new" |
|   call_id    |  TaskAttributes.call_id  |  TaskAttributes.call_id   |
|  direction   | TaskAttributes.direction | TaskAttributes.direction  |
|  our_number  |  TaskAttributes.called   |   TaskAttributes.called   |
| their_number |   TaskAttributes.from    |    TaskAttributes.from    |
|  timestamp   |       TimestampMs        |  Timestamp UTC's string   |
|     sid      |           Sid            |    Twilio's Event Sid     |

### call.waiting

Converted from EventType `task-queue.entered`, when a task (call) enters
in a queue and is waiting to be answered. 

|   Teravoz    |    TaskRouter's Event    |             Value             |
|:------------:|:------------------------:|:-----------------------------:|
|     type     |        EventType         | Converted into "call.waiting" |
|   call_id    |  TaskAttributes.call_id  |    TaskAttributes.call_id     |
|  direction   | TaskAttributes.direction |   TaskAttributes.direction    |
|  our_number  |  TaskAttributes.called   |     TaskAttributes.called     |
| their_number |   TaskAttributes.from    |      TaskAttributes.from      |
|    queue     |       TaskQueueSid       |         TaskQueueSid          |
|  timestamp   |       TimestampMs        |    Timestamp UTC's string     |
|     sid      |           Sid            |      Twilio's Event Sid       |

### call.ongoing

Converted from EventType `reservation.accepted`, when a worker accepts an incoming task (call).

The `actor.entered` is originated from the same event.

|   Teravoz    |    TaskRouter's Event    |             Value             |
|:------------:|:------------------------:|:-----------------------------:|
|     type     |        EventType         | Converted into "call.ongoing" |
|   call_id    |  TaskAttributes.call_id  |    TaskAttributes.call_id     |
|  direction   | TaskAttributes.direction |   TaskAttributes.direction    |
|  our_number  |  TaskAttributes.called   |     TaskAttributes.called     |
| their_number |   TaskAttributes.from    |      TaskAttributes.from      |
|  timestamp   |       TimestampMs        |    Timestamp UTC's string     |
|     sid      |           Sid            |      Twilio's Event Sid       |


### call.queue-abandon

Converted from EventType `task.canceled`, when a task (call) is canceled by the caller; In other words, it's triggered when the caller cancels the call before it gets answered by the callee. 

|  Teravoz  |   TaskRouter's Event   |                Value                |
|:---------:|:----------------------:|:-----------------------------------:|
|   type    |       EventType        | Converted into "call.queue-abandon" |
|  call_id  | TaskAttributes.call_id |       TaskAttributes.call_id        |
| timestamp |      TimestampMs       |       Timestamp UTC's string        |
|    sid    |          Sid           |         Twilio's Event Sid          |
 
### call.finished

Converted from EventType `task.wrapup`, when a task (call) enters in the wrapup state; in other words, this event is triggered when either the agent or the caller hangs up, and the agent enters in the wrapup status.

The `actor.left` is also originated from the `task.wrapup` event.

|   Teravoz    |    TaskRouter's Event    |             Value              |
|:------------:|:------------------------:|:------------------------------:|
|     type     |        EventType         | Converted into "call.finished" |
|   call_id    |  TaskAttributes.call_id  |     TaskAttributes.call_id     |
|  direction   | TaskAttributes.direction |    TaskAttributes.direction    |
|  our_number  |  TaskAttributes.called   |     TaskAttributes.called      |
| their_number |   TaskAttributes.from    |      TaskAttributes.from       |
|  timestamp   |       TimestampMs        |     Timestamp UTC's string     |
|     sid      |           Sid            |       Twilio's Event Sid       |

## Data events

Converted from `custom.nps-provided`, that is triggered when the caller answer the NPS survey.

|  Teravoz  | Twilio Input Event |                Value                |
|:---------:|:------------------:|:-----------------------------------:|
|   type    |     InputType      | Converted into "call.data-provided" |
|  call_id  |      CallSid       |               CallSid               |
|    nps    |       Digits       |               Digits                |
|   data    |       Digits       |               Digits                |
| timestamp |    TimestampMs     |       Timestamp UTC's string        |
 
## Actor events
 
### actor.logged-in

Converted from EventType `worker.activity.update`, when the worker changes his state
from unavailable/offline to available

This converted event is triggered multiple times, based on each queue that the worker belongs to. So, if the worker belongs to queues 900, 901 and 902, three `actor.logged-in` events will be sended to the webhook, each one for a different queue in the list.

|  Teravoz  |      TaskRouter's Event      |                 Value                  |
|:---------:|:----------------------------:|:--------------------------------------:|
|   type    |          EventType           |            actor.logged-in             |
|  number   | WorkerAttributes.contact_uri |      WorkerAttributes.contact_uri      |
|   actor   |          WorkerName          |               WorkerName               |
|   queue   |  WorkerAttributes.queues[i]  | (each) queue that the agent belongs to |
| timestamp |         TimestampMs          |         Timestamp UTC's string         |
|    sid    |             Sid              |           Twilio's Event Sid           |

### actor.logged-out

Converted from EventType `worker.activity.update`, when the worker changes his state
from available to unavailable/offline.

This converted event is triggered multiple times, based on each queue that the worker belongs to. So, if the worker belongs to queues 900, 901 and 902, three `actor.logged-out` events will be sended to the webhook, each one for a different queue in the list.

|  Teravoz  |      TaskRouter's Event      |                 Value                  |
|:---------:|:----------------------------:|:--------------------------------------:|
|   type    |          EventType           |            actor.logged-out            |
|  number   | WorkerAttributes.contact_uri |      WorkerAttributes.contact_uri      |
|   actor   |          WorkerName          |               WorkerName               |
|   queue   |  WorkerAttributes.queues[i]  | (each) queue that the agent belongs to |
| timestamp |         TimestampMs          |         Timestamp UTC's string         |
|    sid    |             Sid              |           Twilio's Event Sid           |

### actor.entered

Converted from EventType `reservation.accepted`, when a worker accepts an incoming task (call).

The `call.ongoing` is originated from the same event.

|  Teravoz  |      TaskRouter's Event      |             Value              |
|:---------:|:----------------------------:|:------------------------------:|
|   actor   |          WorkerName          |           WorkerName           |
|  number   | WorkerAttributes.contact_uri |  WorkerAttributes.contact_uri  |
|    sid    |             Sid              |       Twilio's Event Sid       |
| timestamp |         TimestampMs          |     Timestamp UTC's string     |
|   queue   |         TaskQueueSid         |          TaskQueueSid          |
|  call_id  |   TaskAttributes.call_sid    |    TaskAttributes.call_sid     |
|   type    |          EventType           | Converted into "actor.entered" |

### actor.left

Converted from EventType `task.wrapup`, when a task (call) enters in the wrapup state; in other words, this event is triggered when either the agent or the caller hangs up, and the agent enters in the wrapup status.

The `call.finished` is also originated from the `task.wrapup` event.

|  Teravoz  |     TaskRouter's Event      |            Value            |
|:---------:|:---------------------------:|:---------------------------:|
|   type    |          EventType          | Converted into "actor.left" |
|  call_id  |   TaskAttributes.call_id    |   TaskAttributes.call_id    |
|   actor   |         WorkerName          |         WorkerName          |
|  number   | WorkerAttributes.client_uri | WorkerAttributes.client_uri |
|   queue   |        TaskQueueSid         |        TaskQueueSid         |
| timestamp |         TimestampMs         |   Timestamp UTC's string    |
|    sid    |             Sid             |     Twilio's Event Sid      |

### actor.ringing

Converted from EventType `reservation.created`, when a task (call) is assigned to a worker.

|  Teravoz  |      TaskRouter's Event      |             Value              |
|:---------:|:----------------------------:|:------------------------------:|
|   type    |          EventType           | Converted into "actor.ringing" |
|  call_id  |   TaskAttributes.call_sid    |    TaskAttributes.call_sid     |
|   actor   |          WorkerName          |           WorkerName           |
|  number   | WorkerAttributes.contact_uri |  WorkerAttributes.contact_uri  |
|   queue   |         TaskQueueSid         |          TaskQueueSid          |
| timestamp |         TimestampMs          |     Timestamp UTC's string     |
|    sid    |             Sid              |       Twilio's Event Sid       |

### actor.noanswer

Converted from EventType `reservation.rejected`, when a task (call) is declined or is just not answered by a worker.

|  Teravoz  |      TaskRouter's Event      |              Value              |
|:---------:|:----------------------------:|:-------------------------------:|
|   type    |          EventType           | Converted into "actor.noanswer" |
|  call_id  |   TaskAttributes.call_sid    |     TaskAttributes.call_sid     |
|   actor   |          WorkerName          |           WorkerName            |
|  number   | WorkerAttributes.contact_uri |  WorkerAttributes.contact_uri   |
|   queue   |         TaskQueueSid         |          TaskQueueSid           |
| ringtime  |           TaskAge            |             TaskAge             |
| timestamp |         TimestampMs          |     Timestamp UTC's string      |
|    sid    |             Sid              |       Twilio's Event Sid        |


### actor.paused

Converted from EventType `worker.activity.update`, when the worker changes his state to break. Different from Teravoz, the worker status is the same for all the queues, so the pause state is not defined by queue but by worker.

This converted event is triggered multiple times, based on each queue that the worker belongs to. So, if the worker belongs to the queues 900, 901 and 902, three `actor.paused` events will be sended to the webhook, each one for a different queue in the list.

|  Teravoz  |      TaskRouter's Event      |                 Value                  |
|:---------:|:----------------------------:|:--------------------------------------:|
|   type    |          EventType           |              actor.paused              |
|  number   | WorkerAttributes.contact_uri |      WorkerAttributes.contact_uri      |
|   actor   |          WorkerName          |               WorkerName               |
|   queue   |  WorkerAttributes.queues[i]  | (each) queue that the agent belongs to |
| timestamp |         TimestampMs          |         Timestamp UTC's string         |
|    sid    |             Sid              |           Twilio's Event Sid           |

### actor.unpaused

Converted from EventType `worker.activity.update`, when the worker changes his state from break to available.

This converted event is triggered multiple times, based on each queue that the worker belongs to. So, if the worker belongs to the queues 900, 901 and 902, three `actor.unpaused` events will be sended to the webhook, each one for a different queue in the list.

|  Teravoz  |      TaskRouter's Event      |                 Value                  |
|:---------:|:----------------------------:|:--------------------------------------:|
|   type    |          EventType           |             actor.unpaused             |
|  number   | WorkerAttributes.contact_uri |      WorkerAttributes.contact_uri      |
|   actor   |          WorkerName          |               WorkerName               |
|   queue   |  WorkerAttributes.queues[i]  | (each) queue that the agent belongs to |
| timestamp |         TimestampMs          |         Timestamp UTC's string         |
|    sid    |             Sid              |           Twilio's Event Sid           |

## Dialer Events

### dialer.attempt

Converted from `custom.dialer.attempt`, that is triggered when an attempt to call the provided number is being made.

|  Teravoz  | Twilio Dialer Event |              Value              |
|:---------:|:-------------------:|:-------------------------------:|
|   type    |      EventType      | Converted into "dialer.attempt" |
|  number   |         To          |               To                |
|   code    | TaskAttributes.code |       TaskAttributes.code       |
| timestamp |     TimestampMs     |     Timestamp UTC's string      |

### dialer.success

Converted from `custom.dialer.success`, that is triggered when the dialer call is answered by a human.

|  Teravoz   | Twilio Dialer Event |                          Value                           |
|:----------:|:-------------------:|:--------------------------------------------------------:|
|    type    |      EventType      |             Converted into "dialer.success"              |
|   number   |         To          |                            To                            |
|    code    | TaskAttributes.code |                   TaskAttributes.code                    |
|  call_id   |       CallSid       |                         CallSid                          |
| amd_status |      AmdStatus      | Teravoz's amd_status property, mapped from the AmdStatus |
| timestamp  |     TimestampMs     |                  Timestamp UTC's string                  |

### dialer.failure

Converted from `custom.dialer.failure`, that is triggered when the dialer call fails (not answered, declined, busy or when answered by a machine).

### dialer.expired

Converted from `custom.dialer.expired`, that is triggered when a dialer action expires.

|  Teravoz  | Twilio Dialer Event |              Value              |
|:---------:|:-------------------:|:-------------------------------:|
|   type    |      EventType      | Converted into "dialer.expired" |
|   code    | TaskAttributes.code |       TaskAttributes.code       |
| timestamp |     TimestampMs     |     Timestamp UTC's string      |

### dialer.exceeded

Converted from `custom.dialer.exceeded`, that is triggered when a dialer retry count gets greater than the provided limit of retries.

|  Teravoz  | Twilio Dialer Event |              Value               |
|:---------:|:-------------------:|:--------------------------------:|
|   type    |      EventType      | Converted into "dialer.exceeded" |
|   code    | TaskAttributes.code |       TaskAttributes.code        |
| timestamp |     TimestampMs     |      Timestamp UTC's string      |

# Points to Review

* ~~When the Task enters in the wrapup state (task.wrapup event), two Teravoz's events are fired: `call.finished` AND `agent.left`. However, maybe the actor.left event should be fired when the task finishes (task.completed event), because only on the end of the wrapup status the agent will be available again.~~

>The point above doesn't seems to make sense now, but I'll leave it here with a stroke just in case.

* When a `actor.noanswer` is produced, the `ringtime` is equals to the task age on Twilio's Task Router, not the time that was ringing to the extension that have rejected or not answered the call.

* Verify where to emit the `peer.ringing` Teravoz event and what is the difference between it and the `actor.ringing` event.

* The `actor.logged-in` and the `actor.logged-out` events are emitted for all queues, but in the Teravoz legacy system these events were only emitted when the agent perform a login/logout in a **dialer** queue. For "normal" queues, no events indicating the actor being available/unavailable are emitted. I don't know if it's better to leave the behavior in this way or try to simulate the way that Teravoz works, but then the queues will have to had a property to differentiate the dialer queues from the attendance queues. 

* In order to `data.cpf-provided` and `data-cnpj-provided` to work, they'll also need a function to receive these user inputs and transform it in a custom-event to be converted to the Teravoz event. Thinking on only these two cases, it's OK to build the solution in this way, but if we think about customization and more user inputs that varies by client, it will be a mess to have to create a function to each user input, so maybe it's better to think in a better solution.

# Missing fields

## General

* **code** - This field is intended to be provided by user when triggering the dialer, to recognize an specific call in the events. Maybe it's possible to pass these code if we defines how it will be passed to the TaskRouter's task and how it'll be saved into the task attributes.

## call.new

* **their_number_type** - This info is not provided when the taskRouter callback is triggered on `task.new` event.

## actor.* events

* ~~**queue** - The change of status using the TaskRouter is not related to a queue, so this parameter is not provided by Twilio.~~

>Now, all the actor related events are emitted for each queue that the agent is inserted into. Example: If a agent that belongs to queues 900 and 901 changes his status to available, then two `actor.logged-in` events will be emitted: one for queue `900` and another for queue `901`.

