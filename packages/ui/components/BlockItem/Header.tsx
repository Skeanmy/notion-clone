import React, { forwardRef } from "react";
import type { HeaderBaseBlockProps } from "../../types/BaseBlock";
import notionComponentManager from "../../utils/compStore";

const Header = forwardRef<
  HTMLElement,
  HeaderBaseBlockProps<"H1" | "H2" | "H3" | "PageHeader">
>((props, ref) => {
  const {
    onInput,
    onKeyDown,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    onClick,
    blockProps,
    contentEditable,
    blockId,
    blockType,
    placeholder,
  } = props;
  const { level, content } = blockProps;
  return React.createElement(
    `h${level}`,
    {
      ref,
      onInput,
      onKeyDown,
      onFocus,
      onMouseEnter,
      onMouseLeave,
      style: {
        marginBlockStart: 0,
        marginBlockEnd: 0,
        minHeight: 32,
        display: "flex",
        alignItems: "center",
      },
      onBlur,
      onClick,
      suppressContentEditableWarning: true,
      contentEditable,
      "data-placeholder": placeholder || "Heading" + level,
      "data-block-id": blockId,
      "data-block-type": blockType,
    },
    content
  );
});

Header.displayName = "Header";

const H1Compoment = {
  metaData: {
    blockType: "H1" as const,
    title: "一级标题",
    icon: "H1",
  },
  defaultProps: {
    level: "1" as const,
    content: "Heading 1",
  },
  component: Header,
};

const H2Compoment = {
  metaData: {
    blockType: "H2" as const,
    title: "二级标题",
    icon: "H2",
  },
  defaultProps: {
    level: "2" as const,
    content: "Heading 2",
  },
  component: Header,
};

const H3Compoment = {
  metaData: {
    blockType: "H3" as const,
    title: "三级标题",
    icon: "H3",
  },
  defaultProps: {
    level: "3" as const,
    content: "Heading 3",
  },
  component: Header,
};

notionComponentManager.registerComponent<"H1">(H1Compoment);

notionComponentManager.registerComponent<"H2">(H2Compoment);

notionComponentManager.registerComponent<"H3">(H3Compoment);

// const PageHeaderComp = {
//   isShowInMenu: false,
//   metaData: {
//     blockType: "PageHeader" as const,
//     title: "文档标题",
//     icon: "H1",
//   },
//   defaultProps: {
//     level: "1" as const,
//     content: "标题",
//   },
//   component: Header,
// };

// notionComponentManager.registerComponent<"PageHeader">(PageHeaderComp);

export default Header;
