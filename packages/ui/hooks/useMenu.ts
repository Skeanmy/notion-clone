import React, { useState, useEffect, useRef } from "react";

export default function useMenu(props) {
  const { activeBlock, setMenuBlock, handleMenuSelect } = props;

  const [showMenu, setShowMenu] = useState(false); // 控制下拉框显示

  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 }); // 下拉框位置
  const menuRef = useRef<HTMLDivElement | null>(null); // 用于引用弹窗 DOM 节点

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false); // 点击弹窗外部时关闭弹窗
    }
  };

  const onMenuSelect = (item) => {
    handleMenuSelect(item); // 处理菜单项选择
    setShowMenu(false); // 隐藏下拉框
  };

  useEffect(() => {
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleInputWithItalic = (e: React.FormEvent<HTMLElement>) => {
    // if (activeBlock)
    console.log("activeBlock", activeBlock);
    if (activeBlock && activeBlock.blockType === "PageHeader") return;
    setMenuBlock(activeBlock);
    const rect = e.currentTarget.getBoundingClientRect();
    console.log(e.currentTarget, rect);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const { x, y } = range.getBoundingClientRect();
      setMenuPosition({ x, y: y + 30 });
      setShowMenu(true);
    }
  };

  return {
    showMenu,
    menuRef,
    handleInputWithItalic,
    menuPosition,
    onMenuSelect,
    setShowMenu,
  };
}
