const admin = require('firebase-admin');

/**
 * Middleware untuk verifikasi ID token Firebase yang dikirim dari client.
 * Jika valid, decoded token akan ditambahkan ke req.user dan lanjut ke route berikutnya.
 * Jika tidak valid, akan mengembalikan status 401 Unauthorized.
 */
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Cek apakah Authorization header ada dan formatnya benar
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan di header Authorization' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken || typeof idToken !== 'string' || idToken.length < 10) {
    return res.status(400).json({ error: 'Format token tidak valid' });
  }

  try {
    // Verifikasi token dengan Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Simpan data user yang sudah diverifikasi ke request
    req.user = decodedToken;

    next(); // Lanjut ke middleware atau handler berikutnya
  } catch (error) {
    console.error('🔥 Gagal verifikasi token:', error.message);
    return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa' });
  }
};

module.exports = authenticateUser;
