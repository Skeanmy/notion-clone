import React, { forwardRef } from "react";

import type { ListBlock, ListBaseBlockProps } from "../../types/BaseBlock";
import notionComponentManager from "../../utils/compStore";
import { toRoman } from "../../utils";

const blockDotStyleMap = {
  1: '▪',
  2: '•',
  0: '◦',
}

const numberedDotMap = {
  2: number => `${number}.`,
  0: number => `${String.fromCharCode(96 + number)}.`,
  1: number => `${toRoman(number)}.`,
}

const getNumberedDot = (blockSeq: string, numberedItemIdx: number) => {
  const seqArr = blockSeq.split('-')
  const length = seqArr.length
  const styleIdx = length % 3
  return numberedDotMap[styleIdx](numberedItemIdx)
}

const List = forwardRef<HTMLDivElement, ListBaseBlockProps<ListBlock>>(
  (props, ref) => {
    const {
      onInput,
      onKeyDown,
      onFocus,
      onBlur,
      onClick,
      onMouseEnter,
      onMouseLeave,
      contentEditable,
      blockProps,
      blockId,
      blockType,
      blockSeq = '',
      placeholder,
      renderChildrenList,
      numberedItemIdx
    } = props;
    const seqLength = blockSeq.split('-').length
    let blockDot

    const { content, listType } = blockProps;
    if (listType === "bullet") {

      blockDot = blockSeq ? blockDotStyleMap[seqLength % 3] : '•'
    } else {
      blockDot = numberedItemIdx ? getNumberedDot(blockSeq, numberedItemIdx) : '1.'
    }

    return (
      <div className={`${listType}-item notion-list-item`}>
        <div
          className="list"
          style={{
            display: "flex",
          }}
        >
          <div
            className="list-dot"
            style={{
              height: 32,
              lineHeight: '32px',
              paddingLeft: 4,
              marginRight: 8,
              fontSize: 16,
              color: '#0650ff'
            }}
          >
            {blockDot}
          </div>
          <div
            className="list-content"
            suppressContentEditableWarning
            contentEditable={contentEditable}
            ref={ref}
            data-placeholder={placeholder}
            data-block-id={blockId}
            data-block-type={blockType}
            onInput={onInput}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {content}
          </div>
        </div>
        <div
          className="list-children"
          style={{
            paddingLeft: 18,
            marginLeft: 7,
          }}
        >
          {renderChildrenList}
        </div>
      </div>
    );
  }
);

List.displayName = "List";

const BulletedList = forwardRef<HTMLDivElement, ListBaseBlockProps<'BulletedList'>>((props, ref) => {
  const { blockProps, ...rest } = props
  const newProps = {
    ...rest,
    blockProps: {
      ...blockProps,
      listType: "bullet" as const,
    }
  }
  return (
    <List {...newProps} ref={ref} blockType="BulletedList" />
  )
});

BulletedList.displayName = "BulletedList";

const NumberedList = forwardRef<HTMLDivElement, ListBaseBlockProps<'NumberedList'>>((props, ref) => {
  const { blockProps, ...rest } = props
  const newProps = {
    ...rest,
    blockProps: {
      ...blockProps,
      listType: "number" as const,
    }
  }
  return (
    <List {...newProps} ref={ref} blockType="NumberedList" />
  )
});

NumberedList.displayName = "NumberedList";

const BulletedCompoment = {
  metaData: {
    blockType: "BulletedList" as const,
    title: "无序列表",
    icon: "I",
    placeholder: "BulletedList",
  },
  defaultProps: {
    content: "无序列表",
    listType: "bullet" as const,
  },
  component: BulletedList,
};

notionComponentManager.registerComponent<"BulletedList">(BulletedCompoment);

const NumberedCompoment = {
  metaData: {
    blockType: "NumberedList" as const,
    title: "有序列表",
    icon: "L",
    placeholder: "NumberedList",
  },
  defaultProps: {
    content: "有序列表",
    listType: 'number' as const,
  },
  component: NumberedList,
};

notionComponentManager.registerComponent<"NumberedList">(NumberedCompoment);

export default List;


