import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("digigold.db");
const JWT_SECRET = "digigold-secret-key-12345";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    wallet_balance REAL DEFAULT 10000.0,
    gold_balance REAL DEFAULT 0.0
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    amount REAL,
    gold_quantity REAL,
    price_per_gram REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      stmt.run(username, email, hashedPassword);
      res.json({ success: true, message: "User created successfully" });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ success: false, message: "Username or email already exists" });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ success: true, token, user: { username: user.username, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  app.get("/api/user/profile", authenticateToken, (req: any, res) => {
    const user: any = db.prepare("SELECT username, email, wallet_balance, gold_balance FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.post("/api/gold/buy", authenticateToken, (req: any, res) => {
    const { amount, goldQuantity, pricePerGram } = req.body;
    const user: any = db.prepare("SELECT wallet_balance, gold_balance FROM users WHERE id = ?").get(req.user.id);

    if (user.wallet_balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const newWalletBalance = user.wallet_balance - amount;
    const newGoldBalance = user.gold_balance + goldQuantity;

    const updateStmt = db.prepare("UPDATE users SET wallet_balance = ?, gold_balance = ? WHERE id = ?");
    const transStmt = db.prepare("INSERT INTO transactions (user_id, type, amount, gold_quantity, price_per_gram) VALUES (?, 'BUY', ?, ?, ?)");

    const transaction = db.transaction(() => {
      updateStmt.run(newWalletBalance, newGoldBalance, req.user.id);
      transStmt.run(req.user.id, amount, goldQuantity, pricePerGram);
    });

    transaction();
    res.json({ success: true, wallet_balance: newWalletBalance, gold_balance: newGoldBalance });
  });

  app.post("/api/gold/sell", authenticateToken, (req: any, res) => {
    const { amount, goldQuantity, pricePerGram } = req.body;
    const user: any = db.prepare("SELECT wallet_balance, gold_balance FROM users WHERE id = ?").get(req.user.id);

    if (user.gold_balance < goldQuantity) {
      return res.status(400).json({ success: false, message: "Insufficient gold balance" });
    }

    const newWalletBalance = user.wallet_balance + amount;
    const newGoldBalance = user.gold_balance - goldQuantity;

    const updateStmt = db.prepare("UPDATE users SET wallet_balance = ?, gold_balance = ? WHERE id = ?");
    const transStmt = db.prepare("INSERT INTO transactions (user_id, type, amount, gold_quantity, price_per_gram) VALUES (?, 'SELL', ?, ?, ?)");

    const transaction = db.transaction(() => {
      updateStmt.run(newWalletBalance, newGoldBalance, req.user.id);
      transStmt.run(req.user.id, amount, goldQuantity, pricePerGram);
    });

    transaction();
    res.json({ success: true, wallet_balance: newWalletBalance, gold_balance: newGoldBalance });
  });

  app.get("/api/transactions", authenticateToken, (req: any, res) => {
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10").all(req.user.id);
    res.json(transactions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
