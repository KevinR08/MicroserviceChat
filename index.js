//Entranamiendo de las api
const express = require('express');
const { json } = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, updateDoc, collection, query, limit, getDocs, where, getDoc, addDoc, doc, deleteDoc } = require('firebase/firestore');
const { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const multer = require('multer');
const { memoryStorage } = require('multer');
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");
const isAuthenticated =require('./firebaseAuthentication')
const firebaseConfig =require('./firebaseConfig')
require('dotenv').config()
const { v4 } = require('uuid');
const app = express()
app.use(express.json())
app.use(cors());


// Conexión a Firebase
const appFirebase = initializeApp(firebaseConfig)
const auth = getAuth(appFirebase)
const db = getFirestore(appFirebase)
const firebaseStorage = getStorage(appFirebase)
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const admin = require('firebase-admin');
async function getUserEmailFromID(userID) {
  try {
    const userRecord = await admin.auth().getUser(userID);
    const userEmail = userRecord.email;
    return userEmail;
  } catch (error) {
    console.error('Error al obtener el correo electrónico del usuario:', error);
    return null;
  }
}
/************ */
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cookie = require('cookie');

wss.on('connection', async (ws, req) => {
  // Parsea las cookies del encabezado
  const cookies = cookie.parse(req.headers.cookie || '');
  const authData = cookies.authData ? JSON.parse(cookies.authData) : {};
  const userEmail = await getUserEmailFromID(authData.userID) ;
  ws.send(JSON.stringify({ user: userEmail }));

  ws.on('message', (message) => {
    // Combina el email del usuario y el mensaje recibido
    const messageWithUserEmail = `${userEmail}: ${message}`;

    console.log(messageWithUserEmail);

    // Envía el mensaje a todos los clientes conectados
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(messageWithUserEmail);
      }
    });
  });
});


server.listen(4000, () => {
    console.log('Servidor WebSocket en ejecución en el puerto 4000');
  });