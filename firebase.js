var admin = require("firebase-admin");

var serviceAccount = require("./lista-compra-8fe84-firebase-adminsdk-fbsvc-d4740ab62d.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin.firestore();