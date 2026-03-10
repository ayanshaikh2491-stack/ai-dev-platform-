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
    <div className="flex h-screen bg-[#050508] text-white overflow-hidden">
            {/* LEFT SIDEBAR: Settings Only */}
      <aside className="w-72 bg-[#0a0a0f] border-r border-[#1e1e28] flex flex-col shadow-xl z-20">
        {/* Logo Area */}
        <div className="p-6 border-b border-[#1e1e28]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">N</div>
            <div>
              <h1 className="font-bold text-lg">NEXUS AI</h1>
              <p className="text-xs text-gray-500">Dev Assistant</p>
            </div>
          </div>
          
          <button
            onClick={() => setMessages([])}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all shadow-md"
          >
            + New Chat
          </button>
        </div>

        {/* Settings Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Repository</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="username/repo-name"
              className="w-full px-4 py-3 bg-[#16161e] border border-[#1e1e28] rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-4 py-3 bg-[#16161e] border border-[#1e1e28] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
          </div>

          <div className="pt-4 border-t border-[#1e1e28]">
            <div className="bg-[#16161e] p-4 rounded-lg border border-[#1e1e28]">
              <p className="text-xs text-gray-400 mb-2">Capabilities:</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Web Development (React, Next.js)</li>
                <li>• Mobile Apps (React Native)</li>                <li>• Backend APIs (Node.js)</li>
                <li>• Database (MongoDB, SQL)</li>
                <li>• DevOps (Vercel, GitHub)</li>
                <li>• Debugging & Fixes</li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: Professional Chat UI */}
      <main className="flex-1 flex flex-col relative">
        
        {/* TOP TABS */}
        <div className="flex border-b border-[#1e1e28] bg-[#0a0a0f]">
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

        {/* CHAT TAB CONTENT */}
        {activeTab === "chat" && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {messages.length === 0 ? (
              // WELCOME SCREEN (AI Agency Style)
              <div className="max-w-4xl mx-auto text-center mt-10">
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-bounce-slow">
                    <span className="text-white text-4xl font-bold">N</span>                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                  Welcome to NEXUS AI
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Your autonomous development assistant. I can create, edit, debug, and deploy code across multiple platforms.
                </p>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {[
                    { icon: "🔐", title: "Create Login Page", desc: "With email & password authentication" },
                    { icon: "📧", title: "Contact Form", desc: "With form validation & error handling" },
                    { icon: "🧭", title: "Navigation Bar", desc: "Responsive with mobile menu toggle" },
                    { icon: "🌓", title: "Dark Mode Toggle", desc: "Switch between light/dark themes" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(item.desc)}
                      className="group relative p-6 bg-[#16161e] hover:bg-[#1e1e28] border border-[#1e1e28] hover:border-blue-500/50 rounded-2xl text-left transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                        <div className="font-semibold mb-2 group-hover:text-blue-400 transition-colors duration-300 text-lg">{item.title}</div>
                        <div className="text-sm text-gray-400 leading-relaxed">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <p className="text-sm text-gray-500">Or type your custom request below 👇</p>
              </div>
            ) : (
              // CHAT HISTORY
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-6 py-4 backdrop-blur-sm ${
                      msg.role === "user" 
                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white ml-auto rounded-br-md shadow-lg shadow-blue-600/30 border border-blue-500/30" 
                        : msg.role === "system"
                        ? "bg-red-950/30 border border-red-900/50 text-red-200 mr-auto rounded-bl-md shadow-lg shadow-red-900/20"
                        : "bg-[#16161e] border border-[#1e1e28] mr-auto rounded-bl-md shadow-lg shadow-blue-900/10"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#16161e] border border-[#1e1e28] rounded-2xl rounded-bl-md px-6 py-4 shadow-lg shadow-blue-900/10">
                      <div className="flex gap-2">
                        {[0, 150, 300].map((delay, i) => (
                          <div key={i} className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CODE EDITOR TAB */}
        {activeTab === "code" && (
          <div className="flex-1 relative bg-[#0d1117]">
             <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                <span className="text-xs text-gray-400">src/</span>
                <span className="text-xs font-mono text-blue-400">{currentFile}</span>
              </div>
            <Editor
              height="100%"
              language="html"
              theme="vs-dark"
              value={currentCode}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on" }}
            />
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === "preview" && (
          <div className="flex-1 bg-white">
            {previewUrl ? (
              <iframe src={previewUrl} className="w-full h-full border-0" title="Live Preview" sandbox="allow-scripts allow-same-origin" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No Preview Available</p>
              </div>
            )}
          </div>
        )}

        {/* INPUT BAR (Bottom of Chat Tab) */}
        {activeTab === "chat" && (
          <div className="border-t border-[#1e1e28] bg-[#0a0a0f] p-4 sticky bottom-0 z-10">            <div className="max-w-4xl mx-auto relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Tell me what to build..."
                disabled={loading}
                className="w-full px-6 py-4 bg-[#16161e] border border-[#1e1e28] hover:border-blue-500/50 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all duration-300 placeholder-gray-500 shadow-lg group-hover:shadow-xl"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/30 transform hover:scale-105"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
