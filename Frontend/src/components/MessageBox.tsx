import React from "react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

interface MessageBoxProps {
  type: "success" | "error";
  message: string;
  show: boolean;
}

export const MessageBox: React.FC<MessageBoxProps> = ({ type, message, show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!show && !visible) return null;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl text-sm border w-70 ml-auto shadow-md transition-all duration-300 transform break-words overflow-hidden",
        type === "error" && "bg-red-100 border-red-500 text-red-700",
        type === "success" && "bg-green-100 border-green-500 text-green-700"
      )}
    >
      {message}
    </div>
  );
};