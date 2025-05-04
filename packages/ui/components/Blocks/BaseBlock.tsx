import React, { forwardRef } from "react";
import notionComponentManager from "../../utils/compStore";
import "../index";
import type { BaseBlockProps, BlockType } from "../../types/BaseBlock";

const compStore = notionComponentManager.getAllComponents();

console.log("compStore", compStore);

// 使用泛型 T 为 blockProps 提供类型推断
const BaseBlock = forwardRef(
  <T extends BlockType>(props: BaseBlockProps<T>, ref) => {
    const { blockType, blockId } = props;

    const CompMeta = compStore[blockType];
    if (!CompMeta) {
      console.error(`Component ${blockType} not found`);
      return null;
    }
    const { defaultProps } = CompMeta;
    const { blockProps } = props;
    const newBlockProps = { ...defaultProps, ...blockProps };
    const Comp = CompMeta.component;
    return (
      <div
        data-block-id={blockId}
        className={`notion-${blockType.toLowerCase()}-block `}
      >
        {/* <div style={{}} /> */}
        <Comp ref={ref} {...props} blockProps={newBlockProps} />
      </div>
    );
  }
);

export default BaseBlock;
