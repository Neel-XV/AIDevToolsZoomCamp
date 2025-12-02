let pyodideInstance = null;
let isInitializing = false;

/**
 * Load Pyodide from CDN
 */
async function loadPyodideFromCDN() {
    // Load Pyodide script from CDN
    if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });
    }

    return await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
    });
}

/**
 * Initialize Pyodide for Python execution
 */
export async function initPyodide() {
    if (pyodideInstance) return pyodideInstance;
    if (isInitializing) {
        // Wait for existing initialization
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return pyodideInstance;
    }

    try {
        isInitializing = true;
        pyodideInstance = await loadPyodideFromCDN();
        console.log('Pyodide initialized successfully');
        return pyodideInstance;
    } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
        throw error;
    } finally {
        isInitializing = false;
    }
}

/**
 * Execute Python code using Pyodide
 */
export async function executePython(code) {
    try {
        const pyodide = await initPyodide();

        // Capture stdout
        const result = await pyodide.runPythonAsync(`
import sys
import io

# Redirect stdout
old_stdout = sys.stdout
sys.stdout = io.StringIO()

try:
    ${code.split('\n').map(line => '    ' + line).join('\n')}
    output = sys.stdout.getvalue()
finally:
    sys.stdout = old_stdout

output
    `);

        return {
            success: true,
            output: result || '(no output)'
        };
    } catch (error) {
        return {
            success: false,
            output: error.message
        };
    }
}

/**
 * Execute JavaScript code in a sandbox
 */
export function executeJavaScript(code) {
    try {
        // Create a safe console that captures output
        const logs = [];
        const safeConsole = {
            log: (...args) => logs.push(args.map(arg => String(arg)).join(' ')),
            error: (...args) => logs.push('Error: ' + args.map(arg => String(arg)).join(' ')),
            warn: (...args) => logs.push('Warning: ' + args.map(arg => String(arg)).join(' ')),
            info: (...args) => logs.push(args.map(arg => String(arg)).join(' '))
        };

        // Create sandboxed execution context
        const sandboxedCode = `
      (function() {
        const console = arguments[0];
        ${code}
      })(safeConsole);
    `;

        // Execute code
        const func = new Function('safeConsole', sandboxedCode);
        func(safeConsole);

        return {
            success: true,
            output: logs.length > 0 ? logs.join('\n') : '(no output)'
        };
    } catch (error) {
        return {
            success: false,
            output: error.message
        };
    }
}

/**
 * Execute code based on language
 */
export async function executeCode(code, language) {
    if (!code.trim()) {
        return {
            success: false,
            output: 'No code to execute'
        };
    }

    try {
        if (language === 'python') {
            return await executePython(code);
        } else if (language === 'javascript') {
            return executeJavaScript(code);
        } else {
            return {
                success: false,
                output: `Unsupported language: ${language}`
            };
        }
    } catch (error) {
        return {
            success: false,
            output: `Execution error: ${error.message}`
        };
    }
}
