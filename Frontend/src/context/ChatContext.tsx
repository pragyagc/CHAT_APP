import { createContext, useContext } from "react";

export const ChatContext = createContext<any>(null);

export const useChat = () => useContext(ChatContext);