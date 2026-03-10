"use client";

import { useState } from "react";

interface Message {
  role: string;
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("ayanshaikh2491-stack/ai-dev-platform-");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const features = [
    { icon: "🎨", title: "Web Development", desc: "React, Next.js, Tailwind" },
    { icon: "📱", title: "Mobile Apps", desc: "React Native, PWA" },
    { icon: "⚙️", title: "Backend APIs", desc: "Node.js, Express, REST" },
    { icon: "🗄️", title: "Database", desc: "MongoDB, PostgreSQL" },
    { icon: "🚀", title: "DevOps", desc: "Vercel, GitHub, CI/CD" },
    { icon: "🐛", title: "Debugging", desc: "Fix errors automatically" },
  ];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

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
          { role: "assistant", content: data.plan?.summary || "Task completed!" },
        ]);      } else {
        setMessages([
          ...updatedMessages,
          { role: "system", content: "Error: " + data.error },
        ]);
      }
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { role: "system", content: "Connection error" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-black font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">NEXUS AI</h1>
                <p className="text-xs text-gray-400">Autonomous Dev Agent</p>
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span> New Chat
            </button>
          </div>

          {/* Features */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-3">Capabilities</h2>
            <div className="space-y-2">
              {features.map((feature, idx) => (
                <div key={idx} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="font-medium text-sm">{feature.title}</span>
                  </div>                  <p className="text-xs text-gray-400 ml-8">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-gray-700 space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">GitHub Repo</label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-green-500"
                placeholder="username/repo"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-green-500"
                placeholder="main"
              />
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="font-semibold">AI Development Assistant</h2>
          <div className="w-10"></div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-4xl">N</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Welcome to NEXUS AI</h1>
                <p className="text-gray-400">Your autonomous development assistant</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => setInput("Create a login page with email and password")}
                  className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="font-medium mb-1">🔐 Create Login Page</div>
                  <div className="text-sm text-gray-400">With email & password authentication</div>
                </button>
                <button
                  onClick={() => setInput("Add a contact form with validation")}
                  className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="font-medium mb-1">📧 Contact Form</div>
                  <div className="text-sm text-gray-400">With form validation</div>
                </button>
                <button
                  onClick={() => setInput("Create a responsive navigation bar")}
                  className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="font-medium mb-1">🧭 Navigation Bar</div>
                  <div className="text-sm text-gray-400">Responsive with mobile menu</div>
                </button>
                <button
                  onClick={() => setInput("Add dark mode toggle to the website")}
                  className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="font-medium mb-1">🌓 Dark Mode</div>
                  <div className="text-sm text-gray-400">Toggle between light/dark</div>
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Or type your custom request below</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-br-md"
                        : msg.role === "system"
                        ? "bg-red-900/50 border border-red-500 text-red-200 rounded-bl-md"
                        : "bg-gray-800 border border-gray-700 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-md px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Tell me what to build..."
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-green-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              NEXUS AI can make mistakes. Review generated code before deploying.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
