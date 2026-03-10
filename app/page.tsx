"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("ayanshaikh2491-stack/ai-dev-platform-");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
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
          ...newMessages,
          { role: "assistant", content: data.plan?.summary || "Done!" },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: "system", content: "Error: " + data.error },
        ]);
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "system", content: "Connection error" },
      ]);
    }

    setLoading(false);
  };

  return (    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 p-4 bg-gray-800">
        <h1 className="text-2xl font-bold text-green-500">NEXUS AI Agent</h1>
        <p className="text-sm text-gray-400">Autonomous Dev Assistant</p>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="GitHub repo (username/repo)"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Branch"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p>👋 Welcome to NEXUS AI</p>
              <p className="text-sm mt-2">Ask me to build something...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-green-600 ml-auto max-w-[80%]"
                    : msg.role === "system"
                    ? "bg-red-900/50 border border-red-500"
                    : "bg-gray-700 mr-auto max-w-[80%]"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))
          )}
          {loading && (
            <div className="bg-gray-700 p-3 rounded-lg inline-flex gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Tell AI what to build..."
            disabled={loading}
            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
