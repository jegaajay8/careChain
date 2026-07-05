# CareChain

CareChain is a full-stack web application for emergency blood donation management. It connects hospitals and blood donors, enabling hospitals to request blood and donors to respond to matching requests.

## Features

- Donor Registration
- Hospital Registration
- Login with role-based authentication
- Hospital can register patients
- Hospital can send blood requests
- Donor can view matching requests
- Donor can accept or close requests
- Hospital can view accepted donor details
- Donor can edit profile
- Logout functionality

## Technologies Used

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd careChain
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Import the database

Create a MySQL database and import the SQL file located in the `database` folder.

### 5. Configure the database connection

Update the database configuration (for example, in `backend/db.js`) with your MySQL credentials.

### 6. Start the backend

```bash
cd backend
node server.js
```

### 7. Start the frontend

```bash
cd ../client
npm start
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001` (or the port configured in your project)

## Project Structure

```
careChain/
│
├── backend/
│   ├── src/
│   ├── package.json
│   ├── server.js
│   └── db.js
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── database/
│   └── schema.sql
│
└── README.md
```
