import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { getCursorPosition, generateUniqueId } from "../utils";
import { findBlock, insertBlock, removeBlock } from "../utils/block";
import type { BlockType, BlockPropsMap, ListBlock } from "../types/BaseBlock";
import type { NotionDocType } from "../types/Doc";
// 打平 childrenList 的函数
const flattenChildrenList = (
  blocks: NotionDocType<BlockType>[]
): NotionDocType<BlockType>[] => {
  const flatList: NotionDocType<BlockType>[] = [];

  const traverse = (blockList: NotionDocType<BlockType>[]) => {
    blockList.forEach((block) => {
      flatList.push(block); // 将当前块添加到平铺数组中
      if (block.childrenList && block.childrenList.length > 0) {
        traverse(block.childrenList); // 递归处理子节点
      }
    });
  };

  traverse(blocks);
  return flatList;
};

export default function useBlock(props) {
  const blockRef = useRef<Record<string, HTMLElement>>({});
  const { docInfo, setDocInfo, docList } = props;

  useEffect(() => {
    console.log("blockRef", blockRef);
  }, []);

  const docItemList = useMemo(() => {
    const { childrenList } = docInfo;
    const flatList = flattenChildrenList(childrenList);
    return flatList;
  }, [docInfo]);

  const [hoveredBlock, setHoveredBlock] = useState<{
    blockId: string;
    blockType: string;
  } | null>(null);

  const [activeBlock, setActiveBlock] = useState<{
    blockId: string;
    blockType: string;
  } | null>(null);

  // useEffect(() => {
  //   console.log("hoveredBlock", hoveredBlock)
  // }, [hoveredBlock])

  // useEffect(() => {
  //   console.log("activeBlock", activeBlock);
  // }, [activeBlock]);

  const [menuBlock, setMenuBlock] = useState<{
    blockId: string;
    blockType: string;
  } | null>(null);

  const getNodeRef = (blockId: string, ref: HTMLElement | null) => {
    if (ref) {
      blockRef.current[blockId] = ref;
    }
  };

  const getNodeRefContent = (blockId: string) => {
    const ele = blockRef.current[blockId];
    if (ele) {
      return ele.innerText; // 获取当前块的内容
    }
    return "";
  };

  // 聚焦在当前块
  const focusOnBlock = (blockId: string) => {
    setTimeout(() => {
      const currentBlock = blockRef.current[blockId];
      currentBlock?.focus();
    }, 100);
  };

  // 插入一个新区块
  const handleDocClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if ((e.target as HTMLElement).getAttribute("id") === "doc") {
      const lastBlock = (docInfo.childrenList || []).slice(-1)[0];
      if (
        lastBlock &&
        lastBlock.blockType === "Text" &&
        lastBlock.blockProps.content === ""
      ) {
        setActiveBlock(lastBlock);
        focusOnBlock(lastBlock.blockId); // 聚焦到最后一个块
        return;
      }
      // 插入到末尾
      const newBlock = generateBlock(); // 生成新块
      const newDocInfo = JSON.parse(JSON.stringify(docInfo));

      newDocInfo.childrenList.push(newBlock);

      setDocInfo(newDocInfo);
      setActiveBlock(newBlock);
      focusOnBlock(newBlock.blockId); // 聚焦到新块
    }
  };

  const generateBlock = (blockType?: BlockType, extraProps = {}) => {
    return {
      blockId: generateUniqueId(), // 随机生成id
      blockType: blockType || "Text",
      blockProps: {
        content: "",
        ...extraProps,
      },
    };
  };

  const handleBlockForKeyEnter = (e: React.KeyboardEvent<Element>) => {
    e.preventDefault();

    const selection = window.getSelection();
    // 无选中范围时返回
    if (!selection || selection?.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const cursorPosition = getCursorPosition(range);
    const { isAtEnd, isAtStart, offset } = cursorPosition;
    console.log("activeBlock", activeBlock);
    // 如果没有选中范围，或者当前块不存在，则返回
    if (!activeBlock) return;

    const { blockId, blockType } = activeBlock;

    const currentContent = getNodeRefContent(blockId); // 获取当前块的内容

    console.log("currentContent", currentContent);
    const newDocInfo = JSON.parse(JSON.stringify(docInfo));
    const newBlocks = [newDocInfo];
    const newBlock = generateBlock(
      ["BulletedList", "NumberedList"].includes(blockType)
        ? (blockType as ListBlock)
        : ("Text" as const)
    );

    // 当前区块没有值
    if (!currentContent) {
      insertBlock(newBlocks, blockId, newBlock, "after");
      console.log("newBlocks", newBlocks);
    } else {
      if (isAtStart) {
        insertBlock(newBlocks, blockId, newBlock, "before");
        // 光标在最前面，在当前块前插入新块
      } else if (isAtEnd) {
        // 光标在最后面，在当前块后插入新块
        insertBlock(newBlocks, blockId, newBlock, "after");
      } else {
        const currentBlock = findBlock(newBlocks, blockId);
        // 光标在中间，将光标后的内容插入到新块
        const beforeContent = currentContent.slice(0, offset);
        currentBlock.blockProps.content = beforeContent;
        const afterContent = currentContent.slice(offset);
        const newBlock = generateBlock("Text", { content: afterContent });
        insertBlock(newBlocks, blockId, newBlock, "after");
      }
    }
    setDocInfo(newDocInfo);
    setActiveBlock(newBlock);
    focusOnBlock(newBlock.blockId);
  };

  const handleBlockForKeyBackspace = () => {
    const selection = window.getSelection();
    // 无选中范围时返回
    if (!selection || selection?.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const cursorPosition = getCursorPosition(range);
    const { isAtStart } = cursorPosition;
    if (isAtStart) {
      console.log("光标位于可删除的起始位置（如文本开头或元素前）");
      const { blockId } = activeBlock;
      const newBlocks = docList;
      const currBlock = findBlock(newBlocks, blockId);
      console.log("activeBlock", activeBlock);
      // 降级为Text
      if (activeBlock?.blockType !== "Text") {
        currBlock.blockType = "Text";
        setDocInfo(newBlocks[0]);
        setActiveBlock(currBlock);
        focusOnBlock(activeBlock!.blockId); // 聚焦到当前块
      } else {
        console.log("currBlock", currBlock);
        const currentIndex = docItemList.findIndex(
          (item) => item.blockId === blockId
        );
        if (currentIndex === 0) {
          console.log("已经是第一个块");
          return;
        }
        const previousBlock = docItemList[currentIndex - 1];
        const currentContent = getNodeRefContent(activeBlock.blockId);

        removeBlock(newBlocks, blockId);
        const prevContent = previousBlock.blockProps.content;
        console.log("prev", prevContent);
        previousBlock.blockProps.content = prevContent + currentContent;
        console.log("previousBlock", previousBlock);
        setDocInfo(newBlocks[0]);
        setActiveBlock(previousBlock); // 设置上一个块为激活块
        // focusOnBlock(previousBlock.blockId); // 聚焦到上一个块

        setTimeout(() => {
          const previousBlockRef = blockRef.current[previousBlock.blockId];
          if (previousBlockRef) {
            previousBlockRef.focus();
            // 将光标移动到拼接内容的末尾
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(previousBlockRef);
            range.collapse(false); // 光标移动到内容末尾
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 100);
      }
    }
  };

  // 处理输入
  const handleBlockForInput = (text: string) => {
    const isHeaderTpl = /^#{1,3}\s{1,}/.test(text);
    if (isHeaderTpl && !["H1", "H2", "H3"].includes(activeBlock?.blockType)) {
      const level = text.match(/^#{1,3}/)![0].length; // 获取 `#` 的数量
      const newText = text.replace(/^#{1,3}\s+/, ""); // 去掉 `#` 和空格
      const { blockId } = activeBlock;
      const newDocInfo = JSON.parse(JSON.stringify(docInfo));
      const newBlocks = [newDocInfo];
      const currBlock = findBlock(newBlocks, blockId);
      currBlock.blockProps.content = newText;
      currBlock.blockType = `H${level}` as keyof BlockPropsMap;
      console.log("newDocInfo", newDocInfo);
      setDocInfo(newDocInfo);
      focusOnBlock(activeBlock!.blockId); // 聚焦到当前块
    }
  };

  const handleBlockFocus: React.FocusEventHandler<HTMLElement> = (e) => {
    console.log("handleBlockFocus", e.currentTarget);
    setActiveBlock(getBlockInfo(e.currentTarget)); // 设置当前激活块
  };

  const getBlockInfo = (ele: HTMLElement) => {
    const blockId = ele.getAttribute("data-block-id");
    const blockType = ele.getAttribute("data-block-type");
    return { blockId, blockType };
  };

  const handleBlockBlur: React.FocusEventHandler<HTMLElement> = (e) => {
    const ele = e.currentTarget;
    console.log("sync block content", ele);
    const blockInfo = getBlockInfo(ele);
    console.log("blockInfo", blockInfo);
    const newDocInfo = JSON.parse(JSON.stringify(docInfo));
    const newBlocks = [newDocInfo];
    const currBlock = findBlock(newBlocks, blockInfo.blockId);
    currBlock.blockProps.content = getNodeRefContent(blockInfo.blockId);
    setDocInfo(newDocInfo);
    // setActiveBlock(null);
  };

  const handleBlockClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      const ele = e.currentTarget;
      const blockId = ele.getAttribute("data-block-id");
      const blockType = ele.getAttribute("data-block-type");

      const item = { blockId, blockType };
      if (activeBlock?.blockId !== item.blockId) {
        // 设置当前激活块
        setActiveBlock(item);
        // 聚焦到当前块
        const currentBlock = ele;
        console.log("currentBlock", currentBlock);
        if (currentBlock) {
          currentBlock.focus();

          const selection = window.getSelection();
          const range = document.createRange();

          // 判断点击位置是否在内容区域之外
          const isClickContent = e.target === currentBlock;

          if (!isClickContent) {
            // 如果点击的是空白区域，将光标移动到内容末尾
            range.selectNodeContents(currentBlock);
            range.collapse(false); // 光标移动到内容末尾
          } else {
            // 如果点击的是内容区域，保持默认行为
            const offset = selection?.anchorOffset || 0;
            range.setStart(currentBlock.firstChild || currentBlock, offset);
          }
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    },
    [activeBlock]
  );

  const handleMenuSelect = (item) => {
    const { metaData, defaultProps } = item;

    const currentContent = getNodeRefContent(menuBlock.blockId);
    console.log("menuBlock", menuBlock, item, currentContent);
    const newDocInfo = JSON.parse(JSON.stringify(docInfo));
    const newBlocks = [newDocInfo];
    const currBlock = findBlock(newBlocks, menuBlock.blockId);
    currBlock.blockType = metaData.blockType;
    currBlock.blockProps = {
      ...defaultProps,
      content: currentContent.replace(/\//g, ""),
    };
    setDocInfo(newDocInfo);
    console.log("newDocInfo", newDocInfo);
    setActiveBlock(currBlock); // 更新当前激活的块

    focusOnBlock(currBlock.blockId); // 聚焦到新块
    setMenuBlock(null);
  };

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const currentBlock = getBlockInfo(e.target as HTMLElement);
      setHoveredBlock(currentBlock);
    },
    []
  );

  const handleMouseLeave = () => {
    // setHoveredBlock(null);
  };

  const handleBlockForKeyArrow = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const { blockId } = activeBlock;
    let targetBlock: NotionDocType<BlockType> | null = null;
    if (e.key === "ArrowUp") {
      // 找到当前块的前一个块
      const currentIndex = docItemList.findIndex(
        (item) => item.blockId === blockId
      );
      if (currentIndex === 0) {
        console.log("已经是第一个块");
        return;
      }
      targetBlock = docItemList[currentIndex - 1];
    } else {
      const currentIndex = docItemList.findIndex(
        (item) => item.blockId === blockId
      );
      console.log("currentIndex", currentIndex);
      if (currentIndex === docItemList.length - 1) {
        console.log("已经是最后一个块");
        return;
      }
      targetBlock = docItemList[currentIndex + 1];
    }
    if (targetBlock) {
      setActiveBlock(targetBlock);
      setTimeout(() => {
        const targetBlockRef = blockRef.current[targetBlock.blockId];
        if (targetBlockRef) {
          targetBlockRef.focus();
          // 将光标移动到内容的最前面
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(targetBlockRef);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 100);
    }
  };

  return {
    focusOnBlock,
    handleBlockForKeyEnter,
    handleBlockForKeyBackspace,
    handleBlockForInput,
    getNodeRef,
    blockRef,
    activeBlock,
    handleBlockFocus,
    setActiveBlock,
    getNodeRefContent,
    handleBlockClick,
    handleBlockBlur,
    handleDocClick,
    handleMenuSelect,
    setMenuBlock,
    handleMouseEnter,
    handleMouseLeave,
    hoveredBlock,
    handleBlockForKeyArrow,
  };
}
