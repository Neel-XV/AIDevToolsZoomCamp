export default function Controls({
    language,
    onLanguageChange,
    onRun,
    onShare,
    isRunning,
    userCount,
    isConnected
}) {
    const copyShareLink = () => {
        if (onShare) {
            onShare();
        }
    };

    return (
        <div className="controls">
            <div className="control-group">
                <label className="control-label">Language:</label>
                <select
                    className="select"
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                </select>
            </div>

            <button
                className="btn btn-primary"
                onClick={onRun}
                disabled={isRunning}
            >
                {isRunning ? (
                    <>
                        <span className="loading"></span>
                        Running...
                    </>
                ) : (
                    '▶ Run Code'
                )}
            </button>

            {onShare && (
                <button
                    className="btn btn-secondary"
                    onClick={copyShareLink}
                >
                    📋 Copy Share Link
                </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {userCount !== undefined && (
                    <div className="status-badge">
                        <span className="status-dot"></span>
                        {userCount} user{userCount !== 1 ? 's' : ''} online
                    </div>
                )}

                {isConnected !== undefined && (
                    <div className="status-badge">
                        <span
                            className="status-dot"
                            style={{ background: isConnected ? 'var(--success)' : 'var(--error)' }}
                        ></span>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                )}
            </div>
        </div>
    );
}
