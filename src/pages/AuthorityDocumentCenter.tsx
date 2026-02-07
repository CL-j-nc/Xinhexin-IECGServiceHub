import React, { useState, useEffect } from 'react';

// Simple Document interface mirroring API
interface DocumentSummary {
    id: string;
    title: string;
    category: string;
    lastUpdated: string;
}

interface DocumentDetail extends DocumentSummary {
    content: string;
}

const AuthorityDocumentCenter: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentSummary[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<DocumentDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/documents')
            .then(res => res.json() as Promise<any>)
            .then(json => {
                if (json.success) {
                    setDocuments(json.data);
                    if (json.data.length > 0) {
                        setSelectedDocId(json.data[0].id);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedDocId) return;
        setLoading(true);
        fetch(`/api/documents/${selectedDocId}`)
            .then(res => res.json() as Promise<any>)
            .then(json => {
                if (json.success) {
                    setSelectedDoc(json.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedDocId]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
                <div className="mb-8 space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Authority Center</p>
                    <h1 className="text-2xl font-bold text-slate-900">权威性声明与制度文档中心</h1>
                    <p className="text-sm text-slate-500">Official Standards & Regulatory Disclosures</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
                    {/* Sidebar */}
                    <div className="bg-slate-50 border-r border-slate-100 p-4">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">文档列表</h2>
                        <div className="space-y-1">
                            {documents.map(doc => (
                                <button
                                    key={doc.id}
                                    onClick={() => setSelectedDocId(doc.id)}
                                    className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors flex flex-col gap-1
                                        ${selectedDocId === doc.id ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <span>{doc.title}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">{doc.lastUpdated}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-10 overflow-y-auto max-h-[800px]">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                            </div>
                        ) : selectedDoc ? (
                            <div className="prose prose-slate prose-sm max-w-none">
                                {/* Simple pre-wrap render or Markdown if feasible. Using pre-wrap for simplicity in this env */}
                                <div className="whitespace-pre-wrap font-serif leading-relaxed">
                                    {selectedDoc.content}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-20">请选择文档</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorityDocumentCenter;
