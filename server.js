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
    title: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation. With Auto NC Optimizer, noise canceling is automatically optimized based on your wearing conditions and environment.",
    price: 348.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Keychron Q1 Pro Mechanical Keyboard",
    description: "A fully customizable 75% layout custom mechanical keyboard with QMK/VIA support. Designed with a double-gasket mount, CNC machined aluminum body, and upgraded OSA profile PBT keycaps.",
    price: 199.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Herman Miller Aeron Chair",
    description: "The benchmark for ergonomic seating. Features 8Z Pellicle mesh for targeted pressure distribution, PostureFit SL for adjustable spinal support, and fully adjustable arms.",
    price: 1250.00,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Ember Temperature Control Smart Mug 2",
    description: "Keeps your hot drink at the exact temperature you prefer (between 120°F - 145°F). Features a 10 oz capacity, 1.5 hour battery life, and control via a smartphone app.",
    price: 129.95,
    category: "Home",
    image: "https://images.unsplash.com/photo-1614088059882-70650d53c7c2?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Apple Watch Series 9",
    description: "Features the S9 chip for a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen using Double Tap.",
    price: 399.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1434493789847-2f02b0c1685c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "PlayStation 5 DualSense Wireless Controller",
    description: "Discover a deeper, highly immersive gaming experience that brings the action to life in the palms of your hands. Features haptic feedback and dynamic trigger effects.",
    price: 69.99,
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 7,
    title: "Oculus Quest 2 Advanced All-In-One VR Headset",
    description: "Experience total immersion with 3D positional audio, hand tracking and haptic feedback, working together to make virtual worlds feel real. Features 128GB of storage.",
    price: 299.00,
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 8,
    title: "Logitech MX Master 3S Wireless Mouse",
    description: "Features an 8K DPI track-on-glass sensor and Quiet Clicks technology, delivering 90% less click noise. The MagSpeed scroll wheel is precise enough to stop on a pixel and quick enough to scroll 1,000 lines per second.",
    price: 99.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop"
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

