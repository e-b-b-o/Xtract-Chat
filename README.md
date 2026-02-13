# Xtract and Chat 

A simple, full-stack web application featuring:

- **Landing Page**: Modern, responsive design.
- **AI Chatbot**: Floating widget that answers questions using RAG (Retrieval-Augmented Generation).
- **Admin Dashboard**: Secure area to upload documents for the chatbot's knowledge base.
- **Authentication**: Secure Login/Register flow with JWT.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express
- **AI/RAG**: Python, ChromaDB, Google Gemini API
- **Database**: MongoDB Atlas

## Setup

### Prerequisites

- Node.js
- Python 3.11
- MongoDB Atlas Account
- Google Gemini API Key

### Installation

1.  **Clone the repository**
2.  **Install Backend Dependencies**
    ↗️ bash
    ↗️ cd server
    ↗️ npm install
3.  **Install Frontend Dependencies**
    ↗️ bash
    ↗️ cd client
    ↗️ npm install
4.  **Install Python Requirements**
    ↗️ bash
    ↗️ cd rag_service
    ↗️ pip install -r requirements.txt
5.  **Environment Variables**
    Create a `.env` file in the root based on `.env.example`.

### Running the App

Under the Terminal

- In Server folder run: `npm start`
- In Client Folder: `npm run dev`
- In Rag_Service Folder: `py -3.11 app.py`

## Admin Setup & File Upload

### 1. Create an Admin User

New users are registered as standard users by default. To make a user an admin:

1.  Register a new user via the website (e.g., `admin@example.com`).
2.  Run the included script in the `server` directory:
    bash
    cd server
    node make_admin.js <your_email>

### 3. Remove Admin Rights

To demote an admin back to a standard user:

In bash
node remove_admin.js <email>

### 4. Delete Documents

In the Admin Dashboard, click the **"Delete"** button next to a document to remove it.

- **Note**: This also resets the AI's knowledge base to ensure accuracy. You may need to re-upload other documents if you want them to remain in the AI's memory.
