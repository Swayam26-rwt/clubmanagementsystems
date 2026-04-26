# Club Management System

## 🌐 Live Demo

🔗 https://cu-club-manager.preview.emergentagent.com

---

## 📌 Overview

The **Club Management System** is a full-stack web application designed to streamline the management of college or organizational clubs. It provides an intuitive interface for handling memberships, events, and administrative tasks efficiently.

This project demonstrates end-to-end development using modern web technologies including frontend design, backend APIs, and database integration.

---

## 🚀 Features

### 👤 User Features

* User registration and login authentication
* View club details and available events
* Join or leave clubs
* Dashboard for user activity

### 🛠️ Admin Features

* Manage club members
* Create, update, and delete events
* Monitor registrations
* Maintain club records

### 🔐 Security

* Authentication system for protected routes
* Basic data validation and access control

---

## 🏗️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Deployment

* Netlify (Frontend)
* Backend hosted via cloud service (API-based architecture)

---

## 📂 Project Structure

```
club-management-system/
│
├── frontend/          # UI (HTML, CSS, JS)
├── backend/           # Server (Node.js + Express)
├── models/            # Database schemas
├── routes/            # API routes
├── controllers/       # Business logic
├── config/            # DB & environment configs
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/club-management-system.git
cd club-management-system
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

### 4️⃣ Run Backend Server

```bash
npm start
```

### 5️⃣ Run Frontend

Open `index.html` or deploy using Netlify

---

## 📡 API Endpoints (Sample)

| Method | Endpoint  | Description       |
| ------ | --------- | ----------------- |
| GET    | /clubs    | Get all clubs     |
| POST   | /clubs    | Create new club   |
| POST   | /login    | User login        |
| POST   | /register | User registration |

---

## 🧠 Learning Outcomes

* Full-stack application development
* RESTful API design
* Database CRUD operations
* Deployment and hosting
* Authentication workflows

---

## 📸 Future Improvements

* Role-based access (Admin/User separation)
* Payment integration for events
* Email notifications
* Advanced analytics dashboard

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed by **Swayam Rawat**  **Lakshya Gupta**   **Parul Rana**

---

## ⭐ Acknowledgment

This project is part of academic learning and practical implementation of full-stack development concepts.

---
