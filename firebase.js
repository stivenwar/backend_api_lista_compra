const admin = require("firebase-admin");

const key = require("./lista-compra-8fe84-firebase-adminsdk-fbsvc-d4740ab62d.json")

if (key.private_key) {
    key.private_key = key.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
    credential: admin.credential.cert(key),
});
module.exports = admin.firestore();