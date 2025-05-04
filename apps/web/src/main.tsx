import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { Editor } from "@repo/ui";

const App = () => {
  return (
    <div>
      <Editor />
    </div>
  );
};

createRoot(document.getElementById("app")!).render(<App />);
