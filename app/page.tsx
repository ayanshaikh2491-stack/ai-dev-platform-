"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface FileChange {
  path: string;
  action: "create" | "edit" | "delete";
  content?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("ayanshaikh2491-stack/ai-dev-platform-");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview">("chat");
  const [currentCode, setCurrentCode] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const instruction = input;
    setInput("");
    setLoading(true);
    setActiveTab("chat");
    try {
      // Call AI Agent
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoUrl, instruction, branch }),
      });

      const data = await response.json();

      if (data.success) {
        // Show AI response
        const aiMessage: Message = {
          role: "assistant",
          content: `📋 **Plan:**\n${data.plan?.summary || "Task completed"}\n\n⏱️ **Time:** ${data.plan?.estimatedTime || "Unknown"}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Simulate file changes (you can integrate real GitHub API here)
        if (data.plan?.steps) {
          const changes = data.plan.steps.map((step: any) => ({
            path: step.file || "new-file.tsx",
            action: step.action as "create" | "edit",
            content: step.code || "// New code",
          }));
          setFileChanges(changes);
          if (changes.length > 0) {
            setCurrentCode(changes[0].content || "");
            setCurrentFile(changes[0].path);
          }
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "system",
        content: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#10a37f] to-[#1a7f64] flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="font-bold">NEXUS AI</h1>
            </div>
            <button
              onClick={() => setMessages([])}
              className="w-full px-3 py-2 rounded border border-gray-600 hover:bg-gray-700 text-sm"
            >
              + New Chat
            </button>
          </div>

          {/* File Changes */}
          {fileChanges.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-400">File Changes</h3>
              <div className="space-y-2">
                {fileChanges.map((change, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentCode(change.content || "");
                      setCurrentFile(change.path);
                      setActiveTab("code");
                    }}
                    className="w-full text-left px-3 py-2 rounded bg-gray-700/50 hover:bg-gray-700 text-sm"
                  >
                    <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${
                      change.action === "create" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {change.action.toUpperCase()}
                    </span>
                    {change.path}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="p-4 border-t border-gray-700 space-y-3">
            <input
              type="text"
              value={repoUrl}              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="username/repo"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-sm"
            />
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-sm"
            />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded hover:bg-gray-700"
          >
            ☰
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 rounded text-sm ${activeTab === "chat" ? "bg-[#10a37f] text-white" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-4 py-2 rounded text-sm ${activeTab === "code" ? "bg-[#10a37f] text-white" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              💻 Code
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded text-sm ${activeTab === "preview" ? "bg-[#10a37f] text-white" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              🌐 Preview
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Chat Tab */}          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-[#10a37f] text-white"
                        : msg.role === "system"
                        ? "bg-red-500/20 border border-red-500 text-red-300"
                        : "bg-gray-800 border border-gray-700"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Tell AI what to build..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-[#10a37f]"
                  />
