export default function OutputPanel({ output, isError, onClear }) {
    return (
        <div className="output-section">
            <div className="output-header">
                <div className="output-title">Output</div>
                <button className="btn btn-secondary" onClick={onClear} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    Clear
                </button>
            </div>
            <div className="output-content">
                {output ? (
                    <pre className={`output-text ${isError ? 'output-error' : 'output-success'}`}>
                        {output}
                    </pre>
                ) : (
                    <div className="output-empty">
                        Run your code to see the output here...
                    </div>
                )}
            </div>
        </div>
    );
}
