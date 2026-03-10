"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react"; // Monaco Editor for VS Code feel

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
  const [fileTreeOpen, setFileTreeOpen] = useState(true);

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
        // Add AI response
        setMessages([
          ...updatedMessages,
          { 
            role: "assistant",             content: `✅ **Task Completed!**\n\n📝 I have generated the code for:\n${data.plan?.summary || "your request"}\n\nCheck the **Code** tab to view the changes.` 
          },
        ]);

        // Simulate Code Generation (In real app, this comes from AI)
        const generatedCode = `
<!DOCTYPE html>
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

        // Generate Preview URL (Simulated)
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
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: Chat & Settings */}
      <aside className={`w-80 flex flex-col bg-[#161b22] border-r border-[#30363d] transition-all duration-300 ${fileTreeOpen ? 'mr-0' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">N</div>
            <h1 className="font-bold text-lg">NEXUS AI</h1>
          </div>
          <button onClick={() => setMessages([])} className="w-full py-2 px-3 bg-[#238636] hover:bg-[#2ea043] rounded-md text-sm font-medium transition-colors">
            + New Chat
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-sm">Welcome to NEXUS AI Agent</p>
              <p className="text-xs mt-2">Ask me to build something...</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${
                msg.role === "user" 
                  ? "bg-[#1f6feb] text-white ml-auto max-w-[90%]" 
                  : msg.role === "system"
                  ? "bg-red-900/30 border border-red-800 text-red-200 mr-auto max-w-[90%]"
                  : "bg-[#21262d] border border-[#30363d] mr-auto max-w-[90%]"
              }`}>
                {msg.content}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-1 p-3 bg-[#21262d] rounded-lg w-fit">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#30363d] bg-[#0d1117]">
          <div className="flex gap-2">
            <input
              type="text"              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tell AI what to build..."
              disabled={loading}
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
          <div className="space-y-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="GitHub Repo (user/repo)"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch (main)"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </aside>

      {/* RIGHT AREA: Code & Preview */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="flex border-b border-[#30363d] bg-[#161b22]">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "chat" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            💬 Chat
          </button>          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "code" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            💻 Code Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
              {/* Messages are already rendered in Sidebar, but we can show history here too if needed */}
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
                language="html" // Change to 'javascript', 'typescript', etc. based on file
                theme="vs-dark"
                value={currentCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,                  scrollBeyondLastLine: false,
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
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
