import React, { forwardRef } from "react";
import notionComponentManager from "../../utils/compStore";
import "../index";
import type { BaseBlockProps, BlockType } from "../../types/BaseBlock";
// import type { NotionDocType } from "../../types/Doc";

const compStore = notionComponentManager.getAllComponents();

console.log("compStore", compStore);

// 使用泛型 T 为 blockProps 提供类型推断
const Block = forwardRef(
  <T extends BlockType>(props: BaseBlockProps<T>, ref) => {
    const { blockType, blockId } = props;

    const CompMeta = compStore[blockType];
    if (!CompMeta) {
      console.error(`Component ${blockType} not found`);
      return null;
    }
    const { defaultProps, metaData } = CompMeta;
    console.log("metaData", metaData);
    const { blockProps } = props;
    const newBlockProps = { ...defaultProps, ...blockProps };
    const Comp = CompMeta.component;
    return (
      <div
        data-block-id={blockId}
        style={{
          width: "100%",
        }}
        className={`notion-${blockType.toLowerCase()}-block `}
      >
        {/* <div style={{}} /> */}
        <Comp
          ref={ref}
          {...props}
          blockProps={newBlockProps}
          placeholder={metaData.placeholder}
        />
      </div>
    );
  }
);

export default Block;
