const express = require("express");
const User = require("../models/User");
const router = express.Router();
// 假设你用了 nodemailer 来发邮件，这里按你实际的工具来引入
// const nodemailer = require("nodemailer");

// 🆕 临时内存账本：用来存邮箱和验证码的对应关系（格式：{ "email@xxx.com": { code: "123456", expires: 时间戳 } }）
const otpStore = {};

// ==========================================
// 1. 发送验证码接口 (F12 绝对看不到码)
// ==========================================
router.post("/send-code", async (req, res) => {
    try {
        const { username } = req.body; // 假设你的 username 就是邮箱，或者加个 email 字段
        if (!username) {
            return res.status(400).json({ message: "Email/Username is required" });
        }

        // 生成 6 位随机数字
        const code = Math.floor(100000 + Math.random() * 900000).toString();
       
        // 存入账本，设置 5 分钟过期
        otpStore[username] = {
            code: code,
            expires: Date.now() + 5 * 60 * 1000
        };

        // 🚀 【这里写你真正的发邮件逻辑】
        // await transporter.sendMail({ from: ..., to: username, subject: "验证码", text: `你的验证码是 ${code}` });
       
        // 打印在控制台方便你测试，绝对不要把 code 放到下面的 json 里！
        console.log(`[Server] 验证码已发送给 ${username} : ${code}`);

        return res.status(200).json({ message: "Verification code sent successfully!" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to send code" });
    }
});

// ==========================================
// 2. 注册接口 (带验证码校验 + 默认待审批)
// ==========================================
router.post("/register", async (req, res) => {
    try {
        const { username, password, code } = req.body; // 👈 接收前端传来的验证码
       
        if (!username || !password || !code) {
            return res.status(400).json({ message: "Missing fields" });
        }
       
        // 🔍 校验验证码
        const record = otpStore[username];
        if (!record) {
            return res.status(400).json({ message: "Please request a verification code first." });
        }
        if (Date.now() > record.expires) {
            delete otpStore[username]; // 过期删除
            return res.status(400).json({ message: "Verification code expired." });
        }
        if (record.code !== code) {
            return res.status(400).json({ message: "Invalid verification code." });
        }

        // 验证码通过后，把账本里的记录删掉，防止重复二次利用
        delete otpStore[username];

        // 🔍 检查用户是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username/Email already exists." });
        }
       
        // 🆕 创建用户（状态默认是 status: "pending"，等管理员批）
        await User.create({ username, password });
       
        return res.status(201).json({
            message: "Registration submitted! Waiting for admin approval."
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});

// ==========================================
// 3. 登录接口 (门禁拦截，非 approved 无法登录)
// ==========================================
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
       
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
       
        // 🆕 门禁拦截状态
        if (user.status === "pending") {
            return res.status(403).json({ message: "Your account is pending admin approval." });
        }
        if (user.status === "rejected") {
            return res.status(403).json({ message: "Your registration request was rejected." });
        }
       
        // 只有批准的用户才能登录成功
        return res.status(200).json({
            message: "Login successful",
            user: { id: user._id, username: user.username, status: user.status }
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});

// ==========================================
// 4. 管理员审批接口
// ==========================================
router.post("/admin/approve", async (req, res) => {
    try {
        const { userId, action } = req.body;
        if (!["approved", "rejected"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status: action },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({ message: `User status updated to ${action}`, user });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
