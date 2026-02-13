import { useState, useEffect } from 'react';
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
  Database
} from 'lucide-react';
import chatService from '../services/chatService';

const Admin = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await chatService.getDocuments();
            setDocuments(data);
        } catch (err) {
            setError('Failed to fetch documents');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await chatService.uploadDocument(file);
            setSuccess('Document uploaded and ingested successfully');
            setFile(null);
            fetchDocuments();
        } catch (err) {
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
        try {
            await chatService.scrapeWebsite(url);
            setSuccess('Website scraped and ingested successfully');
            setUrl('');
            fetchDocuments();
        } catch (err) {
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
            </div>
        </div>
    );
};

export default Admin;
