// script.js
// CodeLab - Premium Online Code Editor - JavaScript Functionality

// DOM Elements
const themeBtn = document.getElementById('themeBtn');
const languageBtn = document.getElementById('languageBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const currentLang = document.getElementById('currentLang');
const runBtn = document.getElementById('runBtn');
const debugBtn = document.getElementById('debugBtn');
const outputArea = document.getElementById('outputArea');
const problemsArea = document.getElementById('problemsArea');
const debugArea = document.getElementById('debugArea');
const complexityArea = document.getElementById('complexityArea');
const lineNumbers = document.getElementById('lineNumbers');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const inputToggle = document.getElementById('inputToggle');
const ioSection = document.getElementById('ioSection');
const customInput = document.getElementById('customInput');
const formatBtn = document.getElementById('formatBtn');
const fileBtn = document.getElementById('fileBtn');
const fileMenu = document.getElementById('fileMenu');
const fileInput = document.getElementById('fileInput');
const newFile = document.getElementById('newFile');
const saveFile = document.getElementById('saveFile');
const saveAsFile = document.getElementById('saveAsFile');
const loadFile = document.getElementById('loadFile');
const downloadFileBtn = document.getElementById('downloadFile');
const newProject = document.getElementById('newProject');
const exportProject = document.getElementById('exportProject');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fileExplorerBtn = document.getElementById('fileExplorerBtn');
const fileExplorer = document.getElementById('fileExplorer');
const closeExplorer = document.getElementById('closeExplorer');
const fileList = document.getElementById('fileList');
const newFileBtn = document.getElementById('newFileBtn');
const newFolderBtn = document.getElementById('newFolderBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsClose = document.getElementById('settingsClose');
const settingsCancel = document.getElementById('settingsCancel');
const settingsSave = document.getElementById('settingsSave');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');
const tabSizeInput = document.getElementById('tabSizeInput');
const themeSelect = document.getElementById('themeSelect');
const autoCloseBrackets = document.getElementById('autoCloseBrackets');
const lineWrapping = document.getElementById('lineWrapping');
const outputTabs = document.querySelectorAll('.output-tab');
const debugContinue = document.getElementById('debugContinue');
const debugStepOver = document.getElementById('debugStepOver');
const debugStepInto = document.getElementById('debugStepInto');
const debugStepOut = document.getElementById('debugStepOut');
const breakpointsList = document.getElementById('breakpointsList');
const variablesList = document.getElementById('variablesList');
const currentFileName = document.getElementById('currentFileName');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const codeContainer = document.getElementById('codeContainer');
const ioToggle = document.getElementById('ioToggle');

// State Management
let isDarkTheme = true;
let currentLanguage = 'javascript';
let isFullscreen = false;
let isFileMenuOpen = false;
let isDropdownOpen = false;
let isIOSectionVisible = false;
let isDebugMode = false;
let isExplorerOpen = false;
let codeMirrorEditor = null;
let currentFile = 'main.js';
let breakpoints = [];
let debugVariables = {};
let projectFiles = {};

// Language Configuration
const languageConfig = {
    javascript: {
        name: 'JavaScript',
        extension: 'js',
        mode: 'javascript',
        placeholder: '// welcome to the code lab online editor'
    },
    typescript: {
        name: 'TypeScript',
        extension: 'ts',
        mode: 'text/typescript',
        placeholder: '// welcome to the code lab online editor'
    },
    python: {
        name: 'Python',
        extension: 'py',
        mode: 'python',
        placeholder: '# welcome to the code lab online editor'
    },
    java: {
        name: 'Java',
        extension: 'java',
        mode: 'text/x-java',
        placeholder: '// welcome to the code lab online editor'
    },
    cpp: {
        name: 'C++',
        extension: 'cpp',
        mode: 'text/x-c++src',
        placeholder: '// welcome to the code lab online editor'
    },
    c: {
        name: 'C',
        extension: 'c',
        mode: 'text/x-csrc',
        placeholder: '// welcome to the code lab online editor'
    },
    go: {
        name: 'Go',
        extension: 'go',
        mode: 'go',
        placeholder: '// welcome to the code lab online editor'
    },
    rust: {
        name: 'Rust',
        extension: 'rs',
        mode: 'rust',
        placeholder: '// welcome to the code lab online editor'
    },
    html: {
        name: 'HTML',
        extension: 'html',
        mode: 'htmlmixed',
        placeholder: '<!-- welcome to the code lab online editor -->'
    },
    css: {
        name: 'CSS',
        extension: 'css',
        mode: 'css',
        placeholder: '/* welcome to the code lab online editor */'
    }
};

// Initialize the editor
function initEditor() {
    // Load theme preference
    const savedTheme = localStorage.getItem('codelab-theme');
    if (savedTheme) {
        isDarkTheme = savedTheme === 'dark';
    }
    updateTheme();
    
    // Load language preference
    const savedLanguage = localStorage.getItem('codelab-language');
    if (savedLanguage && languageConfig[savedLanguage]) {
        currentLanguage = savedLanguage;
    }
    currentLang.textContent = languageConfig[currentLanguage].name;
    
    // Initialize CodeMirror
    initCodeMirror();
    
    // Set up line numbers
    updateLineNumbers();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize file system
    createFileSystem();

    // Initialize panel resizer
    initMainResizer();
}

// Initialize CodeMirror editor
function initCodeMirror() {
    codeMirrorEditor = CodeMirror(codeContainer, {
        value: languageConfig[currentLanguage].placeholder,
        mode: languageConfig[currentLanguage].mode,
        theme: isDarkTheme ? 'dracula' : 'default',
        lineNumbers: true,
        indentUnit: parseInt(localStorage.getItem('codelab-tab-size') || 4),
        tabSize: parseInt(localStorage.getItem('codelab-tab-size') || 4),
        lineWrapping: false, // Disable line wrapping to enable horizontal scrolling
        autoCloseBrackets: localStorage.getItem('codelab-auto-close-brackets') !== 'false',
        matchBrackets: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Enter": executeCode,
            "Cmd-Enter": executeCode,
            "Ctrl-S": saveCodeToFile,
            "Cmd-S": saveCodeToFile,
            "Ctrl-/": "toggleComment",
            "Cmd-/": "toggleComment"
        },
        gutters: ["breakpoints", "CodeMirror-linenumbers"]
    });
    
    // Update line numbers on change
    codeMirrorEditor.on('change', () => {
        updateLineNumbers();
        saveCode();
    });
    
    // Sync scroll with line numbers
    codeMirrorEditor.on('scroll', () => {
        syncScroll();
    });
    
    // Handle breakpoints
    codeMirrorEditor.on('gutterClick', (cm, line) => {
        toggleBreakpoint(line);
    });
    
    // Set font size
    const savedFontSize = localStorage.getItem('codelab-font-size') || '14';
    document.documentElement.style.setProperty('--editor-font-size', `${savedFontSize}px`);
    codeMirrorEditor.getWrapperElement().style.fontSize = `${savedFontSize}px`;
}

// Initialize draggable resizer between editor and output panels
function initMainResizer() {
    const resizer = document.getElementById('mainResizer');
    const main = document.querySelector('.main-content');
    if (!resizer || !main) return;

    let isDragging = false;
    let startX = 0;
    let startLeftWidth = 0;

    const minPanelWidth = 280; // px

    const onMouseDown = (e) => {
        isDragging = true;
        startX = e.clientX;
        const editorPanel = document.querySelector('.editor-panel');
        if (!editorPanel) return;
        startLeftWidth = editorPanel.getBoundingClientRect().width;
        document.body.classList.add('no-select');
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        let newLeft = Math.max(minPanelWidth, startLeftWidth + dx);

        const totalWidth = main.getBoundingClientRect().width;
        const rightWidth = Math.max(minPanelWidth, totalWidth - newLeft - resizer.getBoundingClientRect().width);
        // Convert to grid template columns: left | resizer | right
        main.style.gridTemplateColumns = `${newLeft}px ${resizer.getBoundingClientRect().width}px ${rightWidth}px`;
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.classList.remove('no-select');
    };

    resizer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    themeBtn.addEventListener('click', toggleTheme);
    
    // Language dropdown
    languageBtn.addEventListener('click', toggleDropdown);
    
    // Language selection
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.getAttribute('data-lang');
            updateLanguage(lang);
            hideDropdown();
        });
    });
    
    // Run code
    runBtn.addEventListener('click', (event) => {
        event.preventDefault();
        executeCode();
    });
    
    // Debug code
    debugBtn.addEventListener('click', toggleDebugMode);
    
    // Output panel actions
    clearBtn.addEventListener('click', clearOutput);
    copyBtn.addEventListener('click', copyOutput);
    downloadBtn.addEventListener('click', downloadOutput);
    
    // Input/Output toggle
    inputToggle.addEventListener('click', toggleIOSection);
    
    // Format code
    formatBtn.addEventListener('click', formatCode);
    
    // File operations
    fileBtn.addEventListener('click', toggleFileMenu);
    newFile.addEventListener('click', createNewFile);
    saveFile.addEventListener('click', saveCodeToFile);
    saveAsFile.addEventListener('click', saveCodeAsFile);
    loadFile.addEventListener('click', () => fileInput.click());
    downloadFileBtn.addEventListener('click', downloadCurrentFile);
    fileInput.addEventListener('change', loadCodeFromFile);
    newProject.addEventListener('click', createNewProject);
    exportProject.addEventListener('click', exportProjectAsZip);
    
    // File explorer
    fileExplorerBtn.addEventListener('click', toggleFileExplorer);
    closeExplorer.addEventListener('click', toggleFileExplorer);
    newFileBtn.addEventListener('click', createNewFileInExplorer);
    newFolderBtn.addEventListener('click', createNewFolder);
    uploadFileBtn.addEventListener('click', () => fileInput.click());
    
    // Fullscreen toggle
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Settings modal
    settingsBtn.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsCancel.addEventListener('click', closeSettings);
    settingsSave.addEventListener('click', saveSettings);
    
    // Settings controls
    fontSizeSlider.addEventListener('input', updateFontSizePreview);
    tabSizeInput.addEventListener('input', validateTabSize);
    
    // Output tabs
    outputTabs.forEach(tab => {
        tab.addEventListener('click', () => switchOutputTab(tab.dataset.tab));
    });
    
    // Debug controls
    debugContinue.addEventListener('click', debugContinueExecution);
    debugStepOver.addEventListener('click', stepOver);
    debugStepInto.addEventListener('click', stepInto);
    debugStepOut.addEventListener('click', stepOut);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', handleClickOutside);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize
    window.addEventListener('resize', updateLineNumbers);
}

// Toggle theme between dark and light
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    updateTheme();
    showToast(`Switched to ${isDarkTheme ? 'dark' : 'light'} theme`);
}

// Update theme based on current state
function updateTheme() {
    document.body.classList.toggle('light-theme', !isDarkTheme);
    themeBtn.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    themeBtn.setAttribute('title', `Switch to ${isDarkTheme ? 'light' : 'dark'} theme`);

    if (codeMirrorEditor) {
        codeMirrorEditor.setOption('theme', isDarkTheme ? 'dracula' : 'eclipse');
    }

    // Save theme preference
    localStorage.setItem('codelab-theme', isDarkTheme ? 'dark' : 'light');
}

// Toggle language dropdown
function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
    
    if (isDropdownOpen) {
        dropdownMenu.classList.add('show');
        languageBtn.classList.add('active');
    } else {
        hideDropdown();
    }
}

// Hide language dropdown
function hideDropdown() {
    dropdownMenu.classList.remove('show');
    languageBtn.classList.remove('active');
    isDropdownOpen = false;
}

// Update language and editor settings
function updateLanguage(lang) {
    if (!languageConfig[lang]) return;
    
    currentLanguage = lang;
    currentLang.textContent = languageConfig[lang].name;
    
    // Update editor mode
    if (codeMirrorEditor) {
        codeMirrorEditor.setOption('mode', languageConfig[lang].mode);
        // Only set placeholder if the editor is empty or contains placeholder text
        const currentValue = codeMirrorEditor.getValue();
        if (!currentValue || currentValue === languageConfig[currentLanguage].placeholder) {
            codeMirrorEditor.setValue(languageConfig[lang].placeholder);
        }
    }
    
    // Save language preference
    localStorage.setItem('codelab-language', lang);
    
    // Remove the toast notification for language changes
    // showToast(`Language changed to ${languageConfig[lang].name}`);
}

// Update line numbers based on editor content
function updateLineNumbers() {
    // This function is no longer needed as CodeMirror handles line numbers.
    // We can keep it for now in case we want to add custom gutter markers later.
}

// Sync line numbers scroll with editor scroll
function syncScroll() {
    if (!codeMirrorEditor) return;
    lineNumbers.scrollTop = codeMirrorEditor.getScrollerElement().scrollTop;
}

// Execute the code
async function executeCode() {
    const code = codeMirrorEditor ? codeMirrorEditor.getValue() : '';
    const input = customInput.value;

    if (!code.trim()) {
        showToast('Please write some code first', 'warning');
        return;
    }

    showLoading(true);
    
    if (currentLanguage === 'html') {
        executeHtml(code);
        showLoading(false);
        return;
    }
    if (currentLanguage === 'css') {
        outputArea.textContent = "CSS is applied automatically in the HTML preview. Open an HTML file and run it to see your styles in action.";
        showLoading(false);
        return;
    }

    try {
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: currentLanguage,
                code: code,
                input: input,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            // Ensure output area is visible and set content
            outputArea.textContent = result.output || 'Code executed with no output.';
            outputArea.classList.remove('status-error');
            outputArea.classList.add('status-success');
            
            // Show output in the output section first
            switchOutputTab('output');
            
            // Add a small delay to ensure the output is visible
            setTimeout(() => {
                outputArea.style.display = 'block';
                outputArea.classList.add('active');
            }, 100);
            
            showToast('Code executed successfully!', 'success');
            
            // Analyze complexity and show in complexity section (don't auto-switch)
            analyzeCodeComplexity(code, currentLanguage);
        } else {
            outputArea.textContent = `Error: ${result.error}`;
            outputArea.classList.remove('status-success');
            outputArea.classList.add('status-error');
            
            // Ensure error output is visible
            switchOutputTab('output');
            setTimeout(() => {
                outputArea.style.display = 'block';
                outputArea.classList.add('active');
            }, 100);
            
            showToast('Execution failed. Check console for errors.', 'error');
        }
    } catch (error) {
        outputArea.textContent = `Error: ${error.message}. Is the backend server running?`;
        outputArea.classList.add('status-error');
        showToast('Failed to connect to the backend.', 'error');
    } finally {
        showLoading(false);
    }
}


function executeJavaScript(code, input, isDebug = false) {
    let processedCode = code;
    if (isDebug) {
        const lines = code.split('\n');
        // Prepend 'debugger;' to lines with breakpoints
        [...breakpoints].forEach(lineNum => {
            if (lineNum < lines.length) {
                lines[lineNum] = `debugger; ${lines[lineNum]}`;
            }
        });
        processedCode = lines.join('\n');
    }

    let output = [];
    const originalConsoleLog = console.log;
    const originalPrompt = window.prompt;
    
    window.prompt = () => input;

    console.log = (...args) => {
        output.push(args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return 'Unserializable object';
                }
            }
            return String(arg);
        }).join(' '));
    };

    try {
        new Function(processedCode)();
        return output.join('\n') || 'Code executed with no output.';
    } catch (error) {
        throw error;
    } finally {
        console.log = originalConsoleLog;
        window.prompt = originalPrompt;
    }
}

// Analyze Code Complexity
async function analyzeCodeComplexity(code, language) {
    try {
        // Show loading state in complexity area
        complexityArea.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Analyzing code complexity...</p>';
        
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: language,
                code: code,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            complexityArea.innerHTML = `
                <div class="complexity-analysis">
                    <div class="complexity-group">
                        <h4><i class="fas fa-clock"></i> Time Complexity - <span>${result.time}</span></h4>
                    </div>
                    
                    <div class="complexity-group">
                        <h4><i class="fas fa-memory"></i> Space Complexity - <span>${result.space}</span></h4>
                    </div>
                </div>
            `;
        } else {
            complexityArea.innerHTML = `
                <div class="complexity-error">
                    <h4><i class="fas fa-exclamation-triangle"></i> Analysis Error</h4>
                    <p class="status-error">Error: ${result.error}</p>
                    <p>Please check your code and try again.</p>
                </div>
            `;
        }
    } catch (error) {
        complexityArea.innerHTML = `
            <div class="complexity-error">
                <h4><i class="fas fa-exclamation-triangle"></i> Connection Error</h4>
                <p class="status-error">Error: ${error.message}</p>
                <p>Please ensure the backend server is running at http://localhost:3003</p>
            </div>
        `;
    }
}

function executeHtml(code) {
    outputArea.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    outputArea.appendChild(iframe);

    const cssContent = projectFiles['styles.css'] ? projectFiles['styles.css'].content : '';
    const jsContent = projectFiles['main.js'] ? projectFiles['main.js'].content : '';

    iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${cssContent}</style>
        </head>
        <body>
            ${code}
            <script>${jsContent}<\/script>
        </body>
        </html>
    `;
    showToast('HTML preview rendered.', 'success');
}

// Clear output area
function clearOutput(showNotification = true) {
    outputArea.textContent = '';
    outputArea.classList.remove('status-error', 'status-success');
    
    // Also clear complexity analysis
    complexityArea.innerHTML = '';
    
    // Ensure output area remains visible after clearing
    switchOutputTab('output');
    outputArea.style.display = 'block';
    outputArea.classList.add('active');
    outputArea.style.overflow = 'auto';
    outputArea.style.maxHeight = '100%';
    outputArea.style.height = '100%';
    
    if (showNotification) {
        showToast('Output cleared');
    }
}

// Copy output to clipboard
function copyOutput() {
    const output = outputArea.textContent.trim();
    
    if (!output) {
        showToast('No output to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(output)
        .then(() => {
            showToast('Output copied to clipboard');
        })
        .catch(err => {
            showToast('Failed to copy output', 'error');
            console.error('Copy failed:', err);
        });
}

// Download output as text file
function downloadOutput() {
    const output = outputArea.textContent.trim();
    
    if (!output) {
        showToast('No output to download', 'warning');
        return;
    }
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `output-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Output downloaded');
}

// Toggle input/output section visibility
function toggleIOSection() {
    isIOSectionVisible = !isIOSectionVisible;
    
    if (isIOSectionVisible) {
        ioSection.classList.add('show');
        inputToggle.classList.add('is-active');
    } else {
        ioSection.classList.remove('show');
        inputToggle.classList.remove('is-active');
    }
}

// Format code based on language
function formatCode() {
    const code = codeMirrorEditor ? codeMirrorEditor.getValue() : '';
    
    if (!code.trim()) {
        showToast('No code to format', 'warning');
        return;
    }
    
    // This is a basic formatter - in a real app, you'd use a proper formatting library
    try {
        let formattedCode = code;
        
        // Basic formatting rules
        formattedCode = formattedCode
            .replace(/\t/g, '    ') // Convert tabs to spaces
            .replace(/\s+\n/g, '\n') // Remove trailing whitespace
            .replace(/\n{3,}/g, '\n\n'); // Limit consecutive empty lines to 2
        
        if (codeMirrorEditor) {
            codeMirrorEditor.setValue(formattedCode);
        }
        
        updateLineNumbers();
        
        showToast('Code formatted');
    } catch (error) {
        showToast('Formatting failed', 'error');
        console.error('Formatting error:', error);
    }
}

// Toggle file menu
function toggleFileMenu() {
    isFileMenuOpen = !isFileMenuOpen;
    
    if (isFileMenuOpen) {
        fileMenu.classList.add('show');
        fileBtn.classList.add('is-active');
    } else {
        hideFileMenu();
    }
}

// Hide file menu
function hideFileMenu() {
    fileMenu.classList.remove('show');
    fileBtn.classList.remove('is-active');
    isFileMenuOpen = false;
}

// Create a new file
function createNewFile() {
    if ((codeMirrorEditor ? codeMirrorEditor.getValue() : '') && 
        !confirm('Are you sure? Any unsaved changes will be lost.')) {
        return;
    }
    
    if (codeMirrorEditor) {
        codeMirrorEditor.setValue('');
    }
    
    customInput.value = '';
    clearOutput();
    updateLineNumbers();
    
    hideFileMenu();
    showToast('New file created');
}

// Save code to local storage
function saveCode() {
    // Code saving to localStorage is disabled to provide a fresh session for each user.
}


// Save code to a file
function saveCodeToFile() {
    const code = codeMirrorEditor ? codeMirrorEditor.getValue() : '';
    const extension = languageConfig[currentLanguage].extension;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${currentFile.split('.')[0]}-${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    hideFileMenu();
    showToast('Code saved to file');
}

// Save code as a specific file
function saveCodeAsFile() {
    showToast('Save As functionality would be implemented here');
}

// Download current file
function downloadCurrentFile() {
    saveCodeToFile();
}

// Load code from a file
function loadCodeFromFile(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        if (codeMirrorEditor) {
            codeMirrorEditor.setValue(e.target.result);
        }
        
        updateLineNumbers();
        showToast('File loaded successfully');
        
        // Update current file name
        currentFile = file.name;
        currentFileName.textContent = currentFile;
    };
    
    reader.onerror = function() {
        showToast('Error reading file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
    hideFileMenu();
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
            .then(() => {
                isFullscreen = true;
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                fullscreenBtn.setAttribute('title', 'Exit fullscreen');
                showToast('Entered fullscreen mode');
            })
            .catch(err => {
                console.error('Fullscreen error:', err);
                showToast('Fullscreen failed', 'error');
            });
    } else {
        document.exitFullscreen()
            .then(() => {
                isFullscreen = false;
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.setAttribute('title', 'Enter fullscreen');
                showToast('Exited fullscreen mode');
            })
            .catch(err => {
                console.error('Exit fullscreen error:', err);
            });
    }
}

// Toggle file explorer
function toggleFileExplorer() {
    isExplorerOpen = !isExplorerOpen;
    
    if (isExplorerOpen) {
        fileExplorer.classList.add('show');
    } else {
        fileExplorer.classList.remove('show');
    }
}

// Create new file in explorer
function createNewFileInExplorer() {
    const fileName = prompt('Enter file name:');
    if (fileName) {
        // Add to file system
        projectFiles[fileName] = {
            content: '',
            language: 'javascript',
            type: 'file'
        };
        
        // Update UI
        updateFileExplorer();
        showToast(`Created new file: ${fileName}`);
    }
}

// Delete file
function deleteFile(fileName) {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
        delete projectFiles[fileName];
        if (currentFile === fileName) {
            currentFile = Object.keys(projectFiles)[0];
            loadFileContent(currentFile);
        }
        updateFileExplorer();
        showToast(`Deleted file: ${fileName}`);
    }
}

// Create new folder
function createNewFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        // Add to file system
        projectFiles[folderName] = {
            content: '',
            type: 'folder',
            children: {}
        };
        
        // Update UI
        updateFileExplorer();
        showToast(`Created new folder: ${folderName}`);
    }
}

// Handle file selection in explorer
function handleFileSelection(event) {
    const fileItem = event.target.closest('.file-item');
    if (!fileItem) return;
    
    const fileName = fileItem.dataset.file;
    if (fileName && projectFiles[fileName] && projectFiles[fileName].type === 'file') {
        // Remove active class from all items
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected item
        fileItem.classList.add('active');
        
        // Load file content
        loadFileContent(fileName);
    }
}

// Load file content
function loadFileContent(fileName) {
    if (projectFiles[fileName] && projectFiles[fileName].type === 'file') {
        if (codeMirrorEditor) {
            codeMirrorEditor.setValue(projectFiles[fileName].content);
        }
        
        currentFile = fileName;
        currentFileName.textContent = currentFile;
        
        // Update language if needed
        if (projectFiles[fileName].language) {
            updateLanguage(projectFiles[fileName].language);
        }
        
        updateLineNumbers();
        showToast(`Loaded file: ${fileName}`);
    }
}

// Update file explorer UI
function updateFileExplorer() {
    fileList.innerHTML = '';
    
    for (const fileName in projectFiles) {
        if (projectFiles.hasOwnProperty(fileName)) {
            const file = projectFiles[fileName];
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${fileName === currentFile ? 'active' : ''}`;
            fileItem.dataset.file = fileName;
            
            if (file.type === 'file') {
                fileItem.innerHTML = `<i class="fas fa-file-code"></i><span>${fileName}</span><button class="delete-file-btn" data-file="${fileName}">&times;</button>`;
            } else {
                fileItem.innerHTML = `<i class="fas fa-folder"></i><span>${fileName}</span><button class="delete-file-btn" data-file="${fileName}">&times;</button>`;
            }
            
            fileList.appendChild(fileItem);
        }
    }

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFile(e.target.dataset.file);
        });
    });

    // Add event listeners for file selection
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', handleFileSelection);
    });
}

// Create file system
function createFileSystem() {
    // Always create a fresh file system for each new session.
    projectFiles = {
        'main.js': {
            content: languageConfig.javascript.placeholder,
            language: 'javascript',
            type: 'file'
        }
    };
    updateFileExplorer();
}

// Create new project
function createNewProject() {
    if (confirm('Create new project? Current unsaved changes will be lost.')) {
        projectFiles = {
            'main.js': {
                content: languageConfig.javascript.placeholder,
                language: 'javascript',
                type: 'file'
            }
        };
        
        if (codeMirrorEditor) {
            codeMirrorEditor.setValue(languageConfig.javascript.placeholder);
        }
        
        currentFile = 'main.js';
        currentFileName.textContent = currentFile;
        updateLanguage('javascript');
        updateFileExplorer();
        updateLineNumbers();
        
        hideFileMenu();
        showToast('New project created');
    }
}

// Export project as zip
function exportProjectAsZip() {
    showToast('Project export functionality would be implemented here');
}

// Open settings modal
function openSettings() {
    // Load current settings
    const fontSize = localStorage.getItem('codelab-font-size') || '14';
    const tabSize = localStorage.getItem('codelab-tab-size') || '4';
    const theme = localStorage.getItem('codelab-editor-theme') || 'default';
    const autoClose = localStorage.getItem('codelab-auto-close-brackets') !== 'false';
    const wrapLines = localStorage.getItem('codelab-line-wrapping') === 'true';
    
    // Set values
    fontSizeSlider.value = fontSize;
    fontSizeValue.textContent = `${fontSize}px`;
    tabSizeInput.value = tabSize;
    themeSelect.value = theme;
    autoCloseBrackets.checked = autoClose;
    lineWrapping.checked = wrapLines;
    
    // Show modal
    settingsModal.classList.add('show');
}

// Close settings modal
function closeSettings() {
    settingsModal.classList.remove('show');
}

// Save settings
function saveSettings() {
    const fontSize = fontSizeSlider.value;
    const tabSize = tabSizeInput.value;
    const theme = themeSelect.value;
    const autoClose = autoCloseBrackets.checked;
    const wrapLines = lineWrapping.checked;
    
    // Save to localStorage
    localStorage.setItem('codelab-font-size', fontSize);
    localStorage.setItem('codelab-tab-size', tabSize);
    localStorage.setItem('codelab-editor-theme', theme);
    localStorage.setItem('codelab-auto-close-brackets', autoClose);
    localStorage.setItem('codelab-line-wrapping', wrapLines);
    
    // Apply settings
    document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
    
    if (codeMirrorEditor) {
        codeMirrorEditor.getWrapperElement().style.fontSize = `${fontSize}px`;
        codeMirrorEditor.setOption('tabSize', parseInt(tabSize));
        codeMirrorEditor.setOption('indentUnit', parseInt(tabSize));
        codeMirrorEditor.setOption('theme', theme);
        codeMirrorEditor.setOption('autoCloseBrackets', autoClose);
        codeMirrorEditor.setOption('lineWrapping', wrapLines);
    }
    
    closeSettings();
    showToast('Settings saved successfully');
}

// Update font size preview
function updateFontSizePreview() {
    fontSizeValue.textContent = `${fontSizeSlider.value}px`;
}

// Validate tab size input
function validateTabSize() {
    let value = parseInt(tabSizeInput.value);
    if (isNaN(value) || value < 2) value = 2;
    if (value > 8) value = 8;
    tabSizeInput.value = value;
}

// Switch output tab
function switchOutputTab(tabName) {
    // Hide all tabs first
    document.querySelectorAll('.output-area').forEach(area => {
        area.classList.remove('active');
        area.style.display = 'none';
        area.style.overflow = 'auto';
        area.style.maxHeight = '100%';
        area.style.height = '100%';
    });
    
    // Deactivate all tab buttons
    outputTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activate selected tab
    const targetArea = document.getElementById(`${tabName}Area`);
    const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (targetArea && targetTab) {
        targetArea.classList.add('active');
        targetArea.style.display = 'block';
        targetArea.style.overflow = 'auto';
        targetArea.style.maxHeight = '100%';
        targetArea.style.height = '100%';
        targetTab.classList.add('active');
        
        // Ensure proper content separation - only show the selected tab content
        if (tabName === 'output') {
            // Show only output content, hide others
            document.getElementById('complexityArea').style.display = 'none';
            document.getElementById('debugArea').style.display = 'none';
        } else if (tabName === 'complexity') {
            // Show only complexity content, hide others
            document.getElementById('outputArea').style.display = 'none';
            document.getElementById('debugArea').style.display = 'none';
        } else if (tabName === 'debug') {
            // Show only debug content, hide others
            document.getElementById('outputArea').style.display = 'none';
            document.getElementById('complexityArea').style.display = 'none';
        }
    }
}

// Toggle debug mode
function toggleDebugMode() {
    isDebugMode = !isDebugMode;

    if (isDebugMode) {
        debugBtn.classList.add('active');
        showToast('Debug mode activated', 'info');
        switchOutputTab('debug');
        
        // Show debug controls and information
        const debugControls = document.querySelector('#debugArea .debug-controls');
        if (debugControls) {
            debugControls.style.display = 'flex';
        }
        
        const debugInfo = document.querySelector('#debugArea .debug-info');
        if (debugInfo) {
            debugInfo.innerHTML = `
                <h4>Debug Controls</h4>
                <p>Use the debug controls below to step through your code:</p>
                
                <h4>Breakpoints</h4>
                <div id="breakpointsList">No breakpoints set</div>
                
                <h4>Variables</h4>
                <div id="variablesList">No variables to display</div>
                
                <h4>Debug Instructions</h4>
                <p>1. Set breakpoints by clicking in the gutter next to line numbers</p>
                <p>2. Click "Execute" to run your code with debugging</p>
                <p>3. Use the debug controls to step through execution</p>
                <p><strong>Note:</strong> Debug mode works best with JavaScript code</p>
            `;
        }
        
        // Re-initialize these elements
        breakpointsList = document.getElementById('breakpointsList');
        variablesList = document.getElementById('variablesList');
        updateBreakpointsList();
    } else {
        debugBtn.classList.remove('active');
        showToast('Debug mode deactivated', 'info');
        switchOutputTab('output');
        
        // Hide debug controls
        const debugControls = document.querySelector('#debugArea .debug-controls');
        if (debugControls) {
            debugControls.style.display = 'none';
        }
        
        const debugInfo = document.querySelector('#debugArea .debug-info');
        if (debugInfo) {
            debugInfo.innerHTML = `
                <h4>Debug Mode Disabled</h4>
                <p>Click the debug button to enable debugging features.</p>
            `;
        }
    }
}

// Toggle breakpoint
function toggleBreakpoint(line) {
    const info = codeMirrorEditor.lineInfo(line);
    const hasBreakpoint = info.gutterMarkers && info.gutterMarkers.breakpoints;
    
    if (hasBreakpoint) {
        codeMirrorEditor.setGutterMarker(line, "breakpoints", null);
        breakpoints = breakpoints.filter(bp => bp !== line);
    } else {
        const marker = document.createElement("div");
        marker.innerHTML = "●";
        marker.style.color = "#ef4444";
        marker.style.cursor = "pointer";
        codeMirrorEditor.setGutterMarker(line, "breakpoints", marker);
        breakpoints.push(line);
    }
    
    updateBreakpointsList();
    showToast(`Breakpoint ${hasBreakpoint ? 'removed' : 'added'} at line ${line + 1}`);
}

// Update breakpoints list
function updateBreakpointsList() {
    if (breakpointsList) {
        if (breakpoints.length === 0) {
            breakpointsList.textContent = 'No breakpoints set';
        } else {
            breakpointsList.innerHTML = breakpoints.sort((a, b) => a - b).map(line => 
                `<div>Line ${line + 1}</div>`
            ).join('');
        }
    }
}

// Debug continue execution
function debugContinueExecution() {
    showToast('Use your browser\'s debugger controls.', 'info');
}

// Debug step over
function stepOver() {
    showToast('Use your browser\'s debugger controls.', 'info');
}

// Debug step into
function stepInto() {
    showToast('Use your browser\'s debugger controls.', 'info');
}

// Debug step out
function stepOut() {
    showToast('Use your browser\'s debugger controls.', 'info');
}

// Handle clicks outside of dropdowns and menus
function handleClickOutside(event) {
    if (isDropdownOpen && !languageBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
        hideDropdown();
    }
    
    if (isFileMenuOpen && !fileBtn.contains(event.target) && !fileMenu.contains(event.target)) {
        hideFileMenu();
    }
    
    if (isExplorerOpen && !fileExplorer.contains(event.target) && !fileExplorerBtn.contains(event.target)) {
        toggleFileExplorer();
    }
    
    if (settingsModal.classList.contains('show') && !settingsModal.contains(event.target) && !settingsBtn.contains(event.target)) {
        closeSettings();
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveCodeToFile();
    }
    
    // Ctrl/Cmd + N for new file
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        createNewFile();
    }
    
    // Ctrl/Cmd + O to load file
    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault();
        fileInput.click();
    }
    
    // Ctrl/Cmd + , for settings
    if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        openSettings();
    }
    
    // Escape to close dropdowns and menus
    if (event.key === 'Escape') {
        if (isDropdownOpen) hideDropdown();
        if (isFileMenuOpen) hideFileMenu();
        if (isExplorerOpen) toggleFileExplorer();
        if (settingsModal.classList.contains('show')) closeSettings();
        if (isFullscreen) toggleFullscreen();
    }
}

// Show loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('show');
        runBtn.classList.add('loading');
    } else {
        loadingOverlay.classList.remove('show');
        runBtn.classList.remove('loading');
    }
}

// Show toast notification
function showToast(message, type = 'default') {
    toastMessage.textContent = message;
    toast.className = 'toast';
    
    if (type !== 'default') {
        toast.classList.add(type);
    }
    
    toast.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize the editor
initEditor();

// Handle fullscreen change events
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullscreen) {
        isFullscreen = false;
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.setAttribute('title', 'Enter fullscreen');
    }
});

// Auto-detect language based on code content
function autoDetectLanguage(code) {
    const trimmedCode = code.trim();
    
    // Python detection
    if (trimmedCode.includes('def ') || trimmedCode.includes('import ') || 
        trimmedCode.includes('print(') || trimmedCode.includes('if __name__') ||
        trimmedCode.startsWith('#') || trimmedCode.includes('elif ') ||
        trimmedCode.includes('try:') || trimmedCode.includes('except:')) {
        return 'python';
    }
    
    // Java detection
    if (trimmedCode.includes('public class') || trimmedCode.includes('public static void main') ||
        trimmedCode.includes('System.out.println') || trimmedCode.includes('import java.') ||
        trimmedCode.includes('private ') || trimmedCode.includes('protected ')) {
        return 'java';
    }
    
    // C++ detection
    if (trimmedCode.includes('#include <iostream>') || trimmedCode.includes('using namespace std') ||
        trimmedCode.includes('cout <<') || trimmedCode.includes('cin >>') ||
        trimmedCode.includes('std::') || trimmedCode.includes('namespace ')) {
        return 'cpp';
    }
    
    // C detection
    if (trimmedCode.includes('#include <stdio.h>') || trimmedCode.includes('printf(') ||
        trimmedCode.includes('scanf(') || trimmedCode.includes('#include <stdlib.h>') ||
        (trimmedCode.includes('#include') && !trimmedCode.includes('<iostream>'))) {
        return 'c';
    }
    
    // TypeScript detection
    if (trimmedCode.includes(': string') || trimmedCode.includes(': number') ||
        trimmedCode.includes(': boolean') || trimmedCode.includes('interface ') ||
        trimmedCode.includes('type ') || trimmedCode.includes('enum ') ||
        trimmedCode.includes('as ') || trimmedCode.includes('extends ')) {
        return 'typescript';
    }
    
    // HTML detection
    if (trimmedCode.includes('<!DOCTYPE html>') || trimmedCode.includes('<html>') ||
        trimmedCode.includes('<head>') || trimmedCode.includes('<body>') ||
        trimmedCode.includes('<div>') || trimmedCode.includes('<p>')) {
        return 'html';
    }
    
    // CSS detection
    if (trimmedCode.includes('{') && trimmedCode.includes('}') && 
        (trimmedCode.includes(':') || trimmedCode.includes('@media') || 
         trimmedCode.includes('@keyframes') || trimmedCode.includes('/*'))) {
        return 'css';
    }
    
    // Go detection
    if (trimmedCode.includes('package main') || trimmedCode.includes('import "fmt"') ||
        trimmedCode.includes('func main()') || trimmedCode.includes('fmt.Println') ||
        trimmedCode.includes('var ') || trimmedCode.includes('const ')) {
        return 'go';
    }
    
    // Rust detection
    if (trimmedCode.includes('fn main()') || trimmedCode.includes('println!') ||
        trimmedCode.includes('let ') || trimmedCode.includes('mut ') ||
        trimmedCode.includes('use ') || trimmedCode.includes('mod ')) {
        return 'rust';
    }
    
    // Default to JavaScript
    return 'javascript';
}
