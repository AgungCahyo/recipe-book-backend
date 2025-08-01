// backend/controllers/usersController.js

const db = require("../firebase/firebase");

// Register new user
const createUser = async (req, res) => {
  const { uid, email, name } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "uid dan email wajib diisi" });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.set({
      email,
      name: name || "",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "User berhasil dibuat", uid });
  } catch (error) {
    console.error("🔥 Error saat membuat user:", error);
    res.status(500).json({ error: "Gagal membuat user" });
  }
};

//  Get user by UID
const getUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("🔥 Error saat mengambil user:", error);
    res.status(500).json({ error: "Gagal mengambil user" });
  }
};

//  Delete user by UID
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await db.collection("users").doc(userId).delete();
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("🔥 Error saat menghapus user:", error);
    res.status(500).json({ error: "Gagal menghapus user" });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  try {
    const userRef = db.collection("users").doc(userId);
    await userRef.update(updateData);
    res.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    console.error("🔥 Error saat update user:", error);
    res.status(500).json({ error: "Gagal update user" });
  }
};

const getProfile = async (req, res) => {
  const userId = req.user.uid;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Profil user tidak ditemukan" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("🔥 Error saat ambil profil:", error);
    res.status(500).json({ error: "Gagal ambil profil user" });
  }
};


module.exports = {
  createUser,
  getUser,
  deleteUser,
  getProfile,
  updateUser
};
