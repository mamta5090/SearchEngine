import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const Signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [rows] = await db.execute(
            "SELECT * FROM user1 WHERE email = ?",
            [email]
        );

        if (rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            "INSERT INTO user1 (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        const token = jwt.sign(
            { id: result.insertId },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: result.insertId,
                name,
                email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute(
            "SELECT * FROM user1 WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user
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