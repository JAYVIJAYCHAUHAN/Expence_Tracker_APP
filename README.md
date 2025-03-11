# Expense Tracker Application

A full-stack expense tracking application built with Vue.js and Express.js that helps users manage their personal finances.

## Features

- 🔐 User Authentication (Signup/Login)
- 💰 Expense Management (Add/Edit/Delete)
- 📊 Monthly Expense Summary
- 📱 Responsive Design
- 🎯 Category-based Expense Tracking
- 📅 Date-wise Expense Filtering

## Tech Stack

### Frontend
- Vue.js 3
- Element Plus UI Framework
- Vue Router
- Axios
- Vite

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Cors
- Dotenv

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd Expence_Tracker
```

2. Backend Setup:
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with:
```
MONGO_URL=your_mongodb_atlas_url
PORT=5000
```

3. Frontend Setup:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the Backend Server:
```bash
cd backend
node server.js
```
The server will start on `http://localhost:5000`

2. Start the Frontend Development Server:
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`

## Usage Guide

### 1. Authentication
- **Sign Up**: Create a new account with username, email, and password
- **Login**: Access your account using email and password

### 2. Dashboard Features
- View all expenses in a tabular format
- Filter expenses by month and category
- See monthly expense summaries

### 3. Managing Expenses
- **Add New Expense**:
  - Enter amount
  - Add description
  - Select category
  - Choose date
  
- **Edit Expense**:
  - Click edit button on any expense
  - Modify details
  - Save changes

- **Delete Expense**:
  - Click delete button
  - Confirm deletion

### 4. Categories Available
- Food
- Transportation
- Entertainment
- Shopping
- Bills
- Others

## Security Features
- JWT-based authentication
- Protected API endpoints
- Secure password handling
- Session management

## Best Practices for Users
1. Regular expense tracking
2. Proper categorization
3. Clear descriptions
4. Regular monitoring of summaries
5. Secure logout after usage

## Project Structure
```
Expence_Tracker/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── views/
    │   ├── router/
    │   └── assets/
    └── package.json
```

## Contributing
Feel free to fork this project and submit pull requests. For major changes, please open an issue first.

## License
This project is licensed under the MIT License.

## Support
For support, email [your-email] or open an issue in the repository. 