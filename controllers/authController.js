
const db = require('../firebase/firebase');

const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) return res.status(400).json({ error: 'ID Token is required' });

    // Verifikasi token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email, picture } = decodedToken;

    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      // Simpan user baru
      await userRef.set({
        uid,
        name,
        email,
        photo: picture,
        createdAt: new Date()
      });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { uid, name, email, photo: picture }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ error: 'Invalid ID Token' });
  }
};

module.exports = { loginWithGoogle };
