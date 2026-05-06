import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "citylens-secret-key";
const USERS_FILE = path.join(process.cwd(), "users.json");

// Persistent database helper
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to load users", e);
  }
  return [];
}

function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Failed to save users", e);
  }
}

const users = loadUsers();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mobile-friendly CORS
  app.use(cors({
    origin: true, // Allow all origins for mobile development
    credentials: true
  }));

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, gender, password } = req.body;
    if (!name || !gender || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), name, gender, password: hashedPassword };
    users.push(user);
    saveUsers(users);
    
    const token = jwt.sign({ id: user.id, name: user.name, gender: user.gender }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: false });
    res.json({ user: { name: user.name, gender: user.gender } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { name, password } = req.body;
    const user = users.find((u: any) => u.name === name);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, name: user.name, gender: user.gender }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: false });
    res.json({ user: { name: user.name, gender: user.gender } });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
