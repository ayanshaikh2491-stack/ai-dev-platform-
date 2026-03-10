"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("ayanshaikh2491-stack/ai-dev-platform-");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoUrl, instruction: input, branch }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ Task Planned!\n\n📋 ${data.plan?.summary || ""}\n⏱️ ${data.plan?.estimatedTime || ""}`,
            timestamp: Date.now(),
          },
        ]);
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `❌ Error: ${error instanceof Error ? error.message : "Unknown"}`,
          timestamp: Date.now(),
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-[#1e1e28] bg-[#0a0a0f]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#c8ff00]">NEXUS AI Agent</h1>
            <p className="text-xs text-gray-500">Autonomous Dev Assistant</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c8ff00] to-[#84cc16] flex items-center justify-center font-bold text-black">N</div>
        </div>
      </header>

      {/* Settings */}
      <div className="p-4 bg-[#0a0a0f] border-b border-[#1e1e28] space-y-3">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="GitHub Repo (username/repo)"
          className="w-full bg-[#16161e] border border-[#1e1e28] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8ff00]"
        />
        <input          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="Branch (main)"
          className="w-full bg-[#16161e] border border-[#1e1e28] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8ff00]"
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-[#c8ff00] to-[#a3e635] text-black rounded-tr-md"
                  : msg.role === "system"
                  ? "bg-red-500/20 border border-red-500/50 text-red-300 rounded-tl-md"
                  : "bg-[#16161e] border border-[#1e1e28] rounded-tl-md"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              <p className="text-[10px] opacity-60 mt-2 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#16161e] border border-[#1e1e28] rounded-xl px-4 py-3">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-[#c8ff00] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#1e1e28] bg-[#0a0a0f] sticky bottom-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask AI to build something..."
            disabled={loading}
            className="flex-1 bg-[#16161e] border border-[#1e1e28] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c8ff00] disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-[#c8ff00] to-[#a3e635] text-black px-6 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-gray-500 text-center mt-2">
          Enter repository URL above before starting
        </p>
      </div>
    </div>
  );
}
