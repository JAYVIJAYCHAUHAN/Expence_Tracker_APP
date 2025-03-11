# Expense Tracker Application

A modern, feature-rich expense tracking application built with Vue.js and Express.js that helps users take control of their financial life with smart insights and powerful management tools.

## ✨ Key Features

### 📊 Smart Analytics
- Real-time expense tracking and visualization
- Interactive charts and graphs
- Expense prediction based on historical data
- Monthly, weekly, and yearly trends
- Category-wise spending analysis
- Custom date range analytics

### 💰 Budget Management
- Set monthly and category-wise budgets
- Smart alerts when nearing budget limits
- Budget vs Actual spending comparisons
- Rollover unused budget
- Budget recommendations based on spending patterns

### 🎯 Financial Goals
- Set and track savings goals
- Goal progress visualization
- Smart recommendations for achieving goals
- Milestone celebrations
- Goal sharing with family members

### 📱 Smart Features
- Receipt scanning and automatic expense entry
- Voice command expense entry
- Recurring expense automation
- Multi-currency support
- Export reports in PDF/Excel
- Dark/Light theme support
- Offline mode support

### 👥 Social Features
- Family expense sharing
- Split expenses with friends
- Group expense tracking
- Expense comparisons with similar users
- Share savings tips and achievements

### 🔔 Smart Notifications
- Budget alerts
- Bill payment reminders
- Unusual spending alerts
- Goal achievement notifications
- Smart saving opportunities
- Weekly/Monthly report summaries

### 🔒 Enhanced Security
- Two-factor authentication
- Biometric login support
- End-to-end encryption
- Secure data backup
- Privacy controls
- Activity logging

### 📈 Investment Tracking
- Investment portfolio overview
- Stock market integration
- Mutual fund tracking
- Investment recommendations
- ROI calculations
- Risk analysis

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

## 🎨 User Interface
- Modern, intuitive design
- Responsive across all devices
- Customizable dashboards
- Interactive charts and graphs
- Gesture controls
- Accessibility features
- Quick actions

## 📱 Mobile Features
- Native mobile app experience
- Push notifications
- Widget support
- Quick expense entry
- Offline mode
- Camera integration for receipts
- Location-based expense tracking

## 🤖 Smart Automation
- Recurring expense scheduling
- Auto-categorization of expenses
- Smart bill detection from emails
- Bank statement import
- Automated report generation
- Smart saving suggestions

## 🔄 Integration Support
- Bank account synchronization
- Credit card integration
- Digital wallet connection
- Tax software integration
- Accounting software export
- Multiple payment gateway support

## 📊 Advanced Reports
- Custom report builder
- Tax-ready reports
- Category analysis
- Trend predictions
- Comparative analysis
- Export in multiple formats

## 🌟 Premium Features
- Advanced analytics
- Priority support
- Cloud backup
- Family account sharing
- Investment tracking
- AI-powered insights
- Custom categories
- Unlimited history

## 🎯 Coming Soon
- AI-powered financial advisor
- Cryptocurrency tracking
- Smart receipt scanner
- Budget optimization AI
- Investment recommendations
- Multi-language support
- Smart saving challenges
- Social expense sharing

## 💡 Tips for Better Financial Management
1. **Regular Tracking**
   - Log expenses daily
   - Review weekly summaries
   - Monthly budget assessment

2. **Smart Budgeting**
   - Set realistic category budgets
   - Use automated tracking
   - Monitor spending patterns

3. **Goal Setting**
   - Create short and long-term goals
   - Track progress regularly
   - Adjust strategies as needed

4. **Security Best Practices**
   - Regular password updates
   - Enable 2FA
   - Review activity logs
   - Secure data backup 