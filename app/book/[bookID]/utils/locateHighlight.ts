export const locateHighlight = () => {
  try {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return; //is this neccesary?

    const startTextNode = selection.anchorNode;
    const endTextNode = selection.focusNode;

    const startDiv = Number(
      startTextNode?.parentElement?.parentElement?.getAttribute(
        'data-paragraph-index'
      )
    );
    const endDiv = Number(
      endTextNode?.parentElement?.parentElement?.getAttribute(
        'data-paragraph-index'
      )
    );
    const startOffset = selection.anchorOffset; //note this is a little brittle bc it's offset for the text node not the div. For us should be fine bc only one paragraph per div.
    const endOffset = selection.focusOffset;

    const contentType =
      startTextNode?.parentElement?.parentElement?.classList.contains(
        'raw-content'
      )
        ? 'raw_text'
        : 'rewritten_text';

    const anchors = {
      startDiv,
      startOffset,
      endDiv,
      endOffset,
      contentType,
    };

    return anchors;
  } catch (error) {
    console.error('Error finding highlight anchors:', error);
  }
};
