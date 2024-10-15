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
