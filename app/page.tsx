"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  code?: string;
  fileName?: string;
  timestamp: number;
}

interface FileChange {
  path: string;
  action: "create" | "edit" | "delete";
  content?: string;
  oldContent?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("ayanshaikh2491-stack/ai-agency-app");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview">("chat");
  const [currentCode, setCurrentCode] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
  const [showChanges, setShowChanges] = useState(false);
  const [branch, setBranch] = useState("main");
  
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
      content: input,      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const instruction = input;
    setInput("");
    setLoading(true);
    setActiveTab("chat");

    try {
      // Step 1: Send to AI Agent
      const agentResponse = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repoUrl,
          instruction: instruction,
          branch: branch,
        }),
      });

      const agentData = await agentResponse.json();

      if (agentData.success) {
        // Add AI thinking message
        const thinkingMessage: Message = {
          role: "assistant",
          content: `🧠 **Planning:**\n${agentData.plan?.summary || "Analyzing task..."}\n\n⏱️ Estimated: ${agentData.plan?.estimatedTime || "Unknown"}\n⚠️ Risks: ${agentData.plan?.risks?.length || 0}`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, thinkingMessage]);

        // Step 2: Execute changes
        const executeResponse = await fetch("/api/github/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo: repoUrl,
            branch: branch,
            steps: agentData.plan?.steps || [],
          }),
        });

        const executeData = await executeResponse.json();

        if (executeData.success) {
          // Show code changes
          if (executeData.fileChanges && executeData.fileChanges.length > 0) {
            setFileChanges(executeData.fileChanges);
            setShowChanges(true);            
            // Show first file in editor
            const firstChange = executeData.fileChanges[0];
            if (firstChange.content) {
              setCurrentCode(firstChange.content);
              setCurrentFile(firstChange.path);
              setActiveTab("code");
            }
          }

          // Add success message
          const successMessage: Message = {
            role: "assistant",
            content: `✅ **Task Completed!**\n\n📝 **Changes:**\n${executeData.fileChanges?.map((f: FileChange) => `• ${f.action}: ${f.path}`).join("\n") || "No changes"}\n\n🔍 **Review the changes above.**\n\n💡 Want me to:\n• Commit these changes? (Say "commit")\n• Preview the website? (Say "preview")\n• Make more changes? (Just tell me)`,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, successMessage]);

          // Auto-fetch preview URL
          const [owner, name] = repoUrl.split("/");
          setPreviewUrl(`https://${name}-git-${branch}-${owner.toLowerCase().replace(/[^a-z0-9]/g, "-")}.vercel.app`);
        } else {
          throw new Error(executeData.error || "Execution failed");
        }
      } else {
        throw new Error(agentData.error || "AI processing failed");
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "system",
        content: `❌ **Error:** ${error instanceof Error ? error.message : "Unknown error"}\n\n💡 Try:\n• Check repo URL\n• Verify GitHub token\n• Break task into smaller steps`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleCommit = async () => {
    if (fileChanges.length === 0) {
      alert("No changes to commit");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/github/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },        body: JSON.stringify({
          repo: repoUrl,
          branch: branch,
          changes: fileChanges,
          message: `AI Agent: ${messages[messages.length - 1]?.content.substring(0, 50)}...`,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const commitMessage: Message = {
          role: "system",
          content: `✅ **Committed to GitHub!**\n\n🔗 Repo: https://github.com/${repoUrl}\n🌿 Branch: ${branch}\n📝 Commit: ${data.commitSha?.substring(0, 7)}`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, commitMessage]);
        setShowChanges(false);
        setFileChanges([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert(`Commit failed: ${error instanceof Error ? error.message : "Unknown"}`);
    }
    setLoading(false);
  };

  const handlePreview = () => {
    if (previewUrl) {
      setActiveTab("preview");
    } else {
      alert("No preview URL available. Commit changes first.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-[#0a0a0f] border-b md:border-b-0 md:border-r border-[#1e1e28] flex flex-col">
        <div className="p-4 border-b border-[#1e1e28]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c8ff00] to-[#84cc16] flex items-center justify-center font-bold text-black">N</div>
            <div>
              <h1 className="font-bold text-lg">NEXUS AI Agent</h1>
              <p className="text-xs text-[#6b6b7a]">Autonomous Dev Assistant</p>
            </div>
          </div>
          
          <div className="space-y-3">            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="username/repo"
              className="w-full bg-[#16161e] border border-[#1e1e28] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8ff00]"
            />
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch (main)"
              className="w-full bg-[#16161e] border border-[#1e1e28] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c8ff00]"
            />
          </div>
        </div>

        {/* File Changes Panel */}
        {showChanges && fileChanges.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">📝 Pending Changes</h3>
              <button
                onClick={() => setShowChanges(false)}
                className="text-xs text-[#6b6b7a] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {fileChanges.map((change, idx) => (
                <div key={idx} className="bg-[#16161e] border border-[#1e1e28] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      change.action === "create" ? "bg-green-500/20 text-green-500" :
                      change.action === "edit" ? "bg-blue-500/20 text-blue-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {change.action.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#6b6b7a] truncate">{change.path}</span>
                  </div>
                  {change.content && (
                    <button
                      onClick={() => {
                        setCurrentCode(change.content || "");
                        setCurrentFile(change.path);
                        setActiveTab("code");
                      }}
                      className="text-xs text-[#c8ff00] hover:underline"                    >
                      View Code →
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleCommit}
              className="w-full mt-4 bg-gradient-to-r from-[#c8ff00] to-[#a3e635] text-black py-2 rounded-lg font-bold text-sm hover:opacity-90"
            >
              ✅ Commit Changes
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-[#1e1e28] bg-[#0a0a0f] overflow-x-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "chat" ? "border-[#c8ff00] text-[#c8ff00]" : "border-transparent text-[#6b6b7a]"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "code" ? "border-[#c8ff00] text-[#c8ff00]" : "border-transparent text-[#6b6b7a]"
            }`}
          >
            💻 Code {currentFile && `(${currentFile})`}
          </button>
          <button
            onClick={handlePreview}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "preview" ? "border-[#c8ff00] text-[#c8ff00]" : "border-transparent text-[#6b6b7a]"
            }`}
          >
            🌐 Preview {previewUrl && `→ ${previewUrl}`}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Chat Tab */}          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#c8ff00] to-[#a3e635] text-black rounded-br-sm"
                          : msg.role === "system"
                          ? "bg-red-500/10 border border-red-500/30 text-red-400"
                          : "bg-[#16161e] border border-[#1e1e28] rounded-bl-sm"
                      }`}
                    >
                      <div className="text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <div className="text-xs opacity-60 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#16161e] border border-[#1e1e28] rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#c8ff00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-[#c8ff00] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-[#c8ff00] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-[#1e1e28] p-4 bg-[#0a0a0f]">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Tell me what to build... (e.g., 'Add a contact form')"
                    className="flex-1 bg-[#16161e] border border-[#1e1e28] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8ff00]"                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-[#c8ff00] to-[#a3e635] text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Code Tab */}
          {activeTab === "code" && (
            <div className="h-full">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                language={currentFile.endsWith(".tsx") || currentFile.endsWith(".ts") ? "typescript" : 
                         currentFile.endsWith(".jsx") || currentFile.endsWith(".js") ? "javascript" :
                         currentFile.endsWith(".css") ? "css" : "html"}
                theme="vs-dark"
                value={currentCode}
                onChange={(value) => setCurrentCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="h-full">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full bg-white"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#6b6b7a]">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🌐</div>                    <p>No preview available</p>
                    <p className="text-sm mt-2">Commit changes to GitHub first</p>
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
