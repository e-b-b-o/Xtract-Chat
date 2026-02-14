import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  Loader2,
  Minus
} from 'lucide-react';
import chatService from '../services/chatService';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const loadHistory = async () => {
        try {
            const history = await chatService.getChatHistory();
            if (history && history.length > 0) {
                const formattedMessages = history.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
        
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsThinking(true);

        // Placeholder for AI response that will be updated via streaming
        const aiResponseId = Date.now();
        setMessages(prev => [...prev, { id: aiResponseId, role: 'assistant', content: '', timestamp: new Date() }]);

        try {
            await chatService.askQuestion(input, (chunk) => {
                setIsThinking(false);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsgIndex = newMessages.length - 1;
                    if (newMessages[lastMsgIndex].role === 'assistant') {
                        newMessages[lastMsgIndex].content += chunk;
                    }
                    return newMessages;
                });
            });
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
            setIsThinking(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, fontFamily: 'inherit' }}>
            {/* Toggle Button */}
            <button 
                id="chatbot-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '2px',
                    backgroundColor: '#fff',
                    color: '#000',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    transition: 'var(--transition)',
                    transform: isOpen ? 'rotate(90deg)' : 'none'
                }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: 0,
                    width: '400px',
                    height: '600px',
                    backgroundColor: '#000',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                }} className="fade-in">
                    {/* Header */}
                    <div style={{ 
                        padding: '1.25rem', 
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#050505'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '2px', 
                                backgroundColor: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000'
                            }}>
                                <Bot size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.05em' }}>XTRACT & CHAT</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ONLINE</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Minus size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        scrollBehavior: 'smooth'
                    }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                                <Bot size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>How can I help you today?</p>
                            </div>
                        )}
                        
                        {messages.map((msg, i) => (
                            <div key={i} style={{ 
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{ 
                                    padding: '0.75rem 1rem', 
                                    backgroundColor: msg.role === 'user' ? '#fff' : '#111',
                                    color: msg.role === 'user' ? '#000' : '#fff',
                                    borderRadius: '2px',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5,
                                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
                                }}>
                                    {msg.content}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                                    {msg.role === 'user' ? 'YOU' : 'AI'}
                                </span>
                            </div>
                        ))}
                        
                        {isThinking && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                <Loader2 size={14} className="animate-spin" />
                                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>THINKING...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', backgroundColor: '#050505' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="ASK ANYTHING..."
                                style={{ 
                                    flex: 1, 
                                    backgroundColor: '#0a0a0a', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '2px',
                                    padding: '0.75rem 1rem',
                                    paddingRight: '3rem',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    transition: 'var(--transition)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#fff'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: input.trim() ? '#fff' : 'var(--border)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
