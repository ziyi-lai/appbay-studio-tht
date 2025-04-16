# User Management System

## Overview

The User Management System is a full-stack application designed to manage users and items. This project demonstrates proficiency in both frontend (React, Vite) and backend (Node.js, Sequelize, PostgreSQL) development. The application features a modern user interface based on a provided design, complete CRUD operations, real-time input validation using Zod, and logging of all changes.

## Prerequisites

Ensure the following installed on your local machine:

- **Node.js** (version 14 or later)
- **npm** or **yarn** (your package manager)
- **PostgreSQL** (configured for local development)

## Setup and Running
1. **Clone the Repository:**  
   Clone the repository to your local machine.
   ```bash
   git clone https://github.com/ziyi-lai/appbay-studio-tht.git

2. **Navigate to the Backend Directory:**
   ```bash
   cd your-repo/backend

3. **Install Backend Dependencies:**
   Install required packages:
   ```bash
   npm install

4. **Configure database config:**
   Edit your PostgreSQL databaseName, userName, and password at backend/src/config/database.js

6. **Start the Backend Development Server:**
   Launch the backend development server:
   ```
   npm run dev

7. **Navigate to the Frontend Directory:**
   ```
   cd ../frontend

8. **Install Frontend Dependencies:**
   Install required packages:
   ```
   npm install

9. **Configure backend API port config:**
   Edit your local backend port at frontend/src/config/api.tsx

10. **Start the Frontend Development Server:**
    Launch the frontend development server:
    ```
    npm run dev
    The server will typically run on http://localhost:5173
