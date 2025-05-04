export type HeaderBlockType = "PageHeader" | "H1" | "H2" | "H3";

interface BaseContentProps {
  content: string;
}

// 定义不同 blockType 的 props 类型
export type BlockPropsMap = {
  Page: BaseContentProps;
  PageHeader: BaseContentProps & { level: "1" };
  H1: BaseContentProps & { level: "1" };
  H2: BaseContentProps & { level: "2" };
  H3: BaseContentProps & { level: "3" };
  Text: BaseContentProps;
  BulletedList: BaseContentProps & { listType: "bullet" };
  NumberedList: BaseContentProps & { listType: "number" };
};

export type BlockEvent = {
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInput: (event: React.FormEvent<HTMLElement>) => void;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur: React.FocusEventHandler<HTMLElement>;
  onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseEnter: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

export type BlockType = keyof BlockPropsMap;

export type ListBlock = "BulletedList" | "NumberedList";

export type HeaderBaseBlockProps<T extends HeaderBlockType> = BaseBlockProps<T>;

export type ListBaseBlockProps<T extends ListBlock> = BaseBlockProps<T>;

export interface BaseBlockProps<T extends BlockType> extends BlockEvent {
  blockId: string;
  blockSeq?: string;
  numberedItemIdx?: number;
  blockType: T;
  placeholder?: string;
  contentEditable: boolean;
  blockProps: BlockPropsMap[T];
  renderChildrenList?: React.ReactNode;
}


export interface NotionCompProps<T extends BlockType> {
  defaultProps: BlockPropsMap[T];
  component: React.ForwardRefExoticComponent<
    BaseBlockProps<T> & React.RefAttributes<HTMLElement>
  >;
  toolBar?: string[];
  isShowInMenu?: boolean;
  metaData: {
    blockType: T;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    placeholder?: string;
  };
}
