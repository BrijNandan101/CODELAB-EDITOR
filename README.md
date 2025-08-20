# CodeLab - A Premium Multi-Language Online Code Editor

CodeLab is a feature-rich, browser-based code editor with a powerful Node.js backend. It supports code execution in multiple languages, provides real-time complexity analysis, and offers a sleek, responsive interface for an exceptional coding experience.

## ✨ Features

-   **Multi-Language Support**: Execute code in JavaScript, Python, Java, C++, and more.
-   **Complexity Analysis**: Get instant feedback on the time and space complexity of your algorithms.
-   **Modern UI**: A clean, minimal, and visually appealing interface with dark and light themes.
-   **Responsive Design**: Fully functional and optimized for both desktop and mobile devices.
-   **File Explorer**: Manage your files and folders with an integrated file explorer.
-   **Customizable Editor**: Adjust font size, tab size, and themes to fit your preferences.
-   **IO Panel**: Provide custom input for your programs and view the output in a dedicated console.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) installed on your machine.

### Installation and Running

**Backend:**

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    The backend server will run on `http://localhost:3003`.

**Frontend:**

1.  Open `frontend/index.html` directly in your browser.

## 🛠️ Technologies Used

-   **Frontend**: HTML, CSS, JavaScript, CodeMirror
-   **Backend**: Node.js, Express.js

## ☁️ Deployment

This project is designed for separate frontend and backend deployments.

### Backend Deployment (Vercel)

1.  Push the project to your GitHub repository.
2.  On Vercel, import your GitHub repository.
3.  Configure the project with the following settings:
    -   **Framework Preset**: `Other`
    -   **Root Directory**: `backend`
    -   **Install Command**: `npm install`
    -   **Start Command**: `node server.js`

### Frontend Deployment (Vercel)

1.  On Vercel, import the same GitHub repository again.
2.  Configure the project with the following settings:
    -   **Framework Preset**: `Other`
    -   **Root Directory**: `frontend`
    -   Leave the **Build & Development Settings** as their defaults.
3.  Deploy. Vercel will serve your static `frontend` directory.

## API Endpoints

-   `POST /execute`: Executes code and returns the output.
-   `POST /analyze`: Analyzes code and returns the time and space complexity.
-   `GET /health`: Checks the health of the server.

---

Thank you for checking out CodeLab!
