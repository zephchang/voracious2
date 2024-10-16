To Dos:

OK so what's our overall plan?

URL structure:

website.com/book/1wkjalsdiofjaldf(bookID)?chatID=[chatID]

Top level: page.tsx (server)
--> use url param to fetch the book data [done]

- Left panel: show book panel (client)
- Right panel: if chatID exists show ChatPanel (server). otherwise show MinisPanel (client)

|.... Left panel, book panel: (client component) -->

- takes in the book data as a prop and puts it in the returned jsx. [done]
- Auto height adjustment - maybe this should be layoutEffect [done]
- eventlistener - this should be applied to the entire book panel in the JSX -(rather than whole document event listener) - question: how about a keydown like esc - prob I want that global [done]

|..... ChatPanel (server component)
fetch chat history here, get the initial chat and initial highlight, pass them as props into your client child

|---- ChatClient - state for messages and set messages - take in the fetched data as a prop and set highlight to be highlight (const) - and set messages state to be the message history - and now we just have our normal chat interactivity that you would expect.

TODOS:

> setup fetchConvoData api calls and get the data fetched (console.log to test)

> rehydrate highlight [done]

> get chatHistory [done]

> pass those into a server component [done]

> Now we pass the server values into a client component to initialize react state in the client component. [done]

> Ok so now what? we want on button click, we are going to

> client component is going to render the chat with full interactivity. Maybe should have a superhuman listener for dealing with the message updates.

TODO: create client component and render chat there using initialized useState [done]

Figure out this foreign key thing

GOAL:

- 1 user types in some content - on click:
- 2 optimistic UI update w/ user chat
- 3 call API route on (message, chatID, context)
  ------hmm may be better to refactor such that we store highlight and context on the db side. Less efficient but prob faster for client and also simpler data structure/code
- 4 fetch convo history from db (maybe context as well?)
- 5 send api response to the db

-------- CHORES -----------

TODO: on chat button click, slow load of the chat panel is actually annoying. Could get cute and have highlight and text input load immediately.

TODO: refactor API fetches so that they handle supabase datacleanup on the API route side (clean interfaces plz)

TODO: hm interesting design choice re: anchors. Do you want to rehydrate context and highlight already on the db side? or just pure anchors and rehydrate on chat render
