// src/routes/auth.routes.ts
import { Router } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    // 🆕 baca address & phone juga
    const { fullName, email, password, address, phone } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Full name, email and password are required' });
    }

    const { user, token } = await registerUser(
      fullName,
      email,
      password,
      address,
      phone
    );

    // kalau kamu mau kirim kembali address & phone plaintext:
    const contact = user.getContactInfo();

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        address: contact?.address ?? null,
        phone: contact?.phone ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const { user, token } = await loginUser(email, password);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
