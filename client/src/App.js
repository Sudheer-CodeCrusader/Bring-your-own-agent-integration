import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState(null); // eslint-disable-next-line no-unused-vars
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/kickoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (response.ok) {
        setJobId(data.jobId);
        pollStatus(data.jobId);
      } else {
        setError(data.error || 'Error starting analysis');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const pollStatus = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:3000/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        if (data.status === 'completed') {
          setResult(data.result);
          setLoading(false);
        } else if (data.status === 'failed') {
          setError(data.error || 'Analysis failed');
          setLoading(false);
        } else {
          // Continue polling
          setTimeout(() => pollStatus(jobId), 1000);
        }
      } else {
        setError(data.error || 'Error checking status');
        setLoading(false);
      }
    } catch (err) {
      setError('Error checking status');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web Page Analyzer</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="analyzer-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to analyze"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="results">
            <h2>Analysis Results</h2>
            <div className="result-section">
              <h3>Links ({result.links.count})</h3>
              <ul>
                {result.links.items.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.text || link.href}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="result-section">
              <h3>Icons ({result.icons.count})</h3>
              <ul>
                {result.icons.items.map((icon, index) => (
                  <li key={index}>
                    {icon.type === 'image' && (
                      <img src={icon.src} alt={icon.alt} className="icon-preview" />
                    )}
                    {icon.type === 'svg' && (
                      <div className="svg-preview" dangerouslySetInnerHTML={{ __html: icon.content }} />
                    )}
                    {icon.type === 'icon' && (
                      <span className="icon-class">{icon.class}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="result-section">
              <h3>Locators</h3>
              <div className="locators-grid">
                <div>
                  <h4>Buttons</h4>
                  <ul>
                    {result.locators.buttons.map((button, index) => (
                      <li key={index}>
                        <strong>{button.text}</strong>
                        <div>CSS: {button.css}</div>
                        <div>XPath: {button.xpath}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4>Inputs</h4>
                  <ul>
                    {result.locators.inputs.map((input, index) => (
                      <li key={index}>
                        <strong>Type: {input.type}</strong>
                        <div>CSS: {input.css}</div>
                        <div>XPath: {input.xpath}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4>Navigation</h4>
                  <ul>
                    {result.locators.navigation.map((nav, index) => (
                      <li key={index}>
                        <div>CSS: {nav.css}</div>
                        <div>XPath: {nav.xpath}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
