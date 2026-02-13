import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import authService from '../services/authService';
import { 
  Bot, 
  Zap, 
  Shield, 
  Layers, 
  Users, 
  ArrowRight, 
  Check, 
  Star,
  Quote
} from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
      { label: 'About', id: 'about' },
      { label: 'Pricing', id: 'pricing' },
      { label: 'Reviews', id: 'reviews' },
    ];

    const scrollTo = (id) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ 
              position: 'fixed', 
              top: 0, 
              width: '100%', 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              backdropFilter: 'blur(10px)', 
              zIndex: 1000,
              borderBottom: '1px solid var(--border)' 
            }}>
                <div style={{ 
                  maxWidth: '1200px', 
                  margin: '0 auto', 
                  padding: '1rem 2rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                    <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '800', letterSpacing: '-0.05em' }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="pointer">
                        AI SOLUTIONS
                    </h1>
                    <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {navItems.map(item => (
                          <button 
                            key={item.id} 
                            onClick={() => scrollTo(item.id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--text-secondary)', 
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em'
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                        {user?.isAdmin && (
                            <button onClick={() => navigate('/admin')} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                                Admin
                            </button>
                        )}
                        <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.75rem' }}>Logout</button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main style={{ flex: 1, paddingTop: '80px' }}>
                <section style={{ 
                  padding: '8rem 2rem', 
                  textAlign: 'center', 
                  position: 'relative' 
                }} className="fade-in">
                    <div className="container" style={{ maxWidth: '800px' }}>
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '2px', 
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)', 
                            fontWeight: '600', 
                            fontSize: '0.65rem', 
                            marginBottom: '2rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em'
                        }}>
                            <Zap size={12} /> Gemini 2.5 Flash Engine
                        </div>
                        
                        <h2 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1, fontWeight: '900', letterSpacing: '-0.05em', textTransform: 'uppercase' }}>
                            Smarter Conversations.<br/>
                            <span style={{ color: 'transparent', WebkitTextStroke: '1px #fff' }}>Better Decisions.</span>
                        </h2>
                        
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
                            Harness the power of AI to interact with your data. 
                            Turn documents and websites into your own private knowledge base.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-primary" style={{ padding: '1rem 3rem' }} onClick={() => document.getElementById('chatbot-trigger')?.click()}>
                                Get Started <ArrowRight size={16} style={{ marginLeft: '1rem' }} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" style={{ padding: '8rem 2rem', borderTop: '1px solid var(--border)' }}>
                    <div className="container">
                        <h2 className="section-title">Capabilities</h2>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                          gap: '2rem',
                          width: '100%'
                        }}>
                            {[
                              { icon: <Layers size={24} />, title: "RAG Pipeline", desc: "Advanced vector retrieval ensures your chatbot only uses your provided documentation." },
                              { icon: <Shield size={24} />, title: "Data Security", desc: "Enterprise-grade encryption for all uploaded documents and conversation logs." },
                              { icon: <Bot size={24} />, title: "Context Aware", desc: "Our chatbot maintains conversation history for fluid, human-like interactions." },
                              { icon: <Users size={24} />, title: "Multi-Admin", desc: "Scale your knowledge management across entire teams with granular controls." }
                            ].map((feature, i) => (
                              <div key={i} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ marginBottom: '1.5rem', color: '#fff' }}>{feature.icon}</div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{feature.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
                              </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" style={{ padding: '8rem 2rem', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div className="container">
                        <h2 className="section-title">Pricing</h2>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                          gap: '2rem' 
                        }}>
                            {[
                              { plan: "Starter", price: "Free", items: ["100 Messages / mo", "1 Knowledge Base", "Public Support"] },
                              { plan: "Pro", price: "$49", items: ["Unlimited Messages", "10 Knowledge Bases", "Priority Support", "Custom Branding"] },
                              { plan: "Enterprise", price: "Custom", items: ["Dedicated Instance", "SLA Guarantee", "24/7 Phone Support", "White Labeling"] }
                            ].map((tier, i) => (
                              <div key={i} className="card" style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                padding: '3rem 2rem',
                                border: i === 1 ? '1px solid #fff' : '1px solid var(--border)',
                                height: '100%'
                              }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>{tier.plan}</span>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '2rem' }}>{tier.price}<span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)' }}>{tier.price !== 'Custom' ? '/mo' : ''}</span></div>
                                <div style={{ flex: 1, marginBottom: '2.5rem' }}>
                                  {tier.items.map((item, j) => (
                                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                      <Check size={14} style={{ color: '#fff' }} /> {item}
                                    </div>
                                  ))}
                                </div>
                                <button className={`btn ${i === 1 ? 'btn-primary' : ''}`} style={{ width: '100%' }}>Choose {tier.plan}</button>
                              </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Reviews Section */}
                <section id="reviews" style={{ padding: '8rem 2rem', borderTop: '1px solid var(--border)' }}>
                    <div className="container">
                        <h2 className="section-title">Testimonials</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                          {[
                            { name: "Sarah Chen", role: "Product Manager at TechFlow", text: "The RAG accuracy is unmatched. We uploaded 500+ docs and it hasn't hallucinated once." },
                            { name: "Marcus Thorne", role: "CTO @ Nexus Systems", text: "Cleanest API integration I've ever seen. The B&W aesthetic fits our internal tools perfectly." }
                          ].map((rev, i) => (
                            <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden', padding: '2.5rem' }}>
                              <Quote size={40} style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.1 }} />
                              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#fff" />)}
                              </div>
                              <p style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.6 }}>"{rev.text}"</p>
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{rev.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rev.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer style={{ 
              backgroundColor: 'var(--background)', 
              borderTop: '1px solid var(--border)', 
              padding: '4rem 2rem' 
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800' }}>AI SOLUTIONS</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        &copy; 2025 ALL RIGHTS RESERVED.
                    </div>
                </div>
            </footer>

            {/* Chatbot Widget */}
            <Chatbot />
        </div>
    );
};

export default Landing;
