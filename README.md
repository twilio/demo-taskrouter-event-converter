# TaskRouter Event Converter

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Table of Contents

- [The project](#the-project)
  * [Quickstart](#quickstart)
  * [Service Structure](#service-structure)
    + [File structure](#file-structure)
- [Event conversion](#event-conversion)
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
- [Attention Points](#attention-points)
  * [Missing fields](#missing-fields)
    + [call.new](#callnew-1)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

# The project

## Quickstart

In order to run this project, you'll have to had node and npm/yarn installed in your machine. It's recommended that you run this project with a node version greater or equal to v10.

The first step is to install the project dependencies, running either one of these commands:

```bash
yarn

# OR using npm:

npm i
```

After the download of the dependencies ends, you'll need to configure a `.env` file before running up the start script. Use the `.env.example` as base to create this file and customize the fields with your desired data:

```
EXTERNAL_WEBHOOK_ENDPOINT={{server_url}}
LOG_LEVEL=info
SUPPRESS_SID=false
HTTP_PORT=3000
```

It's strongly recommended to provide the Teravoz's default URL to test the company events or an custom local server to receive and print the converted events. Replace the {{company_login}} below on the query string by your company name to use the Teravoz's event endpoint tester:

```
EXTERNAL_WEBHOOK_ENDPOINT=https://developers.teravoz.com.br/myevents?login={{company_login}}
LOG_LEVEL=info
SUPPRESS_SID=false
HTTP_PORT=3000
```

After that, you're ready to start the development server:

```bash

yarn dev

# OR

npm run dev
```

This will start an server instance in the port provided in the `.env` file, and the log of the server will be pretty-printed in the terminal. To see the magic happening, use a tool like [ngrok](https://ngrok.com/) to expose the local server and copy the generated link into the TaskRouter's Event Callback url on your flex workspace (see https://www.twilio.com/docs/flex/routing/api/event#event-callbacks).

## Service Structure

The service had been built using Node (v12.13.0) and yarn as his dependency manager (v1.21.1), but it should also work fine using npm. To ensure the events structure, the service uses Typescript, where either Twilio's events and the Teravoz's events are decently typed.

The server is built up in an very simply structure using express. Most of the server configuration is done in `src/index.ts`. The core of the service lives in the `src/events` folder, where all the conversions from the Twilio's events to Teravoz events are made. The `src/routes/index.ts` file do the bind between the server routes to their respectives conversion handlers. The `src/twilio` and `src/teravoz` folders are most composed by typings that defines the events structures.

Last but not least, all the conversion logic and most of the code in overall have unit tests, present in the files with the suffix `.test.ts`. They are used not only to ensure that the conversion is being made correctly but also 
to serve as an addictional documentation of how these events are being manipulated.

Below, there's a simple diagram that shows the service endpoints and where the events come from:

![Project diagram](diagram.png?raw=true "Diagram")

### File structure

```
.
├── README.md                   # This file
├── .env.example                # Example of a environment configuration file
├── jest.config.js              # Configuration to run tests
├── package.json                # The good ol' package.json
├── src           
│   │   └── index.ts            # The service initialization lives here
│   ├── environment             # Environment related code (variables)
│   │   └── index.ts
│   ├── events                  # All the event conversion logic lives here
│   │   ├── converter.ts        # Abstract converter that defines all converters
│   │   ├── dialer              # Contains the code responsible from the conversion of events from dialer
│   │   ├── gather-input        # Contains the code responsible from the conversion of events from caller input
│   │   └── task-router         # Contains the code responsible from the conversion of events from Twilio's TaskRouter. 
│   ├── externals               # The code responsible from communicate to external services lives here
│   │   └── api-client.ts       # The client responsible to send the converted Teravoz's events to the webhook lives here
│   ├── index.ts
│   ├── logger                  # The configuration of the service logger lives here
│   │   └── index.ts
│   ├── middlewares
│   │   ├── bot-filter.ts       # Middleware responsible for filtering Taskrouter's events from workers that's not a human being
│   │   └── task-filter.ts      # Middleware responsible for filtering Taskrouter's events from tasks that doesn't represent a call
│   ├── routes                  # The server routing lives here, together with the handlers that'll redirect each event to their respectives converters
│   │   └── index.ts
│   ├── teravoz                 # Teravoz's related typing
│   │   └── index.ts
│   └── twilio
│       ├── index.ts            # Twilio's related typing and logic
├── tsconfig.json               # Typescript configuration file
└── yarn.lock
```

# Event conversion

In general, most of the fields that exists on Teravoz's events could be fetched from Twilio's events, but the format of the information that comes from their fields are mostly in different formats. One of the main differences are on **number** fields when they're related to the agent. In Twilio Flex, the agents doesn't have a real peer number, so the information present on the `number` field of the resulting Teravoz's event is, in fact, the `contact_uri` present on the Worker attributes. So, for an agent named `foo` that is using flex, the number of the agent provided in the events will be equal to `client:foo`.

Also, when the `queue` attribute is converted, his value will be the TaskQueue SID, and not a simply queue number that used to be present in Teravoz's events.

Below, you can find more details about the events converted, mapped from Twilio's events to Teravoz's events. You'll notice that, in some cases, one Twilio's events produces two Teravoz's events, so that's the reason that the conversors will ever return an array of events:

## Task events
* task.created -> **call.new**
* task.canceled -> **call.queue-abandon** AND **call.finished**
* task.wrapup -> **call.finished** AND **actor.left**

## Task Queue Events
* task-queue.entered -> **call.waiting**

## Reservation Events
* reservation.accepted -> **actor.entered** AND **call.ongoing**
* reservation.rejected -> **actor.noanswer**
* reservation.created -> **actor.ringing**

## Worker Events
*  worker.activity.update -> the converted value changes considering the WorkerActivityName:
* * If the WorkerActivityName is equal to `available` and he was not already available on the queue, then an **actor.logged-in** event is produced
* * If the WorkerActivityName is equal to `unavailable` or `offline`, while the agent was already not in these two status, then an **actor.logged-out** is produced
* * If the WorkerActivityName is equal to `break`, and the user was not already in the `break` status, then an **actor.paused** is produced
* * At least, if the WorkerActivityName is equal to available and the agent was in a break, then an **actor.unpaused** is produced.

# Dialer events

The Dialer's events are slightly different from the TaskRouter's events. The Dialer's events aren't a default from Twilio, since the dialer itself is a custom implementation made by Teravoz. Therefore, these events are triggered manually in the Dialer's code by sending a POST to the `/dialer` endpoint.

By default, these dialer events names are defined by the name that it represents in Teravoz's events with the prefix `custom.`. So, the conversion of the events are very straightforward:

* custom.dialer.attempt -> **dialer.attempt**
* custom.dialer.success -> **dialer.success**
* custom.dialer.failure -> **dialer.failure**
* custom.dialer.expired -> **dialer.expired**
* custom.dialer.exceeded -> **dialer.exceeded**


# Converted Inputs
The user inputs events are generated by custom Twilio's functions or Studio components callback and are not received by POSTing the `/webhook` endpoint. Instead, the input data will be received on the `/input` route, and will also convert the received input to Teravoz's events. As these events aren't officialy emitted by task-router, they've fully customizable names that can be changed depending of your implementation. As example in this code, only the NPS input gathered by user is converted:

* custom.nps-provided -> **call.data-provided**, with the fields `data` and `nps` filled with the user evaluation of the call.


# Conversion Mapping

Each conversion handler is documented with the conversion of the fields from the events, and you can view then generating the docs using `yarn docs` or `npm run docs`, after you properly install the project dependencies.

Also, for reference, the conversion mapping of the fields from the events are described below.

## Call Events

### call.new

Converted from EventType `task.created`, when a task (call) is created. 

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

The [call.finished](#callfinished) event is also originated from the `task.canceled` event

|  Teravoz  |   TaskRouter's Event   |                Value                |
|:---------:|:----------------------:|:-----------------------------------:|
|   type    |       EventType        | Converted into "call.queue-abandon" |
|  call_id  | TaskAttributes.call_id |       TaskAttributes.call_id        |
| timestamp |      TimestampMs       |       Timestamp UTC's string        |
|    sid    |          Sid           |         Twilio's Event Sid          |
 
### call.finished

This event can be converted from the EventType `task.wrapup` or `task.canceled`: when a task (call) enters in the wrapup state, the `task.wrapup` is triggered when either the agent or the caller hangs up, and the agent enters in the wrapup status. When a task is canceled, it will also trigger the `call.finished` Teravoz's event.

The [actor.left](#actorleft) is also originated from the `task.wrapup` event, and the [call.queue-abandon](#callqueue-abandon) is also originated from `task.canceled`.

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

The [call.ongoing](#callongoing) is originated from the `reservation.accepted` event.

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

The [call.finished](#callfinished) is also originated from the `task.wrapup` event.

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

# Attention Points

## Missing fields

### call.new

* **their_number_type** - This info is not provided when the taskRouter callback is triggered on `task.new` event.
