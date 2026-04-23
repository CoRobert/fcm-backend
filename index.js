console.log("ENV CHECK:", !!process.env.FIREBASE_SERVICE_ACCOUNT);

const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// 🔐 Carga tu JSON de service account (descargado de Google Cloud)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔔 Endpoint para enviar notificación
app.post('/send-notification', async (req, res) => {
  try {
    const { title, body, topic, token } = req.body;

    const message = {
      notification: {
        title: title || 'Sin título',
        body: body || 'Sin mensaje',
      },
    };

    if (topic) {
      message.topic = topic;
    } else if (token) {
      message.token = token;
    } else {
      return res.status(400).json({ error: 'Debes enviar topic o token' });
    }

    const response = await admin.messaging().send(message);

    res.json({
      ok: true,
      messageId: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en http://localhost:${PORT}`);
});