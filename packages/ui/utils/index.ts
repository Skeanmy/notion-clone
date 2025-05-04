import { v4 as uuidv4 } from "uuid";

export const generateUniqueId = () => uuidv4();

// 解析光标位置
export function getCursorPosition(range: Range) {
  const startContainer = range.startContainer;
  const startOffset = range.startOffset;
  const isTextNode = startContainer.nodeType === Node.TEXT_NODE;
  const isElementNode = startContainer.nodeType === Node.ELEMENT_NODE;
  let isAtStart = false;
  let isAtEnd = false;

  if (isTextNode) {
    // 光标在文本节点内：offset=0 表示文本开头，offset=length 表示文本末尾
    isAtStart = startOffset === 0;
    isAtEnd = startOffset === startContainer.textContent?.length;
    return {
      type: "text",
      node: startContainer,
      offset: startOffset,
      isAtStart,
      isAtEnd,
    };
  } else if (isElementNode) {
    // 光标在元素节点前（offset=0）或元素内子节点之间
    if (startOffset === 0) {
      // 光标在元素前（如 <div>光标</div>）
      isAtStart = true;
      return {
        type: "element_before",
        node: startContainer,
        offset: startOffset,
        isAtStart,
        isAtEnd: false,
      };
    } else if (startOffset === startContainer.childNodes.length) {
      // 光标在元素后（如 <div>内容</div>光标）
      isAtEnd = true;
      return {
        type: "element_after",
        node: startContainer,
        offset: startOffset,
        isAtStart: false,
        isAtEnd,
      };
    } else {
      // 光标在元素的子节点之间
      return {
        type: "element_inner",
        node: startContainer,
        offset: startOffset,
        isAtStart: false,
        isAtEnd: false,
      };
    }
  }

  return { isAtStart: false, isAtEnd: false };
}

// 给dom元素插入默认值
export const insertDefaultValue = (dom: HTMLElement, defaultValue: string) => {
  if (dom) {
    dom.innerHTML = defaultValue;
    // 将光标定位到默认值的末尾
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(dom);
    range.collapse(false); // 将光标移动到内容末尾
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};


// 工具函数：生成罗马数字
export const toRoman = (num: number): string => {
  const romanMap = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ] as const;

  let result = "";
  for (const [roman, value] of romanMap) {
    while (num >= value) {
      result += roman;
      num -= value;
    }
  }
  return result;
};