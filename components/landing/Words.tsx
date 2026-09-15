import { Fragment, type CSSProperties } from "react";

/**
 * A line of text split into words, so a headline can arrive one word after
 * another instead of as a block.
 *
 * Markup only: each word is an inline block with a mask, and the stylesheet
 * slides the words up in turn once the surrounding Reveal has been shown.
 * The space between words lives outside the masks — a browser drops
 * whitespace at the end of an inline block, which is how "Увидеть вживую"
 * once became one word. Without scripting nothing is ever hidden, and a
 * screen reader sees the sentence it always saw.
 */
export function Words({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="word" style={{ "--i": from + i } as CSSProperties}>
            <span className="word-in">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
