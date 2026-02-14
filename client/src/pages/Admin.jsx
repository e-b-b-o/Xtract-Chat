import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Globe, 
  Trash2, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Loader2,
  Database,
  Users
} from 'lucide-react';
import chatService from '../services/chatService';

/* ── Processing stages shown during upload / scrape ── */
const FILE_STAGES = [
  { at: 0,  label: 'Uploading document…' },
  { at: 15, label: 'Extracting text content…' },
  { at: 35, label: 'Splitting into chunks…' },
  { at: 55, label: 'Generating embeddings…' },
  { at: 75, label: 'Building vector index…' },
  { at: 90, label: 'Finalizing knowledge base…' },
];

const URL_STAGES = [
  { at: 0,  label: 'Connecting to website…' },
  { at: 15, label: 'Scraping page content…' },
  { at: 35, label: 'Parsing HTML data…' },
  { at: 55, label: 'Generating embeddings…' },
  { at: 75, label: 'Building vector index…' },
  { at: 90, label: 'Finalizing knowledge base…' },
];

/* ── Circular progress ring (SVG) ── */
const ProgressRing = ({ progress }) => {
  const radius = 80;
  const stroke = 6;
  const normalised = radius - stroke;
  const circumference = 2 * Math.PI * normalised;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
      {/* track */}
      <circle cx={radius} cy={radius} r={normalised} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      {/* progress arc */}
      <circle
        cx={radius} cy={radius} r={normalised} fill="none"
        stroke="#fff"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
};

/* ── Full-screen processing overlay ── */
const ProcessingOverlay = ({ progress, stage, visible }) => {
  if (!visible) return null;
  const done = progress >= 100;

  return (
    <div className="processing-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeInUp 0.4s ease'
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Pulsing glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '220px', height: '220px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          animation: 'pulseGlow 2s ease-in-out infinite'
        }} />

        {/* Ring + percentage */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <ProgressRing progress={progress} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(0deg)' /* reset parent SVG rotation context */
          }}>
            {done
              ? <CheckCircle size={36} style={{ color: '#10b981' }} />
              : <>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {Math.round(progress)}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    percent
                  </span>
                </>
            }
          </div>
        </div>

        {/* Stage label */}
        <p style={{
          marginTop: '2rem', fontSize: '0.85rem', fontWeight: '700',
          color: done ? '#10b981' : 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          transition: 'color 0.3s'
        }}>
          {done ? 'Processing complete!' : stage}
        </p>

        {/* Animated dots */}
        {!done && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff',
                animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════  ADMIN COMPONENT  ═══════════════════ */

const Admin = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [users, setUsers] = useState([]);

    /* progress overlay state */
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);
    const intervalRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
        fetchUsers();
        return () => clearInterval(intervalRef.current);
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await chatService.getDocuments();
            setDocuments(data);
        } catch (err) {
            setError('Failed to fetch documents');
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await chatService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleDeleteUser = async (id, username) => {
        if (!window.confirm(`Delete user "${username}"? This will permanently remove all their chats and data.`)) return;
        try {
            await chatService.deleteUser(id);
            setSuccess(`User "${username}" and all related data deleted`);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    /* ── Simulated progress ticker ── */
    const startProgress = useCallback((stages) => {
        setProgress(0);
        setStage(stages[0].label);
        setShowOverlay(true);
        let current = 0;

        intervalRef.current = setInterval(() => {
            current += Math.random() * 2.5 + 0.5;  // smooth increments
            if (current > 92) current = 92;         // cap until real completion
            setProgress(current);

            // update stage label
            for (let i = stages.length - 1; i >= 0; i--) {
                if (current >= stages[i].at) { setStage(stages[i].label); break; }
            }
        }, 200);
    }, []);

    const finishProgress = useCallback(() => {
        clearInterval(intervalRef.current);
        setProgress(100);
        setStage('Complete');
        setTimeout(() => setShowOverlay(false), 1200);
    }, []);

    const cancelProgress = useCallback(() => {
        clearInterval(intervalRef.current);
        setShowOverlay(false);
    }, []);

    /* ── Handlers ── */
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setError('');
        setSuccess('');
        startProgress(FILE_STAGES);
        try {
            await chatService.uploadDocument(file);
            finishProgress();
            setSuccess('Document uploaded and ingested successfully');
            setFile(null);
            fetchDocuments();
        } catch (err) {
            cancelProgress();
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleScraping = async (e) => {
        e.preventDefault();
        if (!url) return;
        setLoading(true);
        setError('');
        setSuccess('');
        startProgress(URL_STAGES);
        try {
            await chatService.scrapeWebsite(url);
            finishProgress();
            setSuccess('Website scraped and ingested successfully');
            setUrl('');
            fetchDocuments();
        } catch (err) {
            cancelProgress();
            setError(err.response?.data?.message || 'Scraping failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will also reset the vector database.')) return;
        try {
            await chatService.deleteDocument(id);
            setSuccess('Document deleted and vector DB reset');
            fetchDocuments();
        } catch (err) {
            setError('Delete failed');
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '2rem' }}>
            {/* ── Processing Overlay ── */}
            <ProcessingOverlay progress={progress} stage={stage} visible={showOverlay} />

            <div className="container" style={{ maxWidth: '1000px' }}>
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <button onClick={() => navigate('/')} className="btn" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>
                          <ArrowLeft size={14} style={{ marginRight: '0.5rem' }} /> Back
                      </button>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>KNOWLEDGE <span style={{ color: 'transparent', WebkitTextStroke: '1px #fff' }}>BASE</span></h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff' }}></div> ONLINE
                        </div>
                    </div>
                </header>

                {error && <div style={{ color: '#ff4444', marginBottom: '2rem', padding: '1rem', border: '1px solid #ff4444', fontSize: '0.8rem', fontWeight: '600', backgroundColor: 'rgba(255,68,68,0.05)' }}>{error}</div>}
                {success && <div style={{ color: '#fff', marginBottom: '2rem', padding: '1rem', border: '1px solid #fff', fontSize: '0.8rem', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.05)' }}>{success}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    {/* Upload Section */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <Upload size={20} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Document</h2>
                        </div>
                        <form onSubmit={handleFileUpload}>
                            <div className="input-group">
                                <label className="input-label">Select PDF or Text File</label>
                                <input 
                                    type="file" 
                                    onChange={(e) => setFile(e.target.files[0])} 
                                    accept=".pdf,.txt"
                                    className="form-input"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <button type="submit" disabled={loading || !file} className="btn btn-primary" style={{ width: '100%' }}>
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Process File'}
                            </button>
                        </form>
                    </div>

                    {/* Scrape Section */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <Globe size={20} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scrape Website</h2>
                        </div>
                        <form onSubmit={handleScraping}>
                            <div className="input-group">
                                <label className="input-label">Website URL</label>
                                <input 
                                    type="url" 
                                    value={url} 
                                    onChange={(e) => setUrl(e.target.value)} 
                                    placeholder="https://docs.example.com"
                                    className="form-input"
                                />
                            </div>
                            <button type="submit" disabled={loading || !url} className="btn btn-primary" style={{ width: '100%' }}>
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Process URL'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Documents List */}
                <div className="card" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <Database size={20} />
                      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Indexed Documents</h2>
                    </div>
                    
                    {documents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)' }}>
                            No documents found in the knowledge base.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Document Name</th>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Type</th>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</th>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <FileText size={16} color="var(--text-secondary)" />
                                                    {doc.originalName || doc.filename}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.75rem' }}>
                                                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', fontWeight: '600' }}>
                                                  {doc.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => handleDelete(doc._id)} 
                                                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.5rem' }}
                                                    title="Delete document"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* User Management Section */}
                <div className="card" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <Users size={20} />
                      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Management</h2>
                    </div>
                    
                    {users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)' }}>
                            No registered users found.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Username</th>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</th>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Joined</th>
                                        <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>
                                                {user.username}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {user.email}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id, user.username)} 
                                                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.5rem' }}
                                                    title={`Delete ${user.username}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
