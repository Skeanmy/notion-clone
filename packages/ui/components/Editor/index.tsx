import React, { useState, useMemo, useEffect } from "react";
import { generateUniqueId } from "../../utils";
import Menu from "../Menu";
import { Timeline } from "antd";
import useBlock from "../../hooks/useBlock";
import useMenu from "../../hooks/useMenu";
import useHistory from "../../hooks/useHistory";
import "./index.css";
import type { BlockType } from "../../types/BaseBlock";
import type { NotionDocType } from "../../types/Doc";
import NotionDoc from "../Doc/index";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// 实现一个Page组件，带children
let initDocInfo: NotionDocType<BlockType> = {
  blockType: "Page",
  blockId: generateUniqueId(),
  blockProps: {
    content: "",
  },
  childrenList: [
    {
      blockId: generateUniqueId(), // 随机生成id
      blockType: "H1",
      blockProps: {
        content: "欢迎使用 Notion Demo",
      },
    },
    {
      blockId: generateUniqueId(), // 随机生成id
      blockType: "H2",
      blockProps: {
        content: "二级标题",
      },
    },
    {
      blockId: generateUniqueId(), // 随机生成id
      blockType: "H3",
      blockProps: {
        content: "三级标题",
      },
    },
    {
      blockId: generateUniqueId(),
      blockType: "Text",
      blockProps: {
        content: "",
      },
    },
    {
      blockId: generateUniqueId(),
      blockType: "BulletedList",
      blockProps: {
        content: "1",
      },
      childrenList: [
        {
          blockId: generateUniqueId(),
          blockType: "BulletedList",
          blockProps: {
            content: "1-1",
          },
          childrenList: [
            {
              blockId: generateUniqueId(),
              blockType: "BulletedList",
              blockProps: {
                content: "1-1-1",
              },
              childrenList: [
                {
                  blockId: generateUniqueId(),
                  blockType: "BulletedList",
                  blockProps: {
                    content: "1-1-1-1",
                  },
                  childrenList: [
                    {
                      blockId: generateUniqueId(),
                      blockType: "BulletedList",
                      blockProps: {
                        content: "1-1-1-1-1",
                      },
                      childrenList: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          blockId: generateUniqueId(),
          blockType: "BulletedList",
          blockProps: {
            content: "1-2",
          },
          childrenList: [],
        },
      ],
    },
    {
      blockId: generateUniqueId(),
      blockType: "NumberedList",
      blockProps: {
        content: "1",
      },
      childrenList: [
        {
          blockId: generateUniqueId(),
          blockType: "NumberedList",
          blockProps: {
            content: "1-1",
          },
          childrenList: [
            {
              blockId: generateUniqueId(),
              blockType: "NumberedList",
              blockProps: {
                content: "1-1-1",
              },
              childrenList: [
                {
                  blockId: generateUniqueId(),
                  blockType: "NumberedList",
                  blockProps: {
                    content: "1-1-1-1",
                  },
                  childrenList: [
                    {
                      blockId: generateUniqueId(),
                      blockType: "NumberedList",
                      blockProps: {
                        content: "1-1-1-1-1",
                      },
                      childrenList: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          blockId: generateUniqueId(),
          blockType: "NumberedList",
          blockProps: {
            content: "1-2",
          },
          childrenList: [],
        },
      ],
    },
    {
      blockId: generateUniqueId(),
      blockType: "NumberedList",
      blockProps: {
        content: "2",
      },
    },
  ],
};

if (window.localStorage.getItem("$$docInfo")) {
  initDocInfo = JSON.parse(window.localStorage.getItem("$$docInfo") || "{}");
}

const addSeq = (blocks: NotionDocType<BlockType>[], prevIndex?: string) => {
  const blockOnlyNumberedList = blocks.filter(
    (block) => block.blockType === "NumberedList"
  );
  blocks.forEach((block, index) => {
    block.blockSeq = prevIndex ? `${prevIndex}-${index}` : `${index}`;
    if (block.blockType === "NumberedList") {
      const idx = blockOnlyNumberedList.findIndex(
        (b) => b.blockId === block.blockId
      );
      block.numberedItemIdx = idx + 1;
    }

    if (block.childrenList) {
      addSeq(block.childrenList, block.blockSeq);
    }
  });
};

function Editor() {
  // 文档信息
  const [docInfo, setDocInfo] = useState<NotionDocType<BlockType>>(initDocInfo);

  const docList = useMemo(() => {
    const newDocInfo = JSON.parse(JSON.stringify(docInfo));
    const newBlocks = [newDocInfo];

    addSeq(newBlocks);
    return newBlocks;
  }, [docInfo]);

  // console.log('docList', docList)

  const { historyRecordTree, goToHistory, goBack, goForward } = useHistory({
    docInfo,
    setDocInfo,
  });

  const {
    activeBlock,
    setMenuBlock,
    handleBlockForKeyEnter,
    handleBlockForKeyBackspace,
    handleBlockForInput,
    getNodeRef,
    handleBlockClick,
    handleBlockBlur,
    // handleBlockFocus,
    handleMenuSelect,
    handleMouseEnter,
    handleMouseLeave,
    hoveredBlock,
    handleBlockForKeyArrow,
    handleDocClick,
  } = useBlock({
    docInfo,
    setDocInfo,
    docList,
  });

  const {
    showMenu,
    setShowMenu,
    handleInputWithItalic,
    menuRef,
    menuPosition,
    onMenuSelect,
  } = useMenu({
    activeBlock,
    setMenuBlock,
    docInfo,
    setDocInfo,
    handleMenuSelect,
  });

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const text = e.currentTarget.textContent || "";
    console.log(text);
    // 检测并移除自动插入的 <br> 元素
    if (text === "" && e.currentTarget.childNodes.length === 1) {
      const firstChild = e.currentTarget.childNodes[0];
      if (firstChild.nodeName === "BR") {
        e.currentTarget.innerHTML = ""; // 清空内容
      }
    }
    handleBlockForInput(text); // 处理输入事件
    // 检测输入 `/` 显示悬浮窗
    if (text.startsWith("/")) {
      handleInputWithItalic(e);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        console.log("Ctrl + Z 被按下");
        goBack(); // 回退到上一步
      }

      if (e.ctrlKey && e.key === "y") {
        console.log("Ctrl + Y 被按下");
        goForward(); // 前进到下一步
      }
    };

    // 添加全局键盘事件监听器
    window.addEventListener("keydown", handleGlobalKeyDown);

    // 在组件卸载时移除监听器
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [goBack, goForward]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleBlockForKeyEnter(e);
    }

    if (e.key === "Escape") {
      if (showMenu) {
        setShowMenu(false);
      }
    }

    if (e.key === "Backspace") {
      handleBlockForKeyBackspace();
    }

    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      handleBlockForKeyArrow(e);
    }
  };

  const handleTimelineClick = (item, index) => {
    console.log("Clicked timeline item:", item, index);
    goToHistory(index);
  };

  return (
    <div className="notion-editor">
      <DndProvider backend={HTML5Backend}>
        <NotionDoc
          hoveredBlock={hoveredBlock}
          setDocInfo={setDocInfo}
          docInfo={docList[0]}
          contentEditable={true}
          onDocClick={handleDocClick}
          // onFocus={(e) => {
          //   console.log("focus");
          //   handleBlockFocus(e);
          // }}
          onClick={handleBlockClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onBlur={handleBlockBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          ref={(ref: HTMLElement | null) => {
            if (ref) {
              const blockId = ref?.getAttribute("data-block-id");
              getNodeRef(blockId, ref);
            }
          }}
        />
      </DndProvider>
      <div className="notion-editor-timeline">
        <Timeline
          mode="left"
          items={historyRecordTree.map((item, index) => ({
            ...item,
            onClick: () => handleTimelineClick(item, index), // 添加点击事件
          }))}
        />
      </div>

      <Menu
        showMenu={showMenu}
        ref={menuRef}
        menuPosition={menuPosition}
        onMenuSelect={onMenuSelect}
      />
    </div>
  );
}

export default Editor;
