To Dos:

- get the UI working I think API route needs to update the DB
- get websockets working

- then go do minis

  -------- CHORES -----------

TOTHINK:
------hmm may be better to refactor such that we store highlight and context on the db side. Less efficient but prob faster for client and also simpler data structure/code

TODO: on chat button click, slow load of the chat panel is actually annoying. Could get cute and have highlight and text input load immediately.

TODO: refactor API fetches so that they handle supabase datacleanup on the API route side (clean interfaces plz)

TODO: hm interesting design choice re: anchors. Do you want to rehydrate context and highlight already on the db side? or just pure anchors and rehydrate on chat render
