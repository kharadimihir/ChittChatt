import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./chatSocket";
import { getRoomMessages } from "@/services/axios";
import EmojiPicker from "emoji-picker-react";

const ChatRoom = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const currentRoom = JSON.parse(localStorage.getItem("activeRoom"));
  const user = JSON.parse(localStorage.getItem("user"));

  const bottomRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
  
    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);
  

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages
  useEffect(() => {
    if (!currentRoom?._id) return;

    const loadMessages = async () => {
      const res = await getRoomMessages(currentRoom._id);
      setMessages(res.data.messages);
    };

    loadMessages();
  }, [currentRoom?._id]);

  // Socket setup
  useEffect(() => {
    if (!currentRoom?._id) return;

    if (!socket.connected) socket.connect();

    socket.emit("join-room", currentRoom._id);

    socket.on("active-users", setActiveUsers);

    const handleReceive = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive-message", handleReceive);

    return () => {
      socket.off("receive-message", handleReceive);
      socket.off("active-users");
    };
  }, [currentRoom?._id]);

  const handleSendMessage = () => {
    if (!text.trim() || !currentRoom?._id) return;

    socket.emit("send-message", {
      roomId: currentRoom._id,
      text,
    });

    setText("");
    setShowEmoji(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <nav className="h-16 flex items-center justify-between px-4 bg-white/60 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h2 className="font-bold text-lg leading-none">
              {currentRoom?.title}
            </h2>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
              {currentRoom?.tag}
            </span>
          </div>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-primary">
            {activeUsers} Active
          </span>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-white/20">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex flex-col ${
              msg.sender?._id === user?.id ? "items-end" : "items-start"
            }`}
          >
            <span className="text-[10px] font-bold text-muted-foreground mb-1 ml-3 mr-3">
              {msg.sender?.handle || "Unknown"}
            </span>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-[1.5rem] shadow-sm ${
                msg.sender?._id === user?.id
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-white/80 text-foreground rounded-tl-sm"
              }`}
            >
              <p className="text-sm font-medium leading-relaxed">
                {msg.text}
              </p>
              <span
                className={`text-[9px] font-bold block mt-1 ${
                  msg.sender?._id === user?.id
                    ? "text-white/60"
                    : "text-muted-foreground"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white/40 backdrop-blur-xl border-t border-white/20">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="h-12 rounded-full border-none bg-white shadow-inner pl-6 pr-12 focus-visible:ring-primary"
            />

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowEmoji((prev) => !prev)}
              className="absolute right-12 top-1.5"
            >
              😊
            </Button>

            {showEmoji && (
              <div ref={emojiRef} className="cursor-pointer absolute bottom-14 right-4 z-50">
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setText((prev) => prev + emoji.emoji)
                  }
                />
              </div>
            )}

            <Button
              size="icon"
              onClick={handleSendMessage}
              className="cursor-pointer absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
