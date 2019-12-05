# Converted Events

Here is the list of the Task Router's events and their representation as teravoz events:

* task.created -> **call.new**
* task.canceled -> **call.queue-abandon**
* reservation.accepted -> **actor.entered** AND **call.ongoing**
*  worker.activity.update -> varies considering the WorkerActivityName:
* * If the WorkerActivityName is equal to `available` and he was not already available on the queue, then an **actor.logged-in** event is produced
* * If the WorkerActivityName is equal to `unavailable` or `offline`, while the agent was already not in these two status, then an **actor.logged-out** is produced
* * If the WorkerActivityName is equal to `break`, and the user was not already in the `break` status, then an **actor.paused** is produced
* * At least, if the WorkerActivityName is equal to available and the agent was in a break, then an **actor.unpaused** is produced.

# Missing fields

## General

* **code** - This field is intended to be provided by user when triggering the dialer, to recognize an specific call in the events.

## call.new

* **their_number_type** - This info is not provided when the taskRouter callback is triggered on task.new

## actor.* events

* **queue** - The change of status using the TaskRouter is not related to a queue, so this parameter is not provided by Twilio.

