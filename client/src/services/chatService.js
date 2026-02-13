import api from './api';

const uploadDocument = async (formData) => {
    const response = await api.post('/admin/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const scrapeWebsite = async (url) => {
    const response = await api.post('/admin/scrape', { url });
    return response.data;
};

const getDocuments = async () => {
    const response = await api.get('/admin/documents');
    return response.data;
};

const getChatHistory = async () => {
    const response = await api.get('/chat/history');
    return response.data;
};

const askQuestion = async (question, onChunk) => {
    const token = localStorage.getItem('token');
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const response = await fetch(`${apiBaseUrl}/chat/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question })
    });

    if (!response.ok) throw new Error('Failed to ask question');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.replace('data: ', '');
                if (data) onChunk(data);
            }
        }
    }
};

const deleteDocument = async (id) => {
    const response = await api.delete(`/admin/documents/${id}`);
    return response.data;
};

const chatService = {
    uploadDocument,
    scrapeWebsite,
    getDocuments,
    getHistory: getChatHistory,
    getChatHistory,
    askQuestion,
    deleteDocument
};

export default chatService;
