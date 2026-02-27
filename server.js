import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store
let users = [
  { id: 1, name: "Admin", email: "admin@gmail.com", password: "admin", role: "admin" },
  { id: 2, name: "Test User", email: "user@gmail.com", password: "user", role: "user" }
];

let products = [
  {
    id: 1,
    title: "Premium Wireless Headphones",
    description: "Industry-leading noise cancellation. Perfect for everyday use.",
    price: 299.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Minimalist Mechanical Keyboard",
    description: "Compact 75% layout with tactile switches for typing and gaming.",
    price: 149.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Ergonomic Office Chair",
    description: "Adjustable lumbar support and breathable mesh design.",
    price: 399.50,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Ceramic Coffee Mug",
    description: "Handcrafted minimalist mug, perfect for your morning brew.",
    price: 24.00,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Men's Classic T-Shirt",
    description: "100% organic cotton, breathable and comfortable.",
    price: 29.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Smart Watch Series 8",
    description: "Advanced health tracking and seamless connectivity.",
    price: 349.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
  }
];

let orders = [];

// Helper functions for IDs
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// --- AUTHENTICATION ---
// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Exclude password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = {
    id: generateId(),
    name,
    email,
    password,
    role: "user" // Default role
  };

  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// --- PRODUCTS ---
// Get all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Get single product
app.get("/api/products/:id", (req, res) => {
  const idStr = req.params.id;
  const product = products.find(p => p.id.toString() === idStr);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Create product (Admin)
app.post("/api/products", (req, res) => {
  const { title, description, price, category, image } = req.body;

  if (!title || !price) {
    return res.status(400).json({ message: "Title and price are required" });
  }

  const newProduct = {
    id: generateId(),
    title,
    description: description || "",
    price: Number(price),
    category: category || "Uncategorized",
    image: image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const idStr = req.params.id;
  const index = products.findIndex(p => p.id.toString() === idStr);

  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const idStr = req.params.id;
  const initialLength = products.length;
  products = products.filter(p => p.id.toString() !== idStr);

  if (products.length < initialLength) {
    res.json({ message: "Product deleted successfully" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// --- ORDERS ---
// Create order
app.post("/api/orders", (req, res) => {
  const { userId, items, totalAmount, shippingAddress, paymentStatus } = req.body;

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const newOrder = {
    id: generateId(),
    userId,
    items,
    totalAmount,
    shippingAddress: shippingAddress || "Demo Address",
    paymentStatus: paymentStatus || "Paid (Demo)",
    status: "Processing",
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// Get user orders
app.get("/api/orders/user/:userId", (req, res) => {
  const userId = req.params.userId;
  const userOrders = orders.filter(o => o.userId.toString() === userId);
  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});

// Get all orders (Admin)
app.get("/api/orders", (req, res) => {
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedOrders);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running at port ${PORT}`);
});

