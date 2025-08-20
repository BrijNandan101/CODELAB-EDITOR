const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3003;
const EXECUTE_TIMEOUT_MS = parseInt(process.env.EXECUTE_TIMEOUT_MS || '15000', 10);

const corsOptions = {
  origin: 'https://codelab-editor-leto-git-main-brijnandan101s-projects.vercel.app',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // enable pre-flight request for all routes
app.use(bodyParser.json());

// Health check for deployments
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/api/execute', (req, res) => {
    const { language, code, input } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided.' });
    }

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    // Cross-platform check for command availability
    const isCommandAvailable = (command) => {
        const checker = process.platform === 'win32' ? 'where' : 'which';
        const result = spawnSync(checker, [command], { stdio: 'ignore' });
        return result.status === 0;
    };

    const withExeIfWindows = (baseName) => {
        return process.platform === 'win32' ? `${baseName}.exe` : baseName;
    };

    const execute = (command, args = []) => {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, { timeout: EXECUTE_TIMEOUT_MS });
            let stdout = '';
            let stderr = '';

            child.on('error', (err) => {
                reject(err.message);
            });

            if (input) {
                child.stdin.write(input);
            }
            // Always end stdin to signal that no more input is coming.
            child.stdin.end();

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code, signal) => {
                if (signal) {
                    if (signal === 'SIGTERM') {
                        reject(`Process timed out after ${EXECUTE_TIMEOUT_MS / 1000} seconds.`);
                    } else {
                        reject(`Process was killed with signal: ${signal}`);
                    }
                } else if (code !== 0) {
                    let errorMessage = stderr || `Process exited with code ${code}`;
                    if (stderr.includes('EOFError: EOF when reading a line')) {
                        errorMessage += '\n\n[Hint] Your program expected input but did not receive it, or it tried to read more input than was provided. Please make sure to enter all required inputs in the Custom Input panel, with each input on a new line, before running the code.';
                    }
                    reject(errorMessage);
                } else {
                    resolve(stdout);
                }
            });
        });
    };

    const runCode = async () => {
        let filePath;
        let extension;
        const tempFiles = [];

        try {
            // Guardrail: detect unsupported GUI/graphics use-cases for Python
            if (language === 'python') {
                const lower = code.toLowerCase();
                const guiHints = [
                    'import turtle', 'from turtle',
                    'import tkinter', 'from tkinter',
                    'import pygame', 'from pygame'
                ];
                if (guiHints.some(h => lower.includes(h))) {
                    return res.status(400).json({
                        error: 'GUI/graphics programs (e.g., turtle/pygame/tkinter) cannot run in this server environment. Use console-only programs, or switch to HTML/CSS/JS with Canvas in the browser for graphics rendering.'
                    });
                }
            }

            switch (language) {
                case 'python':
                    if (!isCommandAvailable('python')) {
                        return res.status(500).json({ error: 'Python runtime not found. Please install Python and ensure "python" is on PATH.' });
                    }
                    extension = 'py';
                    filePath = path.join(tempDir, `script.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    const pythonOutput = await execute('python', [filePath]);
                    res.json({ output: pythonOutput });
                    break;
                case 'javascript':
                    if (!isCommandAvailable('node')) {
                        return res.status(500).json({ error: 'Node.js runtime not found. Please install Node.js and ensure "node" is on PATH.' });
                    }
                    extension = 'js';
                    filePath = path.join(tempDir, `script.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    const jsOutput = await execute('node', [filePath]);
                    res.json({ output: jsOutput });
                    break;
                case 'java':
                    if (!isCommandAvailable('javac') || !isCommandAvailable('java')) {
                        return res.status(500).json({ error: 'Java JDK/JRE not found. Please install Java (JDK) and ensure both "javac" and "java" are on PATH.' });
                    }
                    extension = 'java';
                    filePath = path.join(tempDir, `Main.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    await execute('javac', [filePath]);
                    const classFile = path.join(tempDir, 'Main.class');
                    if (fs.existsSync(classFile)) {
                        tempFiles.push(classFile);
                    }
                    const javaOutput = await execute('java', ['-cp', tempDir, 'Main']);
                    res.json({ output: javaOutput });
                    break;
                case 'cpp':
                    if (!isCommandAvailable('g++')) {
                        return res.status(500).json({ error: 'g++ compiler not found. Please install MinGW-w64 or a C++ toolchain and ensure "g++" is on PATH.' });
                    }
                    extension = 'cpp';
                    filePath = path.join(tempDir, `script.${extension}`);
                    const outPath = path.join(tempDir, withExeIfWindows('program'));
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    await execute('g++', [filePath, '-o', outPath]);
                    if (fs.existsSync(outPath)) {
                        tempFiles.push(outPath);
                    }
                    const cppOutput = await execute(outPath);
                    res.json({ output: cppOutput });
                    break;
                case 'c':
                    if (!isCommandAvailable('gcc')) {
                        return res.status(500).json({ error: 'gcc compiler not found. Please install MinGW-w64 or a C toolchain and ensure "gcc" is on PATH.' });
                    }
                    extension = 'c';
                    filePath = path.join(tempDir, `script.${extension}`);
                    const cOutPath = path.join(tempDir, withExeIfWindows('program_c'));
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    await execute('gcc', [filePath, '-o', cOutPath]);
                    if (fs.existsSync(cOutPath)) {
                        tempFiles.push(cOutPath);
                    }
                    const cOutput = await execute(cOutPath);
                    res.json({ output: cOutput });
                    break;
                case 'typescript':
                    extension = 'ts';
                    filePath = path.join(tempDir, `script.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    // Compile TypeScript to JavaScript
                    let compiledJsPath = path.join(tempDir, 'script.js');
                    if (isCommandAvailable('tsc')) {
                        await execute('tsc', [filePath, '--outDir', tempDir, '--target', 'es2020']);
                    } else if (isCommandAvailable('npx')) {
                        await execute('npx', ['--yes', '-p', 'typescript', 'tsc', filePath, '--outDir', tempDir, '--target', 'es2020']);
                    } else {
                        return res.status(500).json({ error: 'TypeScript compiler not found. Install it with "npm i -D typescript" or ensure "tsc"/"npx" is on PATH.' });
                    }
                    if (fs.existsSync(compiledJsPath)) {
                        tempFiles.push(compiledJsPath);
                        const tsOutput = await execute('node', [compiledJsPath]);
                        res.json({ output: tsOutput });
                    } else {
                        res.status(500).json({ error: 'TypeScript compilation failed' });
                    }
                    break;
                case 'go':
                    if (!isCommandAvailable('go')) {
                        return res.status(500).json({ error: 'Go toolchain not found. Please install Go and ensure "go" is on PATH.' });
                    }
                    extension = 'go';
                    filePath = path.join(tempDir, `main.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    const goOutput = await execute('go', ['run', filePath]);
                    res.json({ output: goOutput });
                    break;
                case 'rust':
                    if (!isCommandAvailable('rustc')) {
                        return res.status(500).json({ error: 'Rust toolchain not found. Please install Rust (rustup) and ensure "rustc" is on PATH.' });
                    }
                    extension = 'rs';
                    filePath = path.join(tempDir, `main.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    await execute('rustc', [filePath, '-o', path.join(tempDir, withExeIfWindows('main'))]);
                    const rustExecutable = path.join(tempDir, withExeIfWindows('main'));
                    if (fs.existsSync(rustExecutable)) {
                        tempFiles.push(rustExecutable);
                        const rustResult = await execute(rustExecutable);
                        res.json({ output: rustResult });
                    } else {
                        res.status(500).json({ error: 'Rust compilation failed' });
                    }
                    break;
                default:
                    res.status(400).json({ error: `Language "${language}" is not supported.` });
                    return;
            }
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        } finally {
            tempFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });
        }
    };

    runCode();
});

app.post('/api/analyze', (req, res) => {
    const { language, code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided.' });
    }

    try {
        const { time, space } = analyzeComplexity(code, language);
        res.json({ time, space });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

function analyzeComplexity(code, language) {
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';

    const loopKeywords = ['for', 'while', 'forEach', 'map', 'reduce', 'filter', 'for...of', 'for...in'];
    const nestedLoopKeywords = ['for', 'while'];
    const dataStructures = ['let', 'const', 'var', 'new Array', 'new Map', 'new Set', '{}', '[]', 'ArrayList', 'HashMap', 'HashSet'];
    
    let loopCount = 0;
    let nestedLoopCount = 0;
    let recursionDetected = false;
    let allocationCount = 0;

    // Count loops
    loopKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = code.match(regex);
        if (matches) {
            loopCount += matches.length;
        }
    });

    // Check for nested loops
    const lines = code.split('\n');
    let inLoop = false;
    let loopDepth = 0;
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        // Check if line starts a loop
        const startsLoop = nestedLoopKeywords.some(keyword => 
            trimmedLine.startsWith(keyword) || trimmedLine.includes(` ${keyword} `)
        );
        
        if (startsLoop) {
            loopDepth++;
            if (loopDepth > 1) {
                nestedLoopCount++;
            }
        }
        
        // Check if line ends a loop block
        if (trimmedLine === '}' || trimmedLine.endsWith('}')) {
            loopDepth = Math.max(0, loopDepth - 1);
        }
    }

    // Detect recursion
    if (language === 'javascript' || language === 'typescript') {
        const functionNames = (code.match(/function\s+(\w+)/g) || []).map(name => name.split(' ')[1]);
        const arrowFunctions = (code.match(/const\s+(\w+)\s*=/g) || []).map(name => name.split(' ')[1]);
        const allFunctions = [...functionNames, ...arrowFunctions];
        
        allFunctions.forEach(name => {
            if (name) {
                const callRegex = new RegExp(`\\b${name}\\b\\s*\\(`, 'g');
                const callMatches = code.match(callRegex);
                if (callMatches && callMatches.length > 1) {
                    recursionDetected = true;
                }
            }
        });
    } else if (language === 'python') {
        const functionNames = (code.match(/def\s+(\w+)/g) || []).map(name => name.split(' ')[1]);
        functionNames.forEach(name => {
            const callRegex = new RegExp(`\\b${name}\\b\\s*\\(`, 'g');
            const callMatches = code.match(callRegex);
            if (callMatches && callMatches.length > 1) {
                recursionDetected = true;
            }
        });
    } else if (language === 'java') {
        const methodNames = (code.match(/public\s+\w+\s+(\w+)/g) || []).map(name => name.split(' ').pop());
        methodNames.forEach(name => {
            const callRegex = new RegExp(`\\b${name}\\b\\s*\\(`, 'g');
            const callMatches = code.match(callRegex);
            if (callMatches && callMatches.length > 1) {
                recursionDetected = true;
            }
        });
    }

    // Count data structure allocations
    dataStructures.forEach(ds => {
        const regex = new RegExp(ds.replace('[', '\\[').replace(']', '\\]'), 'g');
        const matches = code.match(regex);
        if (matches) {
            allocationCount += matches.length;
        }
    });

    // Determine time complexity
    if (recursionDetected) {
        timeComplexity = 'O(2^n)'; // Exponential for basic recursion
    } else if (nestedLoopCount > 0) {
        timeComplexity = 'O(n²)'; // Nested loops
    } else if (loopCount > 1) {
        timeComplexity = 'O(n)'; // Multiple separate loops
    } else if (loopCount === 1) {
        timeComplexity = 'O(n)'; // Single loop
    } else {
        timeComplexity = 'O(1)'; // Constant time
    }

    // Determine space complexity
    if (allocationCount > 5) {
        spaceComplexity = 'O(n)'; // Many data structures
    } else if (allocationCount > 2) {
        spaceComplexity = 'O(1)'; // Few data structures
    } else {
        spaceComplexity = 'O(1)'; // Minimal allocations
    }

    return { time: timeComplexity, space: spaceComplexity };
}

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
