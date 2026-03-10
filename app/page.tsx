"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("ayanshaikh2491-stack/ai-dev-platform-");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview">("chat");
  
  // Code & Preview State
  const [currentCode, setCurrentCode] = useState("// Code will appear here...");
  const [currentFile, setCurrentFile] = useState("index.html");
  const [previewUrl, setPreviewUrl] = useState("");

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setActiveTab("chat");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoUrl, instruction: input, branch }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages([
          ...updatedMessages,
          { 
            role: "assistant", 
            content: `✅ **Task Completed!**\n\n📝 I have generated the code for:\n${data.plan?.summary || "your request"}\n\nCheck the **Code** tab to view the changes.` 
          },        ]);

        // Simulate Code Generation
        const generatedCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>NEXUS AI Project</title>
    <style>
        body { font-family: sans-serif; background: #f0f0f0; padding: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        h1 { color: #333; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Welcome to NEXUS AI</h1>
        <p>This is a professional website built by AI.</p>
        <button onclick="alert('Hello from Nexus AI!')">Click Me</button>
    </div>
</body>
</html>`;
        
        setCurrentCode(generatedCode);
        setCurrentFile("index.html");
        setActiveTab("code");

        // Generate Preview URL
        const [owner, name] = repoUrl.split("/");
        setPreviewUrl(`https://${name}-git-${branch}-${owner.toLowerCase().replace(/[^a-z0-9]/g, "-")}.vercel.app`);

      } else {
        setMessages([
          ...updatedMessages,
          { role: "system", content: `❌ Error: ${data.error}` },
        ]);
      }
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { role: "system", content: "❌ Connection error" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
            {/* LEFT SIDEBAR: Chat & Settings */}
      <aside className={`w-80 bg-[#0a0a0f] border-r border-[#1a1a2e] flex flex-col shadow-2xl z-20 transition-all duration-300`}>
        {/* Header */}
        <div className="p-6 border-b border-[#1a1a2e] bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]"></div>
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NEXUS AI
              </h1>
              <p className="text-xs text-gray-400 mt-1">Autonomous Dev Agent ✨</p>
            </div>
          </div>
          <button
            onClick={() => setMessages([])}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-sm">Welcome to NEXUS AI Agent</p>
              <p className="text-xs mt-2">Ask me to build something...</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`p-4 rounded-xl text-sm backdrop-blur-sm ${
                msg.role === "user" 
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white ml-auto max-w-[90%] rounded-br-md shadow-lg shadow-blue-600/30 border border-blue-500/30" 
                  : msg.role === "system"
                  ? "bg-red-950/30 border border-red-900/50 text-red-200 mr-auto max-w-[90%] rounded-bl-md shadow-lg shadow-red-900/20"
                  : "bg-[#14141e] border border-[#1a1a2e] mr-auto max-w-[90%] rounded-bl-md shadow-lg shadow-blue-900/10"
              }`}>
                {msg.content}
              </div>
            ))
          )}
          {loading && (            <div className="flex gap-1 p-3 bg-[#14141e] border border-[#1a1a2e] rounded-xl w-fit shadow-lg">
              {[0, 150, 300].map((delay, i) => (
                <div key={i} className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }}></div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#1a1a2e] bg-[#0a0a0f]">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tell me what to build..."
              disabled={loading}
              className="w-full px-4 py-3 bg-[#14141e] border border-[#1a1a2e] hover:border-blue-500/50 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all duration-300 placeholder-gray-500 shadow-lg group-hover:shadow-xl"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/30 transform hover:scale-105"
            >
              Send
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="p-6 border-t border-[#1a1a2e] bg-[#0a0a0f]">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                GitHub Repository
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-3 bg-[#14141e] border border-[#1a1a2e] hover:border-blue-500/50 focus:border-blue-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500"
                placeholder="username/repo-name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-2 flex items-center gap-2">                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-4 py-3 bg-[#14141e] border border-[#1a1a2e] hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-500"
                placeholder="main"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT AREA: Code & Preview */}
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Tabs */}
        <div className="flex border-b border-[#1a1a2e] bg-[#0a0a0f]">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "chat" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "code" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            💻 Code Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "preview" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            🌐 Live Preview
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-[#0d1117]">
                    {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div className="absolute inset-0 p-4 overflow-y-auto">
              <div className="text-center text-gray-500 mt-10">
                <p>Switch to the left panel to chat.</p>
              </div>
            </div>
          )}

          {/* CODE EDITOR TAB */}
          {activeTab === "code" && (
            <div className="absolute inset-0 flex flex-col">
              {/* File Path Bar */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                <span className="text-xs text-gray-400">src/</span>
                <span className="text-xs font-mono text-blue-400">{currentFile}</span>
              </div>
              {/* Monaco Editor */}
              <Editor
                height="100%"
                language="html"
                theme="vs-dark"
                value={currentCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === "preview" && (
            <div className="absolute inset-0 bg-white">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-6xl mb-4">🌐</div>
                  <p className="text-lg font-medium">No Preview Available</p>
                  <p className="text-sm mt-2">Make a request to generate code and see the live preview.</p>
                </div>              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
