import React, { forwardRef } from "react";

import type { BaseBlockProps } from "../../types/BaseBlock";
import notionComponentManager from "../../utils/compStore";

const Text = forwardRef<HTMLDivElement, BaseBlockProps<"Text">>(
  (props, ref) => {
    const {
      onInput,
      onKeyDown,
      onFocus,
      onBlur,
      onClick,
      onMouseEnter,
      onMouseLeave,
      contentEditable = true,
      blockProps,
      blockId,
      blockType,
    } = props;
    const { content } = blockProps;
    return (
      <div
        ref={ref}
        style={{
          height: 32,
          lineHeight: "32px",
        }}
        suppressContentEditableWarning
        contentEditable={contentEditable}
        data-placeholder="Enter some text..."
        data-block-id={blockId}
        data-block-type={blockType}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
      >
        {content}
      </div>
    );
  }
);

Text.displayName = "Text";

const TextCompoment = {
  metaData: {
    blockType: "Text" as const,
    title: "文本",
    icon: "T",
  },
  defaultProps: {
    content: "这是一段普通文本",
  },
  component: Text,
};

notionComponentManager.registerComponent<"Text">(TextCompoment);

export default Text;
