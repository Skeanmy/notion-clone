import type { BlockType, BlockPropsMap } from "./BaseBlock";

export interface NotionDocType<T extends BlockType> {
  blockId: string;
  blockType: T;
  blockSeq?: string;
  numberedItemIdx?: number;
  blockProps: BlockPropsMap[T];
  childrenList?: NotionDocType<BlockType>[];
}
