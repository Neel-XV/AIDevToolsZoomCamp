import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, language, onChange, readOnly }) {
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleEditorChange = (value) => {
        if (!readOnly && onChange) {
            onChange(value || '');
        }
    };

    return (
        <div className="editor-wrapper">
            <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    readOnly: readOnly,
                    domReadOnly: readOnly,
                    quickSuggestions: !readOnly,
                    suggestOnTriggerCharacters: !readOnly,
                    acceptSuggestionOnCommitCharacter: !readOnly,
                    snippetSuggestions: 'inline',
                    formatOnPaste: true,
                    formatOnType: true,
                }}
            />
        </div>
    );
}
