import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const Signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await db.query(
            "SELECT * FROM user1 WHERE email = $1",
            [email]
        );
        if (user.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.query(
            "INSERT INTO user1 (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );
        const createdUser = newUser.rows[0];
        const token = jwt.sign(
            { id: createdUser.id },
            "secretkey", // ⚠️ use env in production
            { expiresIn: "1h" }
        );
        res.status(201).json({
            message: "User created successfully",
            token,
            user: createdUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Validation
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Check user
        const result = await db.query(
            "SELECT * FROM user1 WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];

        // ✅ Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔥 Generate Token
        const token = jwt.sign(
            { id: user.id },
            "secretkey", // use env in production
            { expiresIn: "1h" }
        );

        // ✅ Response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const Logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};