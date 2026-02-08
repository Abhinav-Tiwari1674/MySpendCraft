# MySpendCraft - Master Your Finances 🚀

MySpendCraft is a premium personal finance management application built with the MERN stack. It allows users to track expenses, manage bills, and visualize their financial health through a sleek, modern dashboard. It also features a robust Admin Panel for system monitoring and user management.

## ✨ Features

-   **Intelligent Dashboard**: Real-time stats for income, expenses, and savings.
-   **Expense Tracking**: Categorized expense logging with custom tags and currency support.
-   **Bill Management**: Track one-time and recurring bills with status updates.
-   **Premium UI/UX**: Dark mode aesthetic with glassmorphism, micro-animations, and responsive design.
-   **Admin Dashboard**: 
    -   System statistics (Total users, expenses, messages).
    -   User Management (Search, promote/demote admins).
    -   Interactive Quick Actions (Simulated backups, broadcasts, system logs).
-   **Secure Authentication**: JWT-based auth with password reset functionality.

## 🛠️ Tech Stack

-   **Frontend**: React.js, React Router, Axios, React Icons, CSS3 (Vanilla + Variables).
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (Mongoose).
-   **Tools**: Dotenv, Bcrypt.js, JsonWebToken.

## 🚀 Getting Started

### Prerequisites

-   Node.js installed.
-   MongoDB Atlas account or local MongoDB instance.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/myspendcraft.git
    cd MySpendCraft
    ```

2.  **Server Setup**:
    -   Navigate to the `server` directory.
    -   Create a `.env` file based on `.env.example`.
    -   Install dependencies and start the server:
    ```bash
    cd server
    npm install
    npm run dev
    ```

3.  **Client Setup**:
    -   Navigate to the `client` directory.
    -   Install dependencies and start the React app:
    ```bash
    cd client
    npm install
    npm start
    ```

## 🔐 Admin Access

To promote a user to an administrator:
```bash
node scripts/makeAdmin.js <user-email>
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Your Name]
