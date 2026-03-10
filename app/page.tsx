"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  code?: string;
  fileName?: string;
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
  const [showSidebar, setShowSidebar] = useState(true);

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
        // Show AI response
        const aiMessage: Message = {
          role: "assistant",
          content: `✅ **Task Planned**\n\n📋 ${data.plan?.summary || "Processing..."}\n⏱️ ${data.plan?.estimatedTime || ""}`,
        };
        setMessages([...updatedMessages, aiMessage]);
        // If code generated, show in Code tab
        if (data.plan?.steps?.[0]?.code) {
          setCurrentCode(data.plan.steps[0].code);
          setCurrentFile(data.plan.steps[0].file || "new-file.tsx");
        }

        // Generate preview URL
        const [owner, name] = repoUrl.split("/");
        setPreviewUrl(`https://${name}-git-${branch}-${owner.toLowerCase().replace(/[^a-z0-9]/g, "-")}.vercel.app`);

      } else {
        setMessages([...updatedMessages, { 
          role: "system", 
          content: `❌ Error: ${data.error}` 
        }]);
      }
    } catch (error) {
      setMessages([...updatedMessages, { 
        role: "system", 
        content: "❌ Connection error" 
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-72 bg-[#0f0f0f] border-r border-[#1a1a1a] flex flex-col">
          <div className="p-4 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="font-bold">NEXUS AI</h1>
                <p className="text-xs text-gray-500">Dev Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium"
            >
              + New Chat
            </button>
          </div>
          {/* Features */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {[
              { icon: "🎨", title: "Web Dev", desc: "React, Next.js" },
              { icon: "📱", title: "Mobile", desc: "React Native" },
              { icon: "⚙️", title: "Backend", desc: "Node.js, API" },
              { icon: "🗄️", title: "Database", desc: "MongoDB, SQL" },
              { icon: "🚀", title: "Deploy", desc: "Vercel, GitHub" },
              { icon: "🐛", title: "Debug", desc: "Fix errors" },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-[#141414] rounded-lg">
                <div className="flex items-center gap-2">
                  <span>{f.icon}</span>
                  <span className="text-sm font-medium">{f.title}</span>
                </div>
                <p className="text-xs text-gray-500 ml-7">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-[#1a1a1a] space-y-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="username/repo"
              className="w-full px-3 py-2 bg-[#141414] border border-[#1a1a1a] rounded text-sm"
            />
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch"
              className="w-full px-3 py-2 bg-[#141414] border border-[#1a1a1a] rounded text-sm"
            />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0f0f0f]">
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-2">☰</button>
          <div className="flex gap-2">
            {["chat", "code", "preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}                className={`px-4 py-2 rounded text-sm ${
                  activeTab === tab 
                    ? "bg-blue-600 text-white" 
                    : "bg-[#141414] hover:bg-[#1a1a1a]"
                }`}
              >
                {tab === "chat" ? "💬" : tab === "code" ? "💻" : "🌐"} {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center mt-20">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-4xl font-bold">N</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">NEXUS AI Agent</h2>
                    <p className="text-gray-500 mb-6">Ask me to build anything...</p>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      {["Add login page", "Create contact form", "Add dark mode", "Fix navbar"].map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(ex)}
                          className="p-3 bg-[#141414] rounded-lg text-left text-sm hover:bg-[#1a1a1a]"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                        msg.role === "user" 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 rounded-br-md"
                          : msg.role === "system"
                          ? "bg-red-950/30 border border-red-900 text-red-300 rounded-bl-md"
                          : "bg-[#141414] border border-[#1a1a1a] rounded-bl-md"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#141414] border border-[#1a1a1a] rounded-2xl px-5 py-3">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((d, i) => (
                          <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[#1a1a1a] bg-[#0f0f0f]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Tell me what to build..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-[#141414] border border-[#1a1a1a] rounded-xl focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Code Tab */}
          {activeTab === "code" && (
            <div className="h-full bg-[#0a0a0a]">
              {currentCode ? (
                <pre className="p-4 text-sm overflow-auto h-full">
                  <code className="text-gray-300">{currentCode}</code>
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Code will appear here after AI generates it</p>
                </div>
              )}
            </div>          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="h-full bg-white">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌐</div>
                    <p>Make a request to see live preview</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
      }
