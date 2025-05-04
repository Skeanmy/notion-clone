import React, { forwardRef } from "react";
import Header from "./Header";
import type { HeaderBaseBlockProps } from "../../types/BaseBlock";
import notionComponentManager from "../../utils/compStore";

const PageHeader = forwardRef<HTMLElement, HeaderBaseBlockProps<"PageHeader">>(
  (props, ref) => {
    const { blockProps, ...rest } = props;
    return (
      <Header {...rest} ref={ref} blockProps={{ ...blockProps, level: "1" }} />
    );
  }
);

PageHeader.displayName = "PageHeader";

const PageHeaderComp = {
  isShowInMenu: false,
  metaData: {
    blockType: "PageHeader" as const,
    title: "文档标题",
    icon: "H1",
  },
  defaultProps: {
    level: "1" as const,
    content: "标题",
  },
  component: PageHeader,
};

notionComponentManager.registerComponent<"PageHeader">(PageHeaderComp);

export default PageHeader;
