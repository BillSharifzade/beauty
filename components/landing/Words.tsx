import type { CSSProperties } from "react";

/**
 * A line of text split into words, so a headline can arrive one word after
 * another instead of as a block.
 *
 * Markup only: each word is an inline block with a mask, and the stylesheet
 * slides the words up in turn once the surrounding Reveal has been shown.
 * Without scripting nothing is ever hidden, and a screen reader sees the
 * sentence it always saw.
 */
export function Words({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span className="word" key={`${word}-${i}`} style={{ "--i": from + i } as CSSProperties}>
          <span className="word-in">{word}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
