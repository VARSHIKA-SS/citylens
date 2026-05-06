import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "citylens-secret-key";
const USERS_FILE = path.join(process.cwd(), "users.json");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (e) {
    console.log(e);
  }
  return [];
}

function saveUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const users = loadUsers();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(express.json());
  app.use(cookieParser());

  // ==========================
  // AUTH
  // ==========================
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  app.post("/api/auth/register", async (req, res) => {
    const { name, gender, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), name, gender, password: hashedPassword };
    users.push(user);
    saveUsers(users);
    const token = jwt.sign({ id: user.id, name: user.name, gender: user.gender }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ user: { name: user.name, gender: user.gender } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { name, password } = req.body;
    const user = users.find((u: any) => u.name === name);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, name: user.name, gender: user.gender }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ user: { name: user.name, gender: user.gender } });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // ==========================
  // GEMINI AI ROUTES
  // ==========================

  app.post("/api/intelligence", async (req, res) => {
    try {
      const { city, userProfile } = req.body;
      const prompt = `You are a street-smart local guide for travelers in India.
      The user is ${userProfile?.name} (${userProfile?.gender}).
      Provide intelligence for the city: ${city}.
      Include real shops, local specialties, language phrases in local script, safety tips, and fair transport prices.

      Return a structured JSON with EXACTLY these keys:
      {
        "city": "string",
        "state": "string",
        "shops": [{"name": "string", "rating": 4.5, "description": "string", "location": [lat, lon], "mapsLink": "string", "address": "string", "category": "restaurant|market|temple|other", "priceRange": "low|medium|high"}],
        "souvenirs": [{"name": "string", "description": "string", "whereToBuy": "string", "fairPrice": "string", "rating": 4.5, "category": "food|craft|clothing|other"}],
        "famousPoints": [{"name": "string", "description": "string", "location": [lat, lon], "category": "landmark|temple|park|museum"}],
        "lingo": [{"phrase": "string", "script": "string", "pronunciation": "string", "meaning": "string"}],
        "safetyTips": ["string"],
        "etiquette": ["string"],
        "transportFares": { "autoBase": 25, "autoPerKm": 15, "taxiBase": 100, "taxiPerKm": 25 }
      }
      
      Return ONLY the JSON object. No extra text.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      let data = JSON.parse(response.text || "{}");

      // CLEANUP & SANITIZATION to prevent frontend crashes
      data.shops = (data.shops || []).map((s: any) => ({
        ...s,
        rating: Number(s.rating) || 4.0,
        location: Array.isArray(s.location) ? s.location : [20, 78], // Default to center of India if missing
        priceRange: ['low', 'medium', 'high'].includes(s.priceRange) ? s.priceRange : 'medium'
      }));

      data.famousPoints = (data.famousPoints || []).map((p: any) => ({
        ...p,
        location: Array.isArray(p.location) ? p.location : [20, 78]
      }));

      // Ensure transportFares are numbers
      if (data.transportFares) {
        data.transportFares.autoBase = Number(data.transportFares.autoBase) || 25;
        data.transportFares.autoPerKm = Number(data.transportFares.autoPerKm) || 15;
        data.transportFares.taxiBase = Number(data.transportFares.taxiBase) || 100;
        data.transportFares.taxiPerKm = Number(data.transportFares.taxiPerKm) || 25;
      } else {
        data.transportFares = { autoBase: 25, autoPerKm: 15, taxiBase: 100, taxiPerKm: 25 };
      }

      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "AI failed to format intelligence" });
    }
  });

  app.post("/api/search", async (req, res) => {
    try {
      const { city, query, userProfile } = req.body;
      const prompt = `Provide 3-5 specific locations for "${query}" in ${city} for ${userProfile?.name}. Return JSON array of objects.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text || "[]"));
    } catch (e) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, city, userProfile } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: { systemInstruction: `You are a local guide for ${city}. User is ${userProfile?.name}.` }
      });
      res.json({ reply: response.text });
    } catch (e) {
      res.status(500).json({ reply: "Guide unavailable" });
    }
  });

  // ==========================
  // FRONTEND
  // ==========================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
