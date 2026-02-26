import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cors from "cors"
import pkg from "pg"

const { Pool } = pkg
const app = express()

app.use(express.json())
app.use(cors())

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "carechain",
  password: "",       // ← put your postgres password if you set one
  port: 5432
})

// SIGN UP
app.post("/signup", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" })

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    )
    res.json({ message: "Signup successful" })
  } catch (err) {
    res.status(400).json({ error: "User already exists" })
  }
})

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password, remember } = req.body

  const result = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  )

  if (result.rows.length === 0)
    return res.status(401).json({ error: "User not found" })

  const user = result.rows[0]
  const valid = await bcrypt.compare(password, user.password)

  if (!valid)
    return res.status(401).json({ error: "Wrong password" })

  const token = jwt.sign(
    { id: user.id },
    "secretkey",
    { expiresIn: remember ? "7d" : "1h" }
  )

  res.json({ message: "Login success", token })
})

// START SERVER
app.listen(4000, () =>
  console.log("Backend running at http://localhost:4000")
)