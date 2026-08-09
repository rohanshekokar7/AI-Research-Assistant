import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Loader2, ArrowLeft, BrainCircuit } from 'lucide-react';
import './index.css';

function App() {
  const [query, setQuery] = useState('');
  const [breadth, setBreadth] = useState(4);
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // In development, the Vite proxy or absolute URL needs to be used
      const response = await fetch('http://localhost:3051/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          breadth,
          depth,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate report';
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
          // Ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      setError(err.message || 'An error occurred during research');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {!report && !loading && (
        <div className="glass-panel">
          <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <BrainCircuit size={48} color="#a855f7" />
            </div>
            <h1>Deep Research AI</h1>
            <p className="subtitle">Iterative, deep research on any topic.</p>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="query">Research Topic</label>
              <textarea
                id="query"
                rows="4"
                placeholder="What would you like to research? (e.g. Advancements in quantum computing in 2025)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>

            <div className="range-controls">
              <div className="form-group range-group">
                <label htmlFor="breadth">
                  Breadth (Search Width) <span className="value-display">{breadth}</span>
                </label>
                <input
                  type="range"
                  id="breadth"
                  min="1"
                  max="10"
                  value={breadth}
                  onChange={(e) => setBreadth(Number(e.target.value))}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>How wide the search should go per iteration.</small>
              </div>

              <div className="form-group range-group">
                <label htmlFor="depth">
                  Depth (Iterations) <span className="value-display">{depth}</span>
                </label>
                <input
                  type="range"
                  id="depth"
                  min="1"
                  max="5"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>How many times it should dive deeper.</small>
              </div>
            </div>

            {error && (
              <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={!query.trim()}>
              <Search size={20} />
              Start Research
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="glass-panel loader-container">
          <div className="spinner"></div>
          <h2 className="pulse-text">Deep Diving into the Web...</h2>
          <p className="subtitle" style={{ maxWidth: '400px', margin: '0 auto' }}>
            This process can take several minutes. The AI is formulating queries, scraping results, and recursively exploring the topic.
          </p>
        </div>
      )}

      {report && !loading && (
        <div className="glass-panel report-container">
          <button className="back-btn" onClick={() => setReport(null)}>
            <ArrowLeft size={16} /> New Research
          </button>
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
