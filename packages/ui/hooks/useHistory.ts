// 历史记录的逻辑写在这里
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { message } from "antd";
function usePrevious<T>(value: T) {
  const ref = useRef<T>({} as T);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function useHistory({ docInfo, setDocInfo }) {
  const isRestoring = useRef(false); // 标志位：是否正在恢复历史记录
  const [historyRecord, setHistoryRecord] = useState<
    Array<{
      editTime: string;
      author: string;
      content: typeof docInfo;
    }>
  >([]); // 历史记录

  const [currPointer, setCurrPointer] = useState(0); // 当前指针
  const prevDocInfo = usePrevious(docInfo); // 上一次的docInfo

  useEffect(() => {
    if (isRestoring.current) {
      // 如果正在恢复历史记录，跳过新增逻辑
      isRestoring.current = false;
      return;
    }
    if (
      prevDocInfo &&
      JSON.stringify(prevDocInfo) !== JSON.stringify(docInfo)
    ) {
      const hisData = {
        editTime: new Date().toLocaleString(),
        author: "Author1",
        content: docInfo,
      };
      window.localStorage.setItem("$$docInfo", JSON.stringify(docInfo));
      const newHistory = [...historyRecord, hisData];
      setHistoryRecord(newHistory);
      setCurrPointer(newHistory.length - 1);
    } else {
      console.log("no change");
    }
  }, [docInfo]);

  const historyRecordTree = useMemo(() => {
    return historyRecord.map((item, index) => {
      return {
        children: item.editTime,
        label: item.author,
        color: currPointer === index ? "red" : "green",
      };
    });
  }, [historyRecord, currPointer]);

  const goToHistory = (index: number) => {
    isRestoring.current = true; // 设置标志位为 true
    setCurrPointer(index);
    const hisData = historyRecord[index];
    setDocInfo(hisData.content);
  };

  const goBack = useCallback(() => {
    if (currPointer > 0) {
      isRestoring.current = true; // 设置标志位为 true，避免新增记录
      const previousPointer = currPointer - 1;
      setCurrPointer(previousPointer);
      const hisData = historyRecord[previousPointer];
      setDocInfo(hisData.content); // 恢复上一步的内容
    } else {
      console.log("已经是第一步，无法回退！");
      message.warning("已经是第一步，无法回退！");
    }
  }, [currPointer, historyRecord, setDocInfo]);

  const goForward = useCallback(() => {
    if (currPointer < historyRecord.length - 1) {
      isRestoring.current = true; // 设置标志位为 true，避免新增记录
      const nextPointer = currPointer + 1;
      setCurrPointer(nextPointer);
      const hisData = historyRecord[nextPointer];
      setDocInfo(hisData.content); // 恢复下一步的内容
    } else {
      console.log("已经是最后一步，无法前进！");
      message.warning("已经是最后一步，无法前进！");
    }
  }, [currPointer, historyRecord, setDocInfo]);

  return {
    historyRecord,
    currPointer,
    setHistoryRecord,
    setCurrPointer,
    historyRecordTree,
    goToHistory,
    goBack,
    goForward,
  };
}
