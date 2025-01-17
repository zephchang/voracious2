'use client';
import {
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { BookData } from '../utils/types';
import { locateHighlight } from '../utils/locateHighlight';
import { initConvoWithLocation } from '../utils/apis';

const BookPanel = ({ bookData }: { bookData: BookData }) => {
  const {
    uuid: bookID,
    title: bookTitle,
    raw_text: rawText,
    rewritten_text: rewrittenText,
  } = bookData;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // will use these for re-alignment
  const rewrittenRef = useRef<HTMLDivElement>(null);
  const rawRef = useRef<HTMLDivElement>(null);
  const bookContainerRef = useRef<HTMLDivElement>(null);

  // For checking if it's a new highlight (huh? why did I do this)
  const [lastSelection, setlastSelection] = useState<string>('');

  // Button position/visibility
  const [buttonVisible, setButtonVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  /**THESE ARE DEBUGGING FOR SCROLL HEIGHT */
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (bookContainerRef.current) {
      setContainerHeight(bookContainerRef.current.scrollHeight);
    }
  }, []);

  const renderScrollMarkers = () => {
    const markers = [];
    for (let i = 0; i < containerHeight; i += 500) {
      markers.push(
        <div
          key={`scroll-marker-${i}`}
          className="absolute left-0 w-full h-[1px] bg-red-500 pointer-events-none"
          style={{ top: `${i}px` }}
        >
          <span className="absolute left-2 bg-white text-red-500 text-xs">
            {i}px
          </span>
        </div>
      );
    }
    return markers;
  };

  /**
   * Reset Heights of Paragraphs
   * - uses refs to go into the server components books loaded and resize them such that the heights match up for viewing.
   * - more elegant would have been CSS grid but the problem is then you can't do a vertical column highlight.
   * - TODO: listener for window resizing to re-run this effect.
   */
  useLayoutEffect(() => {
    const rewrittenParas = rewrittenRef.current?.querySelectorAll(
      '.book-para'
    ) as NodeListOf<HTMLElement> | undefined; //Note to self: this nodeList isn't actually a list it's some kind of object so we have to do Array.from to use it as a list
    const rawParas = rawRef.current?.querySelectorAll('.book-para') as
      | NodeListOf<HTMLElement>
      | undefined;

    if (rewrittenParas && rawParas) {
      rewrittenParas.forEach((rewrittenPara, index) => {
        const rawPara = rawParas[index];
        const maxHeight = Math.max(
          rewrittenPara.offsetHeight,
          rawPara.offsetHeight
        );
        rewrittenPara.style.height = `${maxHeight}px`;
        rawPara.style.height = `${maxHeight}px`;
      });
    }
  }, []);

  const handleButtonAppear = useCallback(() => {
    const selection = window.getSelection();
    if (!selection) return;

    const highlightedText = selection.toString() || '';
    if (
      selection &&
      !selection.isCollapsed &&
      highlightedText != lastSelection
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
      });
      setButtonVisible(true);
      setlastSelection(highlightedText); //I forget why this is needed
    } else {
      setButtonVisible(false);
    }
  }, []);

  const renderChatButton = () => {
    if (!buttonVisible) return null;
    return (
      <div
        className="button-container flex bg-neutral-100 rounded-md border-[.025px] border-neutral-300 shadow-md min-w-max"
        style={{
          position: 'absolute',
          top: `${buttonPosition.top}px`,
          left: `${buttonPosition.left}px`,
        }}
      >
        <button className="voice-btn py-0.5 px-3 font-sans text-[15px] hover:bg-neutral-200">
          <span className="text-black">Voice </span>
          <span className="text-neutral-600">⌘K</span>
        </button>
        <button
          className="ask-ai-btn py-0.5 px-3 font-sans text-[15px] hover:bg-neutral-200"
          onClick={handleChatButtonClick}
        >
          <span className="text-black">Chat </span>
          <span className="text-neutral-600">⌘L</span>
        </button>
      </div>
    );
  };

  const handleChatButtonClick = async () => {
    const scrollPosition = window.scrollY;

    try {
      // Generate (1) highlight text (2) highlight location (3) highlight context --> send that all to the db to initialize conversation
      const highlightText = window.getSelection()?.toString();
      if (!highlightText) throw new Error('No highlight text selected');

      const highlightLocation = locateHighlight(bookID);
      if (!highlightLocation) {
        throw new Error('LocateHighlight util failed us,.');
      }

      const { startDiv, endDiv, contentType } = highlightLocation;

      const contextParas = contentType === 'raw_text' ? rawText : rewrittenText;

      const contextText = contextParas
        .slice(
          Math.max(0, startDiv - 1),
          Math.min(contextParas.length + 1, endDiv + 2)
        )
        .join('\n');

      const convoData = {
        highlightText,
        ...highlightLocation,
        contextText,
      };

      const supabaseData = await initConvoWithLocation(convoData);
      const conversationID = supabaseData.id;

      if (!conversationID) {
        throw new Error("Couldn't start a new conversation.");
      }

      router.replace(`${pathname}?chatID=${conversationID}`);
      setButtonVisible(false);

      setTimeout(() => {
        if (bookContainerRef.current) {
          bookContainerRef.current.scrollTo(0, scrollPosition);
        }
      }, 200); //timeout makes sure DOM get a chance to update
    } catch (error) {
      console.error('Error processing highlight:', error);
    }
  };

  const bookColStyle = 'pt-10 pl-10 pr-10 text-[17px] bg-white font-serif';

  return (
    <>
      <div
        ref={bookContainerRef}
        className={`book-container relative shadow-md
    ${
      searchParams.has('chatID')
        ? 'chat-mode-book flex flex-row w-2/3 h-screen overflow-y-auto items-start'
        : 'minis-mode-book flex flex-row w-2/3 '
    }`}
        onMouseUp={handleButtonAppear}
      >
        <div
          ref={rewrittenRef}
          className={`rewritten-book w-1/2 border-r border-r-neutral ${bookColStyle}`}
        >
          {rewrittenText.map((paragraph: string, index: number) => (
            <div
              key={`paragraph-${index}`} //only React accessible, not DOM accessible
              data-paragraph-index={index} //DOM accessible
              className={`book-para rewritten-content pb-4`}
            >
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
        <div ref={rawRef} className={`raw-book w-1/2 ${bookColStyle}`}>
          {rawText.map((paragraph: string, index: number) => (
            <div
              key={`paragraph-${index}`} //only React accessible, not DOM accessible
              data-paragraph-index={index} //DOM accessible
              className={`book-para raw-content pb-4`}
            >
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
        {renderChatButton()}
        {renderScrollMarkers()}
      </div>
    </>
  );
};

export default BookPanel;
