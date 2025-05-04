import React, { forwardRef, useMemo, useState } from "react";
import notionComponentManager from "../../utils/compStore";
import "../index";
import type { BlockType, BlockEvent } from "../../types/BaseBlock";
import type { NotionDocType } from "../../types/Doc";
import { useDrag, useDrop } from "react-dnd";
import "./index.css";
import { findBlock, removeBlock, insertBlock } from "../../utils/block";
const compStore = notionComponentManager.getAllComponents();

const ITEM_TYPE = "BLOCK";

console.log("compStore", compStore);

// 使用泛型 T 为 blockProps 提供类型推断
const Block = forwardRef(
  <T extends BlockType>(
    props: NotionDocType<T> &
      BlockEvent & {
        contentEditable: boolean;
        moveBlock: (
          draggedId: string,
          targetId: string,
          position: "before" | "after"
        ) => void;
        hoveredBlock: {
          blockId: string;
          blockType: string;
        };
      },
    ref
  ) => {
    const {
      blockType,
      blockId,
      blockProps,
      childrenList,
      onBlur,
      onInput,
      onKeyDown,
      onFocus,
      onClick,
      onMouseEnter,
      onMouseLeave,
      moveBlock,
      hoveredBlock,
    } = props;

    const eventProps = {
      onBlur,
      onInput,
      onKeyDown,
      onFocus,
      onClick,
      onMouseEnter,
      onMouseLeave,
    };

    const CompMeta = compStore[blockType];

    if (!CompMeta) {
      console.error(`Component ${blockType} not found`);
      return null;
    }
    const { defaultProps, metaData } = CompMeta;
    const newBlockProps = { ...defaultProps, ...blockProps };
    const Comp = CompMeta.component;

    // 使用 useDrag 定义拖拽源
    const [, dragRef] = useDrag({
      type: ITEM_TYPE,
      item: { id: blockId },
      canDrag: () => {
        // 根据条件判断是否允许拖拽
        return blockType !== "Page"; // 禁止拖拽 Page 类型的块
      },
      previewOptions: {
        captureDraggingState: true,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [dragPos, setDragPos] = useState<"before" | "after" | "">("");

    // 使用 useDrop 定义拖拽目标
    const [{ isOverShallow }, dropRef] = useDrop({
      accept: ITEM_TYPE,
      canDrop: () => {
        // 禁止将元素放到 blockType 为 Page 的块上
        return blockType !== "Page";
      },
      drop: (item: { id: string }, monitor) => {
        if (!refNode.current) {
          return;
        }

        const clientOffset = monitor.getClientOffset();
        const targetRect = refNode.current.getBoundingClientRect();

        if (clientOffset) {
          const { y } = clientOffset;
          const isAbove = y < targetRect.top + targetRect.height / 2;
          moveBlock(item.id, blockId, isAbove ? "before" : "after");
        }
      },
      hover(item, monitor) {
        if (!refNode.current) {
          return;
        }

        const clientOffset = monitor.getClientOffset();
        const targetRect = refNode.current.getBoundingClientRect();

        if (clientOffset) {
          const { y } = clientOffset;
          const isAbove = y < targetRect.top + targetRect.height / 2;
          setDragPos(isAbove ? "before" : "after");
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverShallow: monitor.isOver({ shallow: true }), // 仅判断直接悬停
      }),
    });

    const refNode = React.useRef<HTMLDivElement>(null);
    // 合并 drag 和 drop 的 ref
    const combinedRef = (node: HTMLDivElement) => {
      dragRef(node);
      dropRef(node);

      refNode.current = node;
    };

    const borderStyle = useMemo(() => {
      if (blockType === "Page") return {};
      if (isOverShallow) {
        if (dragPos === "before") {
          return { borderTop: "2px solid #007acc" }; // 高亮 borderTop
        }
        if (dragPos === "after") {
          return { borderBottom: "2px solid #007acc" }; // 高亮 borderBottom
        }
      }
      return {};
    }, [isOverShallow, dragPos, blockType]);

    // 渲染子节点列表，支持递归
    const renderChildrenList = (childrenList || []).map((child, index) => {
      return (
        <div
          key={child.blockId}
          className={`notion-section notion-section-order-${index + 1}`}
        >
          <Block
            {...eventProps}
            {...child}
            hoveredBlock={props.hoveredBlock}
            contentEditable={props.contentEditable}
            ref={ref}
            moveBlock={moveBlock}
          />
        </div>
      );
    });

    return (
      <div
        ref={combinedRef}
        data-block-id={blockId}
        data-block-type={blockType}
        className={`notion-${blockType.toLowerCase()}-block`}
        style={{
          width: "100%",
          position: "relative",
          minHeight: 32,
          ...borderStyle,
        }}
      >
        {hoveredBlock?.blockId === blockId && (
          <div
            ref={(node) => {
              dragRef(node);
            }}
            className="drag-handle"
            style={{
              position: "absolute",
              left: -24,
              height: 32,
              lineHeight: "32px",
            }}
          >
            ⠿
          </div>
        )}
        <Comp
          ref={ref}
          {...props}
          blockProps={newBlockProps}
          renderChildrenList={renderChildrenList}
          placeholder={metaData.placeholder}
        />
      </div>
    );
  }
);

const NotionDoc = forwardRef<
  HTMLDivElement,
  { docInfo: NotionDocType<BlockType> } & BlockEvent & {
      contentEditable: boolean;
      onDocClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
      setDocInfo: React.Dispatch<React.SetStateAction<unknown>>;
      hoveredBlock: {
        blockId: string;
        blockType: string;
      };
    }
>((props, ref) => {
  const { docInfo, ...rest } = props;

  const moveBlock = (
    draggedId: string,
    targetId: string,
    position: "before" | "after"
  ) => {
    if (draggedId === targetId) return;

    const newDocInfo = JSON.parse(JSON.stringify(docInfo));

    const newBlocks = [newDocInfo]; // 找到拖拽的块和目标块
    const draggedBlock = findBlock(newBlocks, draggedId);
    const targetBlock = findBlock(newBlocks, targetId);

    if (!draggedBlock || !targetBlock) return;

    removeBlock(newBlocks, draggedId);
    insertBlock(newBlocks, targetId, draggedBlock, position);

    console.log("newBlocks", newBlocks);
    props.setDocInfo(newDocInfo);
  };

  return (
    <div className="notion-doc" id="doc" onClick={props.onDocClick}>
      <Block {...docInfo} {...rest} ref={ref} moveBlock={moveBlock} />
    </div>
  );
});

export default NotionDoc;
