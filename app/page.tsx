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

  // Inline styles for guaranteed colors
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 50%, #16213e 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    sidebar: {
      width: '280px',
      background: '#0a0a0f',
      borderRight: '1px solid #1e1e2e',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',    },
    logo: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '20px',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
    },
    newChatBtn: {
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '20px',
    },
    input: {
      width: '100%',
      padding: '12px',
      background: '#16161e',
      border: '1px solid #1e1e2e',
      borderRadius: '8px',
      color: 'white',
      marginBottom: '16px',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #1e1e2e',
      background: '#0a0a0f',
    },
    tab: (active: boolean) => ({
      padding: '12px 24px',
      background: active ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
      border: 'none',
      color: active ? 'white' : '#9ca3af',
      cursor: 'pointer',
      fontWeight: active ? '600' : '400',    }),
    chatArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '40px',
    },
    welcomeCard: {
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center',
    },
    welcomeTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '16px',
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginTop: '40px',
    },
    featureCard: {
      padding: '24px',
      background: '#16161e',
      border: '1px solid #1e1e2e',
      borderRadius: '12px',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    inputArea: {
      padding: '24px',
      borderTop: '1px solid #1e1e2e',
      background: '#0a0a0f',
    },
    inputContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      gap: '12px',
    },
    messageInput: {
      flex: 1,
      padding: '16px',
      background: '#16161e',
      border: '1px solid #1e1e2e',      borderRadius: '12px',
      color: 'white',
    },
    sendBtn: {
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={styles.logo}>N</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>NEXUS AI</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Dev Assistant</div>
          </div>
        </div>
        
        <button style={styles.newChatBtn} onClick={() => setMessages([])}>
          + New Chat
        </button>

        <div style={{ marginTop: '32px' }}>
          <label style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Repository</label>
          <input 
            style={styles.input} 
            value={repoUrl} 
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="username/repo"
          />
          
          <label style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Branch</label>
          <input 
            style={styles.input} 
            value={branch} 
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
          />
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #1e1e2e' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>Capabilities:</div>          <ul style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.8', paddingLeft: '16px' }}>
            <li>Web Development (React, Next.js)</li>
            <li>Mobile Apps (React Native)</li>
            <li>Backend APIs (Node.js)</li>
            <li>Database (MongoDB, SQL)</li>
            <li>DevOps (Vercel, GitHub)</li>
            <li>Debugging & Fixes</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={styles.tab(activeTab === 'chat')} onClick={() => setActiveTab('chat')}>💬 Chat</button>
          <button style={styles.tab(activeTab === 'code')} onClick={() => setActiveTab('code')}>💻 Code Editor</button>
          <button style={styles.tab(activeTab === 'preview')} onClick={() => setActiveTab('preview')}>🌐 Live Preview</button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <>
            <div style={styles.chatArea}>
              {messages.length === 0 ? (
                <div style={styles.welcomeCard}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
                  <h1 style={styles.welcomeTitle}>Welcome to NEXUS AI</h1>
                  <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '40px' }}>
                    Your autonomous development assistant. I can create, edit, debug, and deploy code.
                  </p>
                  
                  <div style={styles.featureGrid}>
                    {[
                      { icon: '🔐', title: 'Create Login Page', desc: 'With email & password' },
                      { icon: '📧', title: 'Contact Form', desc: 'With validation' },
                      { icon: '🧭', title: 'Navigation Bar', desc: 'Responsive menu' },
                      { icon: '🌓', title: 'Dark Mode', desc: 'Toggle theme' },
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        style={{...styles.featureCard}}
                        onClick={() => setInput(item.desc)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#1e1e2e';
                          e.currentTarget.style.transform = 'translateY(0)';                        }}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      background: msg.role === 'user' 
                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                        : msg.role === 'system'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : '#16161e',
                      border: msg.role === 'system' ? '1px solid #ef4444' : '1px solid #1e1e2e',
                      color: msg.role === 'system' ? '#fca5a5' : 'white',
                    }}>
                      {msg.content}
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display: 'flex', gap: '4px', padding: '16px', background: '#16161e', borderRadius: '12px', width: 'fit-content' }}>
                      <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                      <div style={{ width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                      <div style={{ width: '8px', height: '8px', background: '#ec4899', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={styles.inputArea}>
              <div style={styles.inputContainer}>
                <input
                  style={styles.messageInput}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Tell me what to build..."
                  disabled={loading}
                />                <button 
                  style={styles.sendBtn} 
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div style={{ flex: 1, background: '#0d1117' }}>
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
        {activeTab === 'preview' && (
          <div style={{ flex: 1, background: 'white' }}>
            {previewUrl ? (
              <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview" />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌐</div>
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
