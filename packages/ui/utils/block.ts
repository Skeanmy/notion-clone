import type { BlockType } from "../types/BaseBlock";
import type { NotionDocType } from "../types/Doc";

export const findBlock = (
  blocks: NotionDocType<BlockType>[],
  id: string
): NotionDocType<BlockType> | null => {
  for (const block of blocks) {
    if (block.blockId === id) return block;
    if (block.childrenList) {
      const found = findBlock(block.childrenList, id);
      if (found) return found;
    }
  }
  return null;
};

export const findBlockPrevious = (
  blocks: NotionDocType<BlockType>[],
  id: string
): NotionDocType<BlockType> | null => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].blockId === id) {
      if (i === 0) return null;
      return blocks[i - 1];
    }
    if (blocks[i].childrenList) {
      const found = findBlockPrevious(blocks[i].childrenList, id);
      if (found) return found;
    }
  }
  return null;
};

export const findBlockNext = (
  blocks: NotionDocType<BlockType>[],
  id: string
): NotionDocType<BlockType> | null => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].blockId === id) {
      if (i === blocks.length - 1) return null;
      return blocks[i + 1];
    }
    if (blocks[i].childrenList) {
      const found = findBlockNext(blocks[i].childrenList, id);
      if (found) return found;
    }
  }
  return null;
};

// 根据位置插入拖拽的块
export const insertBlock = (
  blocks: NotionDocType<BlockType>[],
  targetId: string,
  block: NotionDocType<BlockType>,
  position: "before" | "after" | "inside"
) => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].blockId === targetId) {
      if (position === "before") {
        blocks.splice(i, 0, block);
      } else if (position === "after") {
        blocks.splice(i + 1, 0, block);
      } else if (position === "inside") {
        if (!blocks[i].childrenList) blocks[i].childrenList = [];
        blocks[i].childrenList.push(block);
      }
      return true;
    }
    if (
      blocks[i].childrenList &&
      insertBlock(blocks[i].childrenList, targetId, block, position)
    ) {
      return true;
    }
  }
  return false;
};

// 从原父节点中移除拖拽的块
export const removeBlock = (
  blocks: NotionDocType<BlockType>[],
  id: string
): boolean => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].blockId === id) {
      blocks.splice(i, 1);
      return true;
    }
    if (blocks[i].childrenList && removeBlock(blocks[i].childrenList, id)) {
      return true;
    }
  }
  return false;
};
