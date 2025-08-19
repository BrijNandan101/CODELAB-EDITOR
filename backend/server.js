const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.post('/execute', (req, res) => {
    const { language, code, input } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided.' });
    }

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const execute = (command, args = []) => {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, { timeout: 15000 }); // 15 second timeout
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
                        reject('Process timed out after 15 seconds.');
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
            switch (language) {
                case 'python':
                    extension = 'py';
                    filePath = path.join(tempDir, `script.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    const pythonOutput = await execute('python', [filePath]);
                    res.json({ output: pythonOutput });
                    break;
                case 'javascript':
                    extension = 'js';
                    filePath = path.join(tempDir, `script.${extension}`);
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    const jsOutput = await execute('node', [filePath]);
                    res.json({ output: jsOutput });
                    break;
                case 'java':
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
                    extension = 'cpp';
                    filePath = path.join(tempDir, `script.${extension}`);
                    const outPath = path.join(tempDir, 'a.out');
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
                    extension = 'c';
                    filePath = path.join(tempDir, `script.${extension}`);
                    const cOutPath = path.join(tempDir, 'a.out');
                    fs.writeFileSync(filePath, code);
                    tempFiles.push(filePath);
                    await execute('gcc', [filePath, '-o', cOutPath]);
                    if (fs.existsSync(cOutPath)) {
                        tempFiles.push(cOutPath);
                    }
                    const cOutput = await execute(cOutPath);
                    res.json({ output: cOutput });
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

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
