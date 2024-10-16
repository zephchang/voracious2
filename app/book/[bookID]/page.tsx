import BookPanel from './components/BookPanel';
import { ChatPanel } from './components/ChatPanel';
import { MinisPanel } from './components/MinisPanel';
import { fetchBookContent } from './utils/apis';
import { BookData } from './utils/types';

const Book = async ({
  params,
  searchParams,
}: {
  params: { bookID: string };
  searchParams: { chatID: string };
}) => {
  const bookData: BookData = await fetchBookContent({ uuid: params.bookID });
  const chatID = searchParams.chatID;
  console.log('CHAT ID', chatID);

  return (
    <div className={`app flex flex-row`}>
      <BookPanel bookData={bookData} />
      <div className="right-panel w-1/3">
        {chatID ? <ChatPanel chatID={chatID} /> : <MinisPanel />}
      </div>
    </div>
  );
};

export default Book;
