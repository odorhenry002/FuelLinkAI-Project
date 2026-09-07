import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chat([...messages, userMessage]);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.content },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Request failed'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="FuelLink AI Copilot"
      subtitle="Ask about suppliers, pricing, contracts, or procurement strategy"
    >
      <div className="card card-pad mb-4">
        <p className="card-desc">
          Your AI assistant is ready to help with supplier discovery, quote comparison,
          risk assessment, and procurement optimization. Ask any question about your
          procurement operations.
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p className="chat-empty-icon">💬</p>
              <p className="chat-empty-text">Start a conversation with FuelLink AI Copilot</p>
              <p className="chat-empty-hint">
                Try asking: &ldquo;Compare suppliers for diesel generators&rdquo;
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message chat-message-${msg.role}`}>
              {msg.role === 'assistant' && <span className="chat-role">🤖 Copilot</span>}
              {msg.role === 'user' && <span className="chat-role">👤 You</span>}
              <div className="chat-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message chat-message-assistant">
              <span className="chat-role">🤖 Copilot</span>
              <div className="chat-content chat-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about procurement, suppliers, or market intelligence…"
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !input.trim()} className="chat-submit">
            {loading ? '…' : '↑'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
