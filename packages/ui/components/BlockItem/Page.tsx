import React, { forwardRef } from "react";
import type { BaseBlockProps } from "../../types/BaseBlock";
import notionComponentManager from "../../utils/compStore";
import "./index.css";

const Page = forwardRef<HTMLDivElement, BaseBlockProps<"Page">>(
  (props, ref) => {
    const {
      onInput,
      onKeyDown,
      onFocus,
      onBlur,
      onClick,
      blockProps,
      blockId,
      renderChildrenList,
      contentEditable,
      placeholder,
      blockType,
    } = props;
    const { content } = blockProps;
    return (
      <div className="page-block">
        <div
          ref={ref}
          className="page-block-header"
          suppressContentEditableWarning
          contentEditable={contentEditable}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={onClick}
          data-block-id={blockId}
          data-block-type={blockType}
          data-placeholder={placeholder}
        >
          {content}
        </div>
        <div className="page-block-children">{renderChildrenList}</div>
      </div>
    );
  }
);

Page.displayName = "Page";

const Compoment = {
  metaData: {
    blockType: "Page" as const,
    title: "一级标题",
    icon: "H1",
    placeholder: "请输入标题开始写作吧~",
  },
  defaultProps: {
    level: "1" as const,
    content: "Heading 1",
  },
  isShowInMenu: false,
  component: Page,
};

notionComponentManager.registerComponent<"Page">(Compoment);

export default Page;
