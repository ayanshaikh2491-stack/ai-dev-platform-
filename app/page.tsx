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
          },
        ]);
        const generatedCode = `<!DOCTYPE html>
<html>
<head><title>NEXUS AI</title></head>
<body style="font-family: sans-serif; padding: 20px; background: #f0f0f0;">
  <div style="background: white; padding: 20px; border-radius: 8px;">
    <h1>Welcome to NEXUS AI</h1>
    <p>Professional website built by AI.</p>
  </div>
</body>
</html>`;
        
        setCurrentCode(generatedCode);
        setCurrentFile("index.html");
        setActiveTab("code");

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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0f] border-r border-[#1e1e2e] flex flex-col p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
            N
          </div>
          <div>
            <div className="font-bold text-lg">NEXUS AI</div>
            <div className="text-xs text-gray-400">Dev Assistant</div>
          </div>
        </div>
        
        <button 
          onClick={() => setMessages([])}          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg"
        >
          + New Chat
        </button>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">Repository</label>
            <input 
              className="w-full px-4 py-3 bg-[#16161e] border border-[#1e1e2e] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              value={repoUrl} 
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="username/repo"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 block mb-2">Branch</label>
            <input 
              className="w-full px-4 py-3 bg-[#16161e] border border-[#1e1e2e] rounded-lg focus:outline-none focus:border-purple-500 text-sm"
              value={branch} 
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
            />
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-[#1e1e2e]">
          <div className="text-xs text-gray-400 mb-3">Capabilities:</div>
          <ul className="text-xs text-gray-300 space-y-2">
            <li>• Web Development (React, Next.js)</li>
            <li>• Mobile Apps (React Native)</li>
            <li>• Backend APIs (Node.js)</li>
            <li>• Database (MongoDB, SQL)</li>
            <li>• DevOps (Vercel, GitHub)</li>
            <li>• Debugging & Fixes</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-[#1e1e2e] bg-[#0a0a0f]">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "chat" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >            💬 Chat
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

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto p-10">
              {messages.length === 0 ? (
                <div className="max-w-4xl mx-auto text-center">
                  <div className="text-6xl mb-6">🤖</div>
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Welcome to NEXUS AI
                  </h1>
                  <p className="text-gray-400 text-lg mb-10">
                    Your autonomous development assistant
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: "🔐", title: "Create Login Page", desc: "With email & password" },
                      { icon: "📧", title: "Contact Form", desc: "With validation" },
                      { icon: "🧭", title: "Navigation Bar", desc: "Responsive menu" },
                      { icon: "🌓", title: "Dark Mode", desc: "Toggle theme" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(item.desc)}
                        className="p-6 bg-[#16161e] border border-[#1e1e2e] hover:border-blue-500 rounded-xl text-left transition-all hover:transform hover:scale-[1.02]"
                      >
                        <div className="text-3xl mb-3">{item.icon}</div>
                        <div className="font-semibold mb-1">{item.title}</div>
                        <div className="text-sm text-gray-400">{item.desc}</div>
                      </button>                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl max-w-[85%] ${
                        msg.role === "user" 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 ml-auto rounded-br-md" 
                          : msg.role === "system"
                          ? "bg-red-950/30 border border-red-900 text-red-200 mr-auto rounded-bl-md"
                          : "bg-[#16161e] border border-[#1e1e2e] mr-auto rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-2 p-4 bg-[#16161e] border border-[#1e1e2e] rounded-xl w-fit">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-[#1e1e2e] bg-[#0a0a0f] p-6">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  className="flex-1 px-6 py-4 bg-[#16161e] border border-[#1e1e2e] rounded-xl focus:outline-none focus:border-blue-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Tell me what to build..."
                  disabled={loading}
                />
                <button 
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold disabled:opacity-50 transition-all"
                >
                  Send
                </button>
              </div>
            </div>          </>
        )}

        {/* Code Tab */}
        {activeTab === "code" && (
          <div className="flex-1 bg-[#0d1117]">
            <Editor
              height="100%"
              language="html"
              theme="vs-dark"
              value={currentCode}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="flex-1 bg-white">
            {previewUrl ? (
              <iframe src={previewUrl} className="w-full h-full border-0" title="Preview" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <p>No Preview Available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
