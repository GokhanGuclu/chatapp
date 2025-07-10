# ChatApp - Real-Time Messaging Application

A modern and user-friendly real-time messaging application. Available as both an Electron-based desktop application and web interface, usable on both desktop and browser.

## 🚀 Features

### General Features
- Real-time messaging
- User-friendly interface
- Desktop application (Electron) and web support
- Custom window controls (minimize, maximize, close)
- Responsive design
- Real-time notification system

### Messaging Features
- One-on-one messaging
- Message history
- Message deletion
- Chat deletion
- Online/offline status
- Last seen timestamp
- Read receipts
- Message notifications

### User Features
- User registration and login
- Add/remove friends
- Friends list
- Profile settings
- Profile picture support
- Friend request notifications
- Notification management (read/unread)
- Notification history

### Notification System
- Real-time notifications
- Different notification types (message, friend request)
- Notification counter
- Notification read/unread status
- View notification history
- Mark all notifications as read
- Notification details (sender, time, content)

## 🛠️ Technologies

### Backend
- Python 3.x
- Flask (Web Framework)
- Flask-SocketIO (Real-time communication)
- SQLAlchemy (ORM)
- SQL Server (Database)
- Flask-CORS (CORS support)
- T-SQL Stored Procedures
- WebSocket support

### Frontend
- React.js
- React Router (Page routing)
- Socket.IO Client (Real-time communication)
- Electron (Desktop application)
- React Icons
- React Hot Toast (Notifications)

## 📦 Project Setup

### 1. Requirements
- **System Requirements**
  - Windows 10 or higher
  - At least 4GB RAM
  - 1GB free disk space
  - Internet connection

- **Software Requirements**
  - Git (v2.x or higher)
  - Python 3.x
  - Node.js (v16 or higher)
  - npm (comes with Node.js)
  - SQL Server (2019 or higher)
  - Visual Studio Code (recommended)

### 2. Download Project
```bash
# Clone the project
git clone https://github.com/GokhanGuclu/chatapp.git

# Navigate to project directory
cd chatapp
```

### 3. Backend Setup
1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Create Python Virtual Environment**
   ```bash
   # For Windows
   python -m venv venv
   venv\Scripts\activate

   # For Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Setup**
   - Ensure SQL Server is running
   - Check database connection information in `config.py`
   - Create `.env` file if needed

5. **Start Backend**
   ```bash
   python run.py
   # Server will run at http://localhost:5000
   ```

### 4. Frontend Setup
1. **Navigate to Frontend Directory**
   ```bash
   cd ../chatapp-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run in Development Mode**
   ```bash
   # Run as web application
   npm start
   # Will open at http://localhost:3000

   # Run as Electron application
   npm run electron-dev
   ```

4. **Build Production Version**
   ```bash
   # For web application
   npm run build

   # For Electron application
   npm run electron-pack
   ```

### 5. Project Structure
```
chatapp/
├── backend/                 # Backend application
│   ├── app/                # Application code
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   └── socket.py      # WebSocket operations
│   ├── config.py          # Configuration
│   ├── requirements.txt   # Python dependencies
│   └── run.py            # Startup file
│
├── chatapp-frontend/       # Frontend application
│   ├── public/            # Static files
│   │   ├── electron.js    # Electron main process
│   │   └── preload.js     # Electron preload
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React contexts
│   │   └── utils/       # Utility functions
│   └── package.json     # Node.js dependencies
│
└── README.md             # Project documentation
```

### 6. Development Environment
- **Backend Development**
  - Python IDE (VS Code recommended)
  - SQL Server Management Studio
  - Postman (for API testing)

- **Frontend Development**
  - VS Code extensions:
    - ESLint
    - Prettier
    - React Developer Tools
    - Redux DevTools

### 7. Common Issues and Solutions

#### Backend Issues
- **Database Connection Error**
  - Ensure SQL Server service is running
  - Check connection information
  - Check firewall settings

- **Port Conflict**
  - If port 5000 is in use:
    ```bash
    set FLASK_RUN_PORT=5001
    python run.py
    ```

#### Frontend Issues
- **Node Modules Error**
  ```bash
  rm -rf node_modules
  npm install
  ```

- **Port Conflict**
  ```bash
  # If port 3000 is in use
  set PORT=3001 && npm start
  ```

- **Electron Build Error**
  ```bash
  npm run build
  npm run electron-pack
  ```

#### Notification System Issues
- **Notifications Not Showing**
  - Check WebSocket connection
  - Ensure user session is active
  - Check error messages in browser console

- **Notification Counter Not Updating**
  - Restart Socket.IO connection
  - Refresh the page
  - Log out and log back in

- **Notifications Not Marked as Read**
  - Check database connection
  - Ensure API endpoints are working correctly
  - Check user permissions

### 8. Testing and Validation
1. **Backend Testing**
   ```bash
   cd backend
   python -m pytest
   ```

2. **Frontend Testing**
   ```bash
   cd chatapp-frontend
   npm test
   ```

3. **Manual Testing**
   - Test backend APIs with Postman
   - Test web application in different browsers
   - Test Electron application

### 9. Deployment
1. **Backend Deployment**
   - Create Python virtual environment
   - Install dependencies
   - Start server with Gunicorn or uWSGI
   - Configure reverse proxy with Nginx or Apache

2. **Frontend Deployment**
   - For web application:
     ```bash
     npm run build
     # Upload build folder to web server
     ```
   - For Electron application:
     ```bash
     npm run electron-pack
     # Distribute installation file from dist folder
     ```

## 🚀 Usage

### Web Application
1. Start backend (`python run.py`)
2. Start frontend (`npm start`)
3. Go to `http://localhost:3000` in browser

### Desktop Application
1. Start backend (`python run.py`)
2. Start desktop application:
   ```bash
   npm run electron-dev
   ```

## 📝 API Endpoints

### User Operations (`/user`)
- `POST /user/register` - New user registration
- `POST /user/login` - User login
- `GET /user/get_by_username/<username>` - Get user info by username
- `GET /user/get_profile/<user_id>` - Get user profile
- `PUT /user/update_status/<user_id>` - Update user status (online/offline)
- `PUT /user/update_last_seen/<user_id>` - Update last seen timestamp
- `PUT /user/toggle_last_seen/<user_id>` - Toggle last seen feature
- `GET /user/get_user_status/<user_id>` - Get user status info
- `GET /user/get_friends_status/<user_id>` - Get friends' status info

### Friendship Operations (`/friendship`)
- `POST /friendship/add` - Send friend request
- `GET /friendship/list/<user_id>` - Get friends list
- `GET /friendship/pending/<user_id>` - Get pending friend requests
- `GET /friendship/sent/<user_id>` - Get sent friend requests
- `DELETE /friendship/remove` - End friendship

### Message Operations (`/message`)
- `GET /message/history/<user_id>/<friend_id>` - Get message history between two users
- `GET /message/active_chats/<user_id>` - Get active chats
- `DELETE /message/<message_id>` - Delete message
- `DELETE /message/chat/<user_id>/<friend_id>` - Delete chat

### Notification Operations (`/notification`)
- `GET /notification/get_notifications/<user_id>` - Get all user notifications
- `POST /notification/mark_read/<notification_id>/<user_id>` - Mark notification as read
- `POST /notification/mark_all_read/<user_id>` - Mark all notifications as read
- `GET /notification/unread_count/<user_id>` - Get unread notification count
- `DELETE /notification/delete/<notification_id>` - Delete notification

### WebSocket Events
- `connect` - Establish connection
- `disconnect` - Disconnect
- `join` - Join room
- `leave` - Leave room
- `send_message` - Send message
- `receive_message` - Receive message
- `message_deleted` - Message deletion notification
- `chat_deleted` - Chat deletion notification
- `get_notifications` - Get notification count
- `notification_count` - Update notification count
- `receive_notification` - Receive new notification
- `notification_read` - Notification read notification
- `friend_request_received` - Receive friend request
- `friend_request_sent` - Send friend request
- `friend_request_accepted` - Friend request accepted notification

### API Request Formats

#### User Registration
```json
POST /user/register
{
    "username": "string",
    "email": "string",
    "password": "string",
    "display_name": "string"
}
```

#### User Login
```json
POST /user/login
{
    "email": "string",
    "password": "string"
}
```

#### Add Friend
```json
POST /friendship/add
{
    "user_id": "integer",
    "friend_id": "integer"
}
```

#### Send Message (WebSocket)
```json
{
    "sender_id": "integer",
    "receiver_id": "integer",
    "content": "string"
}
```

#### Mark Notification
```json
POST /notification/mark_read/<notification_id>/<user_id>
{
    "notification_id": "integer",
    "user_id": "integer"
}
```

#### Mark All Notifications
```json
POST /notification/mark_all_read/<user_id>
{
    "user_id": "integer"
}
```

#### Delete Notification
```json
DELETE /notification/delete/<notification_id>
{
    "notification_id": "integer",
    "user_id": "integer"
}
```

### API Response Formats

#### Success Response
```json
{
    "status": "success",
    "message": "Operation successful",
    "data": { ... }
}
```

#### Error Response
```json
{
    "status": "error",
    "message": "Error message",
    "error_code": "integer"
}
```

#### Success Notification Response
```json
{
    "status": "success",
    "notifications": [
        {
            "id": "integer",
            "type": "string",
            "content": "string",
            "is_read": "boolean",
            "created_at": "datetime",
            "sender_username": "string",
            "sender_profile_picture": "string"
        }
    ]
}
```

#### Notification Counter Response
```json
{
    "status": "success",
    "count": "integer"
}
```

## 🔒 Security
- CORS protection
- SQL injection protection
- XSS protection
- Secure encryption
- Session management

## 🤝 Contributing

If you want to contribute to this project, you can follow these steps:

1. **Fork the Project**
   - Go to the project page on GitHub
   - Click the "Fork" button in the top right
   - This will create a copy of the project in your account

2. **Prepare Development Environment**
   - Download the forked project to your computer:
     ```bash
     git clone https://github.com/GokhanGuclu/chatapp.git
     ```
   - Navigate to project directory:
     ```bash
     cd chatapp
     ```
   - Create a new development branch:
     ```bash
     git checkout -b new-feature
     ```

3. **Make Your Changes**
   - Edit your code
   - Add new features
   - Fix bugs
   - Test your code

4. **Submit Your Changes**
   - Commit your changes:
     ```bash
     git add .
     git commit -m "New feature: [brief description of feature]"
     ```
   - Push your changes to GitHub:
     ```bash
     git push origin new-feature
     ```

5. **Create Pull Request**
   - Go to your forked project page on GitHub
   - Click "Pull Request" button
   - Write a title and detailed description explaining your changes
   - Click "Create Pull Request" button

### Things to Consider When Contributing

- Follow existing code style when writing code
- Update documentation when adding new features
- Don't forget to write tests
- Write descriptive commit messages
- Open an issue and discuss before making major changes

### Development Rules

1. **Code Style**
   - Follow PEP 8 standards for Python
   - Follow ESLint rules for JavaScript/React
   - Use meaningful variable and function names
   - Explain your code with comments

2. **Commit Messages**
   - You can write in Turkish or English
   - First line should be short and concise
   - Add detailed description if needed
   - Example: "feat: Added user profile picture upload feature"

3. **Pull Requests**
   - Title should be descriptive
   - Explain changes in detail
   - Reference related issues if any
   - Add screenshots or test results

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Contact
Gökhan Güçlü - [@github](https://github.com/GokhanGouclu) - [@email](gokanguclu@outlook.com)

Project Link: [https://github.com/Gokhanguclu/chatapp](https://github.com/GokhanGuclu/chatapp)
