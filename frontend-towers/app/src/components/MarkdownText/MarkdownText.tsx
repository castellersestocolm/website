import * as React from "react";
import markdown from "@wcj/markdown-to-html";
import styles from "./styles.module.css";

export default function MarkdownText({ text }: any) {
  return (
    <div
      className={styles.markdownText}
      dangerouslySetInnerHTML={{
        __html: markdown(text).toString(),
      }}
    ></div>
  );
}
