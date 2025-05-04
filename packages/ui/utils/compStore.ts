import type { BlockType, NotionCompProps } from "../types/BaseBlock";

const notionCompStore: Record<
  BlockType,
  NotionCompProps<BlockType>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = {} as any;

const notionComponentManager = {
  registerComponent: <T extends BlockType>(component: NotionCompProps<T>) => {
    // console.log("component", component);
    if (!component.metaData) {
      console.warn(`Component does not have metaData.`);
      return;
    }
    const { metaData } = component;
    const { blockType } = metaData;

    if (notionCompStore[blockType]) {
      console.warn(`Component with type ${blockType} already registered.`);
      return;
    }
    notionCompStore[blockType] = component;
  },
  getComponent: (type: BlockType) => {
    return notionCompStore[type];
  },
  getAllComponents: () => {
    return notionCompStore;
  },
  getComponentList: () => {
    return Object.values(notionCompStore)
      .filter((i) => i.isShowInMenu !== false)
      .map((comp) => {
        return {
          blockType: comp.metaData.blockType,
          compName: comp.metaData.title,
          compData: comp,
        };
      });
  },
};

export default notionComponentManager;
