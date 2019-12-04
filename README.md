# Missing fields

## General

* **code** - This field is intended to be provided by user when triggering the dialer, to recognize an specific call in the events.

## call.new

* **their_number_type** - This info is not provided when the taskRouter callback is triggered on task.new

## actor.* events

* **queue** - The change of status using the TaskRouter is not related to a queue, so this parameter is not provided by Twilio.

