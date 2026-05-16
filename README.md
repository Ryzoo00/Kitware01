# LuxeLiving - MERN Stack E-Commerce Platform

A full-featured, modern e-commerce web application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring a beautiful UI with Tailwind CSS and Framer Motion animations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

## ✨ Features

### Frontend
- 🎨 Modern, responsive design with Tailwind CSS
- 🌙 Dark/Light mode toggle
- 🎭 Smooth animations with Framer Motion
- 📱 Mobile-first responsive design
- 🖼️ Image zoom and gallery features
- 🛒 Shopping cart with persistent storage
- ❤️ Wishlist functionality
- 🔍 Advanced product search and filters
- ⭐ Product reviews and ratings
- 🎁 Promotional gift box section

### Backend
- 🔐 JWT-based authentication
- 👤 User roles (admin/user)
- 📦 Order management system
- 🏷️ Category-based product organization
- 💰 Coupon/discount system
- 📧 Email notifications
- 🖼️ Cloudinary image upload integration

### Admin Dashboard
- 📊 Sales analytics and charts
- 📈 Revenue visualization
- 🛍️ Product CRUD operations
- 📋 Order management
- 👥 User management
- 🎫 Coupon management

## 🚀 Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Framer Motion
- Zustand (state management)
- React Query
- Axios
- Lucide React (icons)
- Recharts (charts)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary SDK
- Nodemailer
- Express Validator
- Helmet (security)

## 📁 Project Structure

```
E-Com1/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── package.json
└── package.json           # Root package.json
```

## 🛠️ Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd E-Com1
```

### Step 2: Install Dependencies

Install root dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### Step 3: Environment Setup

1. **Server Environment Variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit `.env` and add your values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

2. **Client Environment Variables**
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

### Step 4: Start the Development Servers

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📖 Usage

### User Features
1. **Browse Products**: View products with filtering and sorting options
2. **Product Details**: See detailed product information with image zoom
3. **Shopping Cart**: Add/remove items, apply coupons
4. **Checkout**: Multi-step checkout with multiple payment options
5. **Order History**: Track orders and view order details
6. **Wishlist**: Save favorite products for later

### Admin Features
1. **Dashboard**: View sales analytics and statistics
2. **Product Management**: Add, edit, delete products
3. **Order Management**: Update order statuses
4. **User Management**: Manage user accounts and roles
5. **Coupon Management**: Create and manage discount codes

## 🎨 Customization

### Themes
The application supports both light and dark modes. Toggle between themes using the sun/moon icon in the navbar.

### Colors
Primary brand colors can be customized in:
- `client/tailwind.config.js` - Update the primary/secondary colors
- `client/src/index.css` - Modify CSS custom properties

### Admin Account
To create an admin user:
1. Register a new account
2. Update the user's role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Create a new web service
2. Connect your repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the project:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `dist` folder

### MongoDB Atlas
1. Create a cluster
2. Get connection string
3. Update `MONGODB_URI` in server environment variables

## 🔒 Security Features

- Helmet.js for security headers
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation with express-validator

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or use MongoDB Atlas
   - Check `MONGODB_URI` in server `.env`

2. **Cloudinary Upload Errors**
   - Verify Cloudinary credentials
   - Check upload preset configuration

3. **CORS Errors**
   - Ensure `FRONTEND_URL` matches your frontend URL
   - Check browser console for specific error messages

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@luxeliving.com or open an issue in the repository.

## 🙏 Acknowledgments

- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [MongoDB](https://www.mongodb.com)
- [Express.js](https://expressjs.com)

---

Built with ❤️ by the LuxeLiving Team
