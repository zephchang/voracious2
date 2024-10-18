To Dos:

- on user highlight keep scroll where it is. Maybe even keep highlight where it is potentially.

- focus to user type

- formatting for AI response

- then go do minis ?? do I actualyl need to do this. I think it's the wrong UI paradigm.

- I need streaming

- I need to be able to change the window size by dragging

  -------- CHORES -----------

TOTHINK:
------hmm may be better to refactor such that we store highlight and context on the db side. Less efficient but prob faster for client and also simpler data structure/code

TODO: on chat button click, slow load of the chat panel is actually annoying. Could get cute and have highlight and text input load immediately.

TODO: refactor API fetches so that they handle supabase datacleanup on the API route side (clean interfaces plz)

TODO: hm interesting design choice re: anchors. Do you want to rehydrate context and highlight already on the db side? or just pure anchors and rehydrate on chat render

TODO: refactor the supabase context book attribute to be book_context — clearer.
