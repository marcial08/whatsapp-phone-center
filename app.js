const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const functions = require('firebase-functions');
const cors = require('cors');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const natural = require('natural');
const stringSimilarity = require('string-similarity');
const { Configuration, OpenAIApi } = require('openai');
const serviceAccount = require('./august-monolith-330002-a048ee37daa2.json');
const configuration = new Configuration({
  apiKey: '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'
});
const openai = new OpenAIApi(configuration);
//const appp = initializeApp(firebaseConfig);
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const url_ = 'https://api-phone-center.onrender.com/api/message/mensageWhatsapp';


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(cors({ origin: true }));

app.get('/holamundo', (req, res) => {
  return res.status(200).send('Hola mundo, soy el primer endpoint');
});
exports.app = functions.https.onRequest(app);
/**
 * BASED ON MANY QUESTIONS
 * Actually ready mentioned on the tutorials
 * 
 * Many people confused about the warning for file-upload
 * So, we just disabling the debug for simplicity.
 */
app.use(fileUpload({
  debug: false
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  authStrategy: new LocalAuth()
});

const productsList = {
  "manzanas": 1.5,
  "naranjas": 2,
  "bananas": 0.5,
  "peras": 1,
  "uvas": 3
};
// Función para buscar el precio de un producto en la lista de precios
function getProductPrice(productName, productList) {
  const price = productList[productName];
  if (price !== undefined) {
    return price;
  } else {
    return null;
  }
}

// Función para generar respuestas de ChatGPT
function generateBotResponse(userQuery, productsList) {

  const doc = nlp(userQuery);
  console.log("YA BODY 2");
  const productEntities = doc.ents.filter(ent => ent.label_ === 'PRODUCT_NAME');
  const productName = productEntities.length > 0 ? productEntities[0].text.toLowerCase() : '';
  const productPrice = getProductPrice(productName, productsList);

  if (userQuery.toLowerCase().includes('precio') && productPrice !== null) {
    return `El precio de ${productName} es ${productPrice}.`;
  } else {
    return `Lo siento, no tenemos ${productName} disponible en este momento. ¿Te gustaría buscar otro producto?`;
  }
}
products_ = [
  // INICIO DE CARGDO DE DATOS  //
  // { id: 1, name: "	BANDEJA SIM Huawei Mate 20 lite (ORIGINAL)	", price: 15 },
  // { id: 2, name: "	BANDEJA SIM Huawei y6 2018 (ORIGINAL)	", price: 15 },
  // { id: 3, name: "	BANDEJA SIM Huawei y6 2019 (ORIGINAL)	", price: 15 },
  // { id: 4, name: "	BANDEJA SIM Huawei y9 2019 (ORIGINAL)	", price: 15 },
  // { id: 5, name: "	BANDEJA SIM Huawei y9 Prime (ORIGINAL)	", price: 15 },
  // { id: 6, name: "	BANDEJA SIM Samsung A01 Core (ORIGINAL)	", price: 15 },
  // { id: 7, name: "	BANDEJA SIM Samsung A02 Core (ORIGINAL)	", price: 15 },
  // { id: 8, name: "	BANDEJA SIM Samsung A11 (ORIGINAL)	", price: 15 },
  // { id: 9, name: "	BANDEJA SIM Samsung A20 (ORIGINAL)	", price: 15 },
  // { id: 10, name: "	BANDEJA SIM Samsung A21s (ORIGINAL)	", price: 15 },
  // { id: 11, name: "	BANDEJA SIM Samsung A22 (ORIGINAL)	", price: 15 },
  // { id: 12, name: "	BANDEJA SIM Samsung A31 (ORIGINAL)	", price: 15 },
  // { id: 13, name: "	BANDEJA SIM Samsung A32 (ORIGINAL)	", price: 15 },
  // { id: 14, name: "	BANDEJA SIM Samsung A40 (ORIGINAL)	", price: 15 },
  // { id: 15, name: "	BANDEJA SIM Samsung A5 / A7 2017 (ORIGINAL)	", price: 15 },
  // { id: 16, name: "	BANDEJA SIM Samsung A51 (ORIGINAL)	", price: 15 },
  // { id: 17, name: "	BANDEJA SIM Samsung A52 (ORIGINAL)	", price: 15 },
  // { id: 18, name: "	BANDEJA SIM Samsung A60 (ORIGINAL)	", price: 15 },
  // { id: 19, name: "	BANDEJA SIM Samsung A7 2018 (ORIGINAL)	", price: 15 },
  // { id: 20, name: "	BANDEJA SIM Samsung A70 (ORIGINAL)	", price: 15 },
  // { id: 21, name: "	BANDEJA SIM Samsung A72  (ORIGINAL)	", price: 15 },
  // { id: 22, name: "	BANDEJA SIM Samsung A8 (ORIGINAL)	", price: 15 },
  // { id: 23, name: "	BANDEJA SIM Samsung A8 Plus	", price: 15 },
  // { id: 24, name: "	BANDEJA SIM Samsung A9 (ORIGINAL)	", price: 15 },
  // { id: 25, name: "	BANDEJA SIM Samsung A9 2018 (ORIGINAL)	", price: 15 },
  // { id: 26, name: "	BANDEJA SIM Spark 6 (ORIGINAL)	", price: 15 },
  // { id: 27, name: "	BANDEJA SIM Spark 6 Go (ORIGINAL)	", price: 15 },
  // { id: 28, name: "	BANDEJA SIM Tecno Camon 15 (ORIGINAL)	", price: 15 },
  // { id: 29, name: "	BANDEJA SIM Tecno Camon 16 (ORIGINAL)	", price: 15 },
  // { id: 30, name: "	BANDEJA SIM Tecno Camon 16 Pro (ORIGINAL)	", price: 15 },
  // { id: 31, name: "	BANDEJA SIM Tecno Camon 17 (ORIGINAL)	", price: 15 },
  // { id: 32, name: "	BANDEJA SIM Tecno Camon 17 Pro (ORIGINAL)	", price: 15 },
  // { id: 33, name: "	BANDEJA SIM Tecno POVA (ORIGINAL)	", price: 15 },
  // { id: 34, name: "	BANDEJA SIM Xiaomi Poco M3 (ORIGINAL)	", price: 15 },
  // { id: 35, name: "	BATERIA Honor Honor 10 || (ORIGINAL)	", price: 75 },
  // { id: 36, name: "	BATERIA Honor Honor 10 lite || Huawei P Smart 2019/ Honor 10 Lite/Honor 20 Lite (ORIGINAL)	", price: 70 },
  // { id: 37, name: "	BATERIA Honor Honor 7A || (ORIGINAL)	", price: 75 },
  // { id: 38, name: "	BATERIA Honor Honor 7S || (ORIGINAL)	", price: 75 },
  // { id: 39, name: "	BATERIA Honor Honor 8A || Batería Para Huawei Y6s/ Honor 8a (ORIGINAL)	", price: 75 },
  // { id: 40, name: "	BATERIA Honor Honor 8S || Huawei Honor 6A/ Honor 8A/ Honor 8s (ORIGINAL)	", price: 75 },
  // { id: 41, name: "	BATERIA Honor Honor 8X || Huawei Honor 8X/Honor View 10 Lite y9 2019 (ORIGINAL)	", price: 70 },
  // { id: 42, name: "	BATERIA Honor Honor 9 || Huawei P10 / Honor 9 (ORIGINAL)	", price: 75 },
  // { id: 43, name: "	BATERIA Honor Honor 9 lite || Huawei P9/P9 LITE/P10 Lite/P8 Lite 2017/P20 Lite/Y6 2018/Y7 2018/P Smart/Honor 8 Lite/Honor 9/Honor 9 Lite/Honor 5C 7C 7A/Nova Lite (ORIGINAL)	", price: 75 },
  // { id: 44, name: "	BATERIA Huawei G Play mini || (ORIGINAL)	", price: 75 },
  // { id: 45, name: "	BATERIA Huawei mate 10 lite || Bateria Huawei Mate10 Lite/Nova Plus2/ P30 Lite Original Caja (ORIGINAL)	", price: 70 },
  // { id: 46, name: "	BATERIA Huawei mate 10 pro || Mate 10 Pro/ Mate 20 Pro/ P20 Pro/ Honor View 20 (ORIGINAL)	", price: 75 },
  // { id: 47, name: "	BATERIA Huawei mate 30 || Huawei Honor V30/ P40 LITE/ Mate 30 (ORIGINAL)	", price: 75 },
  // { id: 48, name: "	BATERIA Huawei Mate 7 || (ORIGINAL)	", price: 75 },
  // { id: 49, name: "	BATERIA Huawei Mate 8 || (ORIGINAL)	", price: 65 },
  // { id: 50, name: "	BATERIA Huawei mate 9 || Bateria Huawei Mate 9 / Mate 9 Pro / Gw Metal / Y7 Prime (ORIGINAL)	", price: 75 },
  // { id: 51, name: "	BATERIA Huawei mate 9 pro || (ORIGINAL)	", price: 75 },
  // { id: 52, name: "	BATERIA Huawei nova 2 || (ORIGINAL)	", price: 75 },
  // { id: 53, name: "	BATERIA Huawei nova 3 || Huawei Mate 20 Lite /P10 Plus/ Nova 3 (ORIGINAL)	", price: 75 },
  // { id: 54, name: "	BATERIA Huawei nova 5T || Nova 5t /Honor 20/mate 20 Lite /nova3 (ORIGINAL)	", price: 70 },
  // { id: 55, name: "	BATERIA Huawei nova plus || Huawei Nova Plus / G9 Plus / Honor 6X (ORIGINAL)	", price: 75 },
  // { id: 56, name: "	BATERIA Huawei P smart 2019 || Huawei P Smart 2019 / Honor 10 Lite/Honor 20i / (ORIGINAL)	", price: 65 },
  // { id: 57, name: "	BATERIA Huawei P10 || Huawei P10 / Honor 9/ (ORIGINAL)	", price: 75 },
  // { id: 58, name: "	BATERIA Huawei P10 lite || (ORIGINAL)	", price: 65 },
  // { id: 59, name: "	BATERIA Huawei P20 || (ORIGINAL)	", price: 75 },
  // { id: 60, name: "	BATERIA Huawei P20 lite || P20 Lite/P9/P9 Lite/P10 Lite/P8 Lite 2017 (ORIGINAL)	", price: 65 },
  // { id: 61, name: "	BATERIA Huawei P20 Smart || (ORIGINAL)	", price: 75 },
  // { id: 62, name: "	BATERIA Huawei P30 lite || P30 Lite/Honor 7X 9i/Mate 9 Lite/Nova 2 Plus/Nova 4E/Nova 2S/Mate SE (ORIGINAL)	", price: 70 },
  // { id: 63, name: "	BATERIA Huawei P30 pro || P30 Pro/ Mate 20 Pro (ORIGINAL)	", price: 85 },
  // { id: 64, name: "	BATERIA Huawei P8 || (ORIGINAL)	", price: 75 },
  // { id: 65, name: "	BATERIA Huawei P8 lite || (ORIGINAL)	", price: 75 },
  // { id: 66, name: "	BATERIA Huawei P9 || P9/P9 LITE/P10 Lite/P8 Lite 2017/P20 Lite/Y6 2018/Y7 2018/P Smart/Honor 8 Lite/Honor 9/Honor 9 Lite/Honor 5C 7C 7A/Nova Lite (ORIGINAL)	", price: 65 },
  // { id: 67, name: "	BATERIA Huawei P9 Lite || Huawei P9 Lite/ P8 Lite 2017/ Huawei P9/ 2017/ Huawei P10 Lite/ Huawei P20 Lite/ Honor 5C/ Honor 7 Lite/ Honor 8/ Lite/ Huawei G9 Lite/ Huawei Nova 3e/ Huawei Nova Lite/ (ORIGINAL)	", price: 65 },
  // { id: 68, name: "	BATERIA Huawei P9 Plus || (ORIGINAL)	", price: 75 },
  // { id: 69, name: "	BATERIA Huawei P9 smart || (ORIGINAL)	", price: 75 },
  // { id: 70, name: "	BATERIA Huawei Y5P || Huawei Y5 2017/ Y5 2018/ Y5 2019/ Y6 2019/ Y5p (ORIGINAL)	", price: 75 },
  // { id: 71, name: "	BATERIA Huawei Y6 2019 || Y6-2019/Nova lite/ Y5-2018/ Y5-2017/ Y5 lite 2017 (ORIGINAL)	", price: 75 },
  // { id: 72, name: "	BATERIA Huawei Y6 pro || Y6 Pro / Honor 4c / Enjoy 5 (ORIGINAL)	", price: 75 },
  // { id: 73, name: "	BATERIA Huawei Y6P || Huawei Honor 9A/ Y6p (ORIGINAL)	", price: 75 },
  // { id: 74, name: "	BATERIA Huawei Y7 2018 || (ORIGINAL)	", price: 75 },
  // { id: 75, name: "	BATERIA Huawei Y7 2019 || Y7 2019/Y9 2019/Honor 8C (ORIGINAL)	", price: 70 },
  // { id: 76, name: "	BATERIA Huawei Y7 Prime || Y7 2019 Original / Y7 Prime/ Y9 2018 (ORIGINAL)	", price: 75 },
  // { id: 77, name: "	BATERIA Huawei Y7A || (ORIGINAL)	", price: 75 },
  // { id: 78, name: "	BATERIA Huawei Y9 2018 || Y9 2018/ Y7 2017/ Y7 Prime/ Y7 2019/ Y7 Pro 2019/ Y9 Pro 2018/ Y9 2019/ Y9 Prime 2019/ Enjoy 7 Plus/ (ORIGINAL)	", price: 70 },
  // { id: 79, name: "	BATERIA Huawei Y9 2019 || Y7 2019/Y9 2019/Honor 8C (ORIGINAL)	", price: 75 },
  // { id: 80, name: "	BATERIA Huawei Y9 prime 2019 || Y9 Prime 2019 / Y9s / Honor 9x / Y9p/ y9 2019 (ORIGINAL)	", price: 80 },
  // { id: 81, name: "	BATERIA Huawei Y9A || (ORIGINAL)	", price: 75 },
  // { id: 82, name: "	BATERIA Huawei Y9S || Huawei Y9 Prime 2019 / Y9s / Honor 9x / Y9p (ORIGINAL)	", price: 75 },
  // { id: 83, name: "	BATERIA Iphone Iphone 6 || (ORIGINAL)	", price: 75 },
  // { id: 84, name: "	BATERIA Redmi mi 9 || Xiaomi 9 / MI9 / M9 / MI 9 (ORIGINAL)	", price: 75 },
  // { id: 85, name: "	BATERIA Redmi mi 9 pro || revisar el modelo (ORIGINAL)	", price: 75 },
  // { id: 86, name: "	BATERIA Redmi mi mix3 || (ORIGINAL)	", price: 75 },
  // { id: 87, name: "	BATERIA Redmi Note 8 (ORIGINAL)	", price: 85 },
  // { id: 88, name: "	BATERIA Redmi Redmi 6 || Xiaomi Redmi 6 / 6a (ORIGINAL)	", price: 75 },
  // { id: 89, name: "	BATERIA Redmi Redmi 7A || (ORIGINAL)	", price: 75 },
  // { id: 90, name: "	BATERIA Redmi Redmi Mi X2 || (ORIGINAL)	", price: 75 },
  // { id: 91, name: "	BATERIA Redmi Redmi Note 5A || Bateria Xiaomi Redmi Note 5a/s2/5x/mi A1 (ORIGINAL)	", price: 75 },
  // { id: 92, name: "	BATERIA Redmi Redmi Note 5A Prime || Xiaomi Mi A1 / Note 5A / Note 5A Prime/Redmi S2 / Redmi Y1 /Y1 Lite/Mi A1 / Mi 5X (ORIGINAL)	", price: 75 },
  // { id: 93, name: "	BATERIA Samsung Galaxy A02 || Samsung A21S-A12-A02 (ORIGINAL)	", price: 75 },
  // { id: 94, name: "	BATERIA Samsung Galaxy A02s || (ORIGINAL)	", price: 75 },
  // { id: 95, name: "	BATERIA Samsung Galaxy A12 || (ORIGINAL)	", price: 75 },
  // { id: 96, name: "	BATERIA Samsung Galaxy A20 || Samsung Galaxy A20 / A30 / A50 (ORIGINAL)	", price: 75 },
  // { id: 97, name: "	BATERIA Samsung Galaxy A20s || Samsung GALAXY A10S / A11 / A20S / A21 (ORIGINAL)	", price: 75 },
  // { id: 98, name: "	BATERIA Samsung Galaxy A21s || Samsung A21S-A12-A02 (ORIGINAL)	", price: 75 },
  // { id: 99, name: "	BATERIA Samsung Galaxy A30 || Samsung Galaxy A20 / A30 / A50 (ORIGINAL)	", price: 75 },
  // { id: 100, name: "	BATERIA Samsung Galaxy A30s || Samsung A20/ A30/ A30s/ A50 (ORIGINAL)	", price: 75 },
  // { id: 101, name: "	BATERIA Samsung Galaxy A32 || (ORIGINAL)	", price: 75 },
  // { id: 102, name: "	BATERIA Samsung Galaxy A5 || (ORIGINAL)	", price: 75 },
  // { id: 103, name: "	BATERIA Samsung Galaxy A50s || (ORIGINAL)	", price: 75 },
  // { id: 104, name: "	BATERIA Samsung Galaxy A51 || (ORIGINAL)	", price: 75 },
  // { id: 105, name: "	BATERIA Samsung Galaxy A7 2015 || (ORIGINAL)	", price: 75 },
  // { id: 106, name: "	BATERIA Samsung Galaxy A7 2016 || (ORIGINAL)	", price: 75 },
  // { id: 107, name: "	BATERIA Samsung Galaxy A7 2018 || Samsung Galaxy A10 A7 2018 (ORIGINAL)	", price: 75 },
  // { id: 108, name: "	BATERIA Samsung Galaxy A70 || (ORIGINAL)	", price: 75 },
  // { id: 109, name: "	BATERIA Samsung Galaxy A70s || (ORIGINAL)	", price: 75 },
  // { id: 110, name: "	BATERIA Samsung Galaxy A71 || (ORIGINAL)	", price: 75 },
  // { id: 111, name: "	BATERIA Samsung Galaxy S10 || (ORIGINAL)	", price: 75 },
  // { id: 112, name: "	BATERIA Samsung Galaxy S8 Plus || (ORIGINAL)	", price: 75 },
  // { id: 113, name: "	BATERIA Samsung Galaxy S9 || (ORIGINAL)	", price: 75 },
  // { id: 114, name: "	BATERIA Samsung note 10 || (ORIGINAL)	", price: 75 },
  // { id: 115, name: "	BATERIA Samsung note 10 + || (ORIGINAL)	", price: 75 },
  // { id: 116, name: "	BATERIA Samsung note 10 lite || (ORIGINAL)	", price: 75 },
  // { id: 117, name: "	BATERIA Samsung note 8 || (ORIGINAL)	", price: 75 },
  // { id: 118, name: "	BATERIA Samsung note 9 || (ORIGINAL)	", price: 75 },
  // { id: 119, name: "	BATERIA Sony Sony z2 || (ORIGINAL)	", price: 75 },
  // { id: 120, name: "	BATERIA Sony Sony z3 || (ORIGINAL)	", price: 75 },
  // { id: 121, name: "	BATERIA Sony Sony z5 || (ORIGINAL)	", price: 75 },
  // { id: 122, name: "	BATERIA Sony xa Ultra || (ORIGINAL)	", price: 75 },
  // { id: 123, name: "	BATERIA Sony xa1 Ultra || (ORIGINAL)	", price: 75 },
  // { id: 124, name: "	BATERIA Sony xa2 Ultra || (ORIGINAL)	", price: 75 },
  // { id: 125, name: "	BATERIA Sony Z5 Premium (ORIGINAL)	", price: 70 },
  // { id: 126, name: "	BATERIA Xiaomi mi 10 lite || (ORIGINAL)	", price: 75 },
  // { id: 127, name: "	BATERIA Xiaomi mi 10 pro || (ORIGINAL)	", price: 75 },
  // { id: 128, name: "	BATERIA Xiaomi mi 8 || (ORIGINAL)	", price: 75 },
  // { id: 129, name: "	BATERIA Xiaomi mi 8 pro || (ORIGINAL)	", price: 75 },
  // { id: 130, name: "	BATERIA Xiaomi mi 9 lite || Xiaomi CC9 / Mi 9 Lite (ORIGINAL)	", price: 75 },
  // { id: 131, name: "	BATERIA Xiaomi mi A1 || Xiaomi Mi A1/ Mi 5X/Redmi Note 5A (ORIGINAL)	", price: 75 },
  // { id: 132, name: "	BATERIA Xiaomi mi A2 Lite || Xiaomi A2 Lite/ Redmi 6 Pro/ mi 6X (ORIGINAL)	", price: 75 },
  // { id: 133, name: "	BATERIA Xiaomi mi A3 Lite || (ORIGINAL)	", price: 75 },
  // { id: 134, name: "	BATERIA Xiaomi mi max2 || (ORIGINAL)	", price: 75 },
  // { id: 135, name: "	BATERIA Xiaomi MI Mix 2 || (ORIGINAL)	", price: 75 },
  // { id: 136, name: "	BATERIA Xiaomi Redmi 6A || Redmi 6/ Redmi 6A (ORIGINAL)	", price: 75 },
  // { id: 137, name: "	BATERIA Xiaomi Redmi 9 || Xiaomi Redmi 9/ Redmi Note 9 (ORIGINAL)	", price: 75 },
  // { id: 138, name: "	BATERIA Xiaomi Redmi 9A || Xiaomi Redmi 9A/ Redmi 9C (ORIGINAL)	", price: 75 },
  // { id: 139, name: "	BATERIA Xiaomi Redmi 9s (creo que es Redmi note 9s) || revisar (ORIGINAL)	", price: 75 },
  // { id: 140, name: "	BATERIA Xiaomi Redmi Note 3 || Redmi Note 3/ Note 3 Pro (ORIGINAL)	", price: 75 },
  // { id: 141, name: "	BATERIA Xiaomi Redmi Note 3 Pro || Redmi Note 3/ Note 3 Pro (ORIGINAL)	", price: 75 },
  // { id: 142, name: "	BATERIA Xiaomi Redmi Note 8 Pro || XIAOM MI / Xiaomi MI MIX 2 / MIX 2S/ note 8 (ORIGINAL)	", price: 75 },
  // { id: 143, name: "	CAMBIO BATERIA (CAMBIO BATERIA)	", price: 20 },
  // { id: 144, name: "	CAMBIO PANTALLA (CAMBIO PANTALLA)	", price: 20 },
  // { id: 145, name: "	CAMBIO VISOR 	", price: 10 },
  // { id: 146, name: "	FLEX MAIN BOARD	", price: 30 },
  // { id: 147, name: "	FLEX MAIN BOARD Hawei Mate 10 Lite (ORIGINAL)	", price: 20 },
  // { id: 148, name: "	FLEX MAIN BOARD Huawei Huawei Mate 30 (ORIGINAL)	", price: 20 },
  // { id: 149, name: "	FLEX MAIN BOARD Huawei Huawei Y7 Prime (ORIGINAL)	", price: 20 },
  // { id: 150, name: "	FLEX MAIN BOARD Huawei Y9 2019 (ORIGINAL)	", price: 25 },
  // { id: 151, name: "	FLEX MAIN BOARD Huawei Y9 Prime (ORIGINAL)	", price: 25 },
  // { id: 152, name: "	FLEX MAIN BOARD Redmi 4 (ORIGINAL)	", price: 15 },
  // { id: 153, name: "	FLEX MAIN BOARD Redmi 5 Plus (ORIGINAL)	", price: 20 },
  // { id: 154, name: "	FLEX MAIN BOARD Redmi 5A (ORIGINAL)	", price: 15 },
  // { id: 155, name: "	FLEX MAIN BOARD Redmi 5A Prime (ORIGINAL)	", price: 15 },
  // { id: 156, name: "	FLEX MAIN BOARD Redmi 6A (ORIGINAL)	", price: 20 },
  // { id: 157, name: "	FLEX MAIN BOARD Redmi Go (ORIGINAL)	", price: 15 },
  // { id: 158, name: "	FLEX MAIN BOARD Redmi Note 10 (ORIGINAL)	", price: 25 },
  // { id: 159, name: "	FLEX MAIN BOARD Redmi Note 10 Pro (ORIGINAL)	", price: 25 },
  // { id: 160, name: "	FLEX MAIN BOARD Redmi Note 2 (ORIGINAL)	", price: 15 },
  // { id: 161, name: "	FLEX MAIN BOARD Redmi Note 3 (ORIGINAL)	", price: 15 },
  // { id: 162, name: "	FLEX MAIN BOARD Redmi Note 3 Pro (ORIGINAL)	", price: 15 },
  // { id: 163, name: "	FLEX MAIN BOARD Redmi Note 4x (ORIGINAL)	", price: 15 },
  // { id: 164, name: "	FLEX MAIN BOARD Redmi Note 5T (ORIGINAL)	", price: 15 },
  // { id: 165, name: "	FLEX MAIN BOARD Redmi Note 6 Pro (ORIGINAL)	", price: 20 },
  // { id: 166, name: "	FLEX MAIN BOARD Redmi Note 7 (ORIGINAL)	", price: 20 },
  // { id: 167, name: "	FLEX MAIN BOARD Redmi Note 7 Pro (ORIGINAL)	", price: 20 },
  // { id: 168, name: "	FLEX MAIN BOARD Redmi Note 8 (ORIGINAL)	", price: 20 },
  // { id: 169, name: "	FLEX MAIN BOARD Redmi Note 9 (ORIGINAL)	", price: 20 },
  // { id: 170, name: "	FLEX MAIN BOARD Redmi Note 9s (ORIGINAL)	", price: 20 },
  // { id: 171, name: "	FLEX MAIN BOARD Redmi Redmi 10 (ORIGINAL)	", price: 20 },
  // { id: 172, name: "	FLEX MAIN BOARD Redmi Redmi 9 (ORIGINAL)	", price: 20 },
  // { id: 173, name: "	FLEX MAIN BOARD Redmi Redmi Note 10s (ORIGINAL)	", price: 25 },
  // { id: 174, name: "	FLEX MAIN BOARD Redmi Redmi Note 11 (ORIGINAL)	", price: 25 },
  // { id: 175, name: "	FLEX MAIN BOARD Redmi Redmi Note 11 Pro (ORIGINAL)	", price: 25 },
  // { id: 176, name: "	FLEX MAIN BOARD Samsung A10 (ORIGINAL)	", price: 20 },
  // { id: 177, name: "	FLEX MAIN BOARD Samsung A10s / M13 (ORIGINAL)	", price: 20 },
  // { id: 178, name: "	FLEX MAIN BOARD Samsung A20 (ORIGINAL)	", price: 20 },
  // { id: 179, name: "	FLEX MAIN BOARD Samsung A20s / M12 (ORIGINAL)	", price: 20 },
  // { id: 180, name: "	FLEX MAIN BOARD Samsung A20s / M14 (ORIGINAL)	", price: 20 },
  // { id: 181, name: "	FLEX MAIN BOARD Samsung A21 (ORIGINAL)	", price: 20 },
  // { id: 182, name: "	FLEX MAIN BOARD Samsung A21s (ORIGINAL)	", price: 20 },
  // { id: 183, name: "	FLEX MAIN BOARD Samsung A22 4G (ORIGINAL)	", price: 30 },
  // { id: 184, name: "	FLEX MAIN BOARD Samsung A22 5G (ORIGINAL)	", price: 30 },
  // { id: 185, name: "	FLEX MAIN BOARD Samsung A30 (ORIGINAL)	", price: 20 },
  // { id: 186, name: "	FLEX MAIN BOARD Samsung A30s (ORIGINAL)	", price: 20 },
  // { id: 187, name: "	FLEX MAIN BOARD Samsung A31 (ORIGINAL)	", price: 20 },
  // { id: 188, name: "	FLEX MAIN BOARD Samsung A32 4G (ORIGINAL)	", price: 30 },
  // { id: 189, name: "	FLEX MAIN BOARD Samsung A50 (ORIGINAL)	", price: 20 },
  // { id: 190, name: "	FLEX MAIN BOARD Samsung A60 (ORIGINAL)	", price: 30 },
  // { id: 191, name: "	FLEX MAIN BOARD Samsung a7 2018 (ORIGINAL)	", price: 20 },
  // { id: 192, name: "	FLEX MAIN BOARD Samsung A70/A70s (ORIGINAL)	", price: 30 },
  // { id: 193, name: "	FLEX MAIN BOARD Samsung A71 (ORIGINAL)	", price: 30 },
  // { id: 194, name: "	FLEX MAIN BOARD Samsung A72 (ORIGINAL)	", price: 45 },
  // { id: 195, name: "	FLEX MAIN BOARD Tecno Tecno Camon 17p (ORIGINAL)	", price: 30 },
  // { id: 196, name: "	FLEX MAIN BOARD Tecno Tecno Camon 18p (ORIGINAL)	", price: 30 },
  // { id: 197, name: "	FLEX MAIN BOARD Xiaomi Poco X3 (ORIGINAL)	", price: 25 },
  // { id: 198, name: "	FLEX MAIN BOARD Xiaomi Xiaomi Poco X3 Pro (ORIGINAL)	", price: 25 },
  // { id: 199, name: "	FLEX note7 (ORIGINAL)	", price: 25 },
  // { id: 200, name: "	FLEX Power y volumen	", price: 20 },
  // { id: 201, name: "	FLEX Samsung A51	", price: 30 },
  // { id: 202, name: "	LCD FLEX Samsung A20 (ORIGINAL)	", price: 20 },
  // { id: 203, name: "	LCD FLEX Samsung A50 (ORIGINAL)	", price: 20 },
  // { id: 204, name: "	MANTA TERMICA	", price: 85 },
  // { id: 205, name: "	MIKA CON OCA HUAWEI P30 PRO (ORIGINAL)	", price: 18 },
  // { id: 206, name: "	MIKA CON OCA HUAWEI Y9 2019 (ORIGINAL)	", price: 18 },
  // { id: 207, name: "	MIKA CON OCA HUAWEI Y9 PRIME (ORIGINAL)	", price: 18 },
  // { id: 208, name: "	MIKA CON OCA Infinix HOT 10 (ORIGINAL)	", price: 20 },
  // { id: 209, name: "	MIKA CON OCA Infinix HOT 10 LITE (ORIGINAL)	", price: 20 },
  // { id: 210, name: "	MIKA CON OCA Infinix HOT 10s (ORIGINAL)	", price: 20 },
  // { id: 211, name: "	MIKA CON OCA Infinix HOT 11 (ORIGINAL)	", price: 25 },
  // { id: 212, name: "	MIKA CON OCA Infinix HOT 11 PLAY (ORIGINAL)	", price: 25 },
  // { id: 213, name: "	MIKA CON OCA Infinix HOT 11s (ORIGINAL)	", price: 25 },
  // { id: 214, name: "	MIKA CON OCA Infinix HOT 8 (ORIGINAL)	", price: 20 },
  // { id: 215, name: "	MIKA CON OCA Infinix HOT 9 (ORIGINAL)	", price: 20 },
  // { id: 216, name: "	MIKA CON OCA Infinix HOT 9 PLAY (ORIGINAL)	", price: 20 },
  // { id: 217, name: "	MIKA CON OCA Infinix HOT 9 PRO (ORIGINAL)	", price: 20 },
  // { id: 218, name: "	MIKA CON OCA Infinix Infinix HOT 12 (ORIGINAL)	", price: 25 },
  // { id: 219, name: "	MIKA CON OCA Infinix Infinix HOT 12 PLAY (ORIGINAL)	", price: 25 },
  // { id: 220, name: "	MIKA CON OCA Infinix NOTE 10 (ORIGINAL)	", price: 25 },
  // { id: 221, name: "	MIKA CON OCA Infinix NOTE 11 (ORIGINAL)	", price: 25 },
  // { id: 222, name: "	MIKA CON OCA Infinix NOTE 11 PRO (ORIGINAL)	", price: 25 },
  // { id: 223, name: "	MIKA CON OCA Infinix NOTE 7 (ORIGINAL)	", price: 25 },
  // { id: 224, name: "	MIKA CON OCA Infinix NOTE 7 LITE (ORIGINAL)	", price: 25 },
  // { id: 225, name: "	MIKA CON OCA Infinix NOTE 8 (ORIGINAL)	", price: 25 },
  // { id: 226, name: "	MIKA CON OCA Infinix NOTE 8i (ORIGINAL)	", price: 25 },
  // { id: 227, name: "	MIKA CON OCA REALME 9i (ORIGINAL)	", price: 25 },
  // { id: 228, name: "	MIKA CON OCA Redmi Note 10 (ORIGINAL)	", price: 18 },
  // { id: 229, name: "	MIKA CON OCA Redmi Note 10 pro (ORIGINAL)	", price: 18 },
  // { id: 230, name: "	MIKA CON OCA Redmi Note 8 (ORIGINAL)	", price: 18 },
  // { id: 231, name: "	MIKA CON OCA Redmi Note 9 (ORIGINAL)	", price: 18 },
  // { id: 232, name: "	MIKA CON OCA Redmi Note 9s (ORIGINAL)	", price: 18 },
  // { id: 233, name: "	MIKA CON OCA Redmi REDMI 10 (ORIGINAL)	", price: 15 },
  // { id: 234, name: "	MIKA CON OCA Redmi REDMI 10C (ORIGINAL)	", price: 18 },
  // { id: 235, name: "	MIKA CON OCA Redmi REDMI 5 (ORIGINAL)	", price: 15 },
  // { id: 236, name: "	MIKA CON OCA Redmi REDMI 8 (ORIGINAL)	", price: 15 },
  // { id: 237, name: "	MIKA CON OCA Redmi REDMI 8A (ORIGINAL)	", price: 15 },
  // { id: 238, name: "	MIKA CON OCA Redmi REDMI 9 (ORIGINAL)	", price: 15 },
  // { id: 239, name: "	MIKA CON OCA Redmi REDMI 9A (ORIGINAL)	", price: 15 },
  // { id: 240, name: "	MIKA CON OCA Redmi REDMI 9T (ORIGINAL)	", price: 15 },
  // { id: 241, name: "	MIKA CON OCA Redmi REDMI NOTE 10 (5G) (ORIGINAL)	", price: 20 },
  // { id: 242, name: "	MIKA CON OCA Redmi REDMI NOTE 10s (ORIGINAL)	", price: 20 },
  // { id: 243, name: "	MIKA CON OCA Redmi REDMI NOTE 11 (ORIGINAL)	", price: 20 },
  // { id: 244, name: "	MIKA CON OCA Redmi REDMI NOTE 5 (ORIGINAL)	", price: 15 },
  // { id: 245, name: "	MIKA CON OCA Redmi REDMI NOTE 5 PRO (ORIGINAL)	", price: 15 },
  // { id: 246, name: "	MIKA CON OCA Redmi REDMI NOTE 6 (ORIGINAL)	", price: 15 },
  // { id: 247, name: "	MIKA CON OCA Redmi REDMI NOTE 6 PRO (ORIGINAL)	", price: 15 },
  // { id: 248, name: "	MIKA CON OCA Redmi REDMI NOTE 8 PRO (ORIGINAL)	", price: 18 },
  // { id: 249, name: "	MIKA CON OCA Redmi REDMI NOTE 9 (ORIGINAL)	", price: 18 },
  // { id: 250, name: "	MIKA CON OCA Redmi REDMI NOTE 9 PRO (ORIGINAL)	", price: 18 },
  // { id: 251, name: "	MIKA CON OCA Redmi REDMI NOTE 9S (ORIGINAL)	", price: 18 },
  // { id: 252, name: "	MIKA CON OCA Samsung A01 core (ORIGINAL)	", price: 15 },
  // { id: 253, name: "	MIKA CON OCA Samsung A02 (ORIGINAL)	", price: 18 },
  // { id: 254, name: "	MIKA CON OCA Samsung A02 core (ORIGINAL)	", price: 15 },
  // { id: 255, name: "	MIKA CON OCA Samsung A02s (ORIGINAL)	", price: 18 },
  // { id: 256, name: "	MIKA CON OCA Samsung A03 (ORIGINAL)	", price: 15 },
  // { id: 257, name: "	MIKA CON OCA Samsung A03s (ORIGINAL)	", price: 15 },
  // { id: 258, name: "	MIKA CON OCA Samsung A10 (ORIGINAL)	", price: 18 },
  // { id: 259, name: "	MIKA CON OCA Samsung A10s (ORIGINAL)	", price: 18 },
  // { id: 260, name: "	MIKA CON OCA Samsung A11 (ORIGINAL)	", price: 18 },
  // { id: 261, name: "	MIKA CON OCA Samsung A12 (ORIGINAL)	", price: 18 },
  // { id: 262, name: "	MIKA CON OCA Samsung A20 (ORIGINAL)	", price: 18 },
  // { id: 263, name: "	MIKA CON OCA Samsung A20s (ORIGINAL)	", price: 15 },
  // { id: 264, name: "	MIKA CON OCA Samsung A21 (ORIGINAL)	", price: 15 },
  // { id: 265, name: "	MIKA CON OCA Samsung A21s (ORIGINAL)	", price: 18 },
  // { id: 266, name: "	MIKA CON OCA Samsung A22 (ORIGINAL)	", price: 18 },
  // { id: 267, name: "	MIKA CON OCA Samsung A30 (ORIGINAL)	", price: 18 },
  // { id: 268, name: "	MIKA CON OCA Samsung A30s (ORIGINAL)	", price: 18 },
  // { id: 269, name: "	MIKA CON OCA Samsung A31 (ORIGINAL)	", price: 18 },
  // { id: 270, name: "	MIKA CON OCA Samsung A32 (ORIGINAL)	", price: 18 },
  // { id: 271, name: "	MIKA CON OCA Samsung A32 5G (ORIGINAL)	", price: 18 },
  // { id: 272, name: "	MIKA CON OCA Samsung A50 (ORIGINAL)	", price: 18 },
  // { id: 273, name: "	MIKA CON OCA Samsung A51 (ORIGINAL)	", price: 18 },
  // { id: 274, name: "	MIKA CON OCA Samsung A70 (ORIGINAL)	", price: 18 },
  // { id: 275, name: "	MIKA CON OCA Samsung A71 (ORIGINAL)	", price: 18 },
  // { id: 276, name: "	MIKA CON OCA Samsung A72 (ORIGINAL)	", price: 18 },
  // { id: 277, name: "	MIKA CON OCA Samsung A9 2018 (ORIGINAL)	", price: 18 },
  // { id: 278, name: "	MIKA CON OCA Samsung J1 ACE TOUCH (ORIGINAL)	", price: 25 },
  // { id: 279, name: "	MIKA CON OCA Samsung J2 CORE (ORIGINAL)	", price: 15 },
  // { id: 280, name: "	MIKA CON OCA Samsung J4 PLUS (ORIGINAL)	", price: 15 },
  // { id: 281, name: "	MIKA CON OCA Samsung J5 PRIME (ORIGINAL)	", price: 15 },
  // { id: 282, name: "	MIKA CON OCA Samsung J6 (ORIGINAL)	", price: 15 },
  // { id: 283, name: "	MIKA CON OCA Samsung J6 PLUS (ORIGINAL)	", price: 15 },
  // { id: 284, name: "	MIKA CON OCA Samsung J7 PRIME (ORIGINAL)	", price: 15 },
  // { id: 285, name: "	MIKA CON OCA Samsung J8 (ORIGINAL)	", price: 15 },
  // { id: 286, name: "	MIKA CON OCA Samsung J8 PLUS (ORIGINAL)	", price: 15 },
  // { id: 287, name: "	MIKA CON OCA Tecno CAMON 15 (ORIGINAL)	", price: 25 },
  // { id: 288, name: "	MIKA CON OCA Tecno CAMON 15 PREMIER (ORIGINAL)	", price: 25 },
  // { id: 289, name: "	MIKA CON OCA Tecno CAMON 15 PRO (ORIGINAL)	", price: 25 },
  // { id: 290, name: "	MIKA CON OCA Tecno CAMON 16 (ORIGINAL)	", price: 25 },
  // { id: 291, name: "	MIKA CON OCA Tecno CAMON 17 (ORIGINAL)	", price: 25 },
  // { id: 292, name: "	MIKA CON OCA Tecno CAMON 17 PRO (ORIGINAL)	", price: 25 },
  // { id: 293, name: "	MIKA CON OCA Tecno CAMON 18 (ORIGINAL)	", price: 25 },
  // { id: 294, name: "	MIKA CON OCA Tecno CAMON 18P (ORIGINAL)	", price: 25 },
  // { id: 295, name: "	MIKA CON OCA Tecno POVA (ORIGINAL)	", price: 25 },
  // { id: 296, name: "	MIKA CON OCA Tecno POVA 2 (ORIGINAL)	", price: 25 },
  // { id: 297, name: "	MIKA CON OCA Tecno POVA 3 (ORIGINAL)	", price: 25 },
  // { id: 298, name: "	MIKA CON OCA Tecno SPARK 5 (ORIGINAL)	", price: 25 },
  // { id: 299, name: "	MIKA CON OCA Tecno SPARK 5 air (ORIGINAL)	", price: 25 },
  // { id: 300, name: "	MIKA CON OCA Tecno SPARK 6 (ORIGINAL)	", price: 25 },
  // { id: 301, name: "	MIKA CON OCA Tecno SPARK 6 GO (ORIGINAL)	", price: 25 },
  // { id: 302, name: "	MIKA CON OCA Tecno SPARK 7 (ORIGINAL)	", price: 25 },
  // { id: 303, name: "	MIKA CON OCA Tecno SPARK 7 PRO (ORIGINAL)	", price: 25 },
  // { id: 304, name: "	MIKA CON OCA Tecno SPARK 8 PRO (ORIGINAL)	", price: 25 },
  // { id: 305, name: "	MIKA CON OCA Xiaomi Poco x3 (ORIGINAL)	", price: 18 },
  // { id: 306, name: "	MIKA CON OCA ZTE A5 2020 (ORIGINAL)	", price: 25 },
  // { id: 307, name: "	MIKA CON OCA ZTE A51 (ORIGINAL)	", price: 25 },
  // { id: 308, name: "	MIKA CON OCA ZTE A71 (ORIGINAL)	", price: 25 },
  // { id: 309, name: "	MIKA CON OCA ZTE A7S (ORIGINAL)	", price: 25 },
  // { id: 310, name: "	MIKA CON OCA ZTE V20 SMART (ORIGINAL)	", price: 25 },
  // { id: 311, name: "	MODULO Huawei Honor 10 (SEGUNDA)	", price: 30 },
  // { id: 312, name: "	MODULO Huawei Honor 10 lite (SEGUNDA)	", price: 30 },
  // { id: 313, name: "	MODULO Huawei Honor 20 (SEGUNDA)	", price: 30 },
  // { id: 314, name: "	MODULO Huawei Honor 5C (SEGUNDA)	", price: 30 },
  // { id: 315, name: "	MODULO Huawei Honor 7A (SEGUNDA)	", price: 25 },
  // { id: 316, name: "	MODULO Huawei Honor 7S (SEGUNDA)	", price: 25 },
  // { id: 317, name: "	MODULO Huawei Honor 7x (SEGUNDA)	", price: 25 },
  // { id: 318, name: "	MODULO Huawei Honor 8A (SEGUNDA)	", price: 25 },
  // { id: 319, name: "	MODULO Huawei Honor 8s (SEGUNDA)	", price: 25 },
  // { id: 320, name: "	MODULO Huawei Honor 8x (SEGUNDA)	", price: 25 },
  // { id: 321, name: "	MODULO Huawei Honor 9 (SEGUNDA)	", price: 25 },
  // { id: 322, name: "	MODULO Huawei Honor 9 lite (SEGUNDA)	", price: 25 },
  // { id: 323, name: "	MODULO Huawei Mate 10 (SEGUNDA)	", price: 25 },
  // { id: 324, name: "	MODULO Huawei Mate 10 lite (SEGUNDA)	", price: 25 },
  // { id: 325, name: "	MODULO Huawei Mate 20 (SEGUNDA)	", price: 25 },
  // { id: 326, name: "	MODULO Huawei Mate 7 (SEGUNDA)	", price: 25 },
  // { id: 327, name: "	MODULO Huawei Mate 8 (SEGUNDA)	", price: 25 },
  // { id: 328, name: "	MODULO Huawei Mate 9 (SEGUNDA)	", price: 25 },
  // { id: 329, name: "	MODULO Huawei Mate 9 lite (SEGUNDA)	", price: 25 },
  // { id: 330, name: "	MODULO Huawei Mate 9 pro (SEGUNDA)	", price: 30 },
  // { id: 331, name: "	MODULO Huawei Nova 2 (SEGUNDA)	", price: 25 },
  // { id: 332, name: "	MODULO Huawei Nova 3 (SEGUNDA)	", price: 25 },
  // { id: 333, name: "	MODULO Huawei Nova 5i (SEGUNDA)	", price: 25 },
  // { id: 334, name: "	MODULO Huawei Nova 5T (SEGUNDA)	", price: 25 },
  // { id: 335, name: "	MODULO Huawei Nova plus (SEGUNDA)	", price: 25 },
  // { id: 336, name: "	MODULO Huawei P smart 2019 (SEGUNDA)	", price: 30 },
  // { id: 337, name: "	MODULO Huawei P10 (SEGUNDA)	", price: 30 },
  // { id: 338, name: "	MODULO Huawei P10 lite (SEGUNDA)	", price: 30 },
  // { id: 339, name: "	MODULO Huawei P10 Plus (SEGUNDA)	", price: 30 },
  // { id: 340, name: "	MODULO Huawei P20 lite (SEGUNDA)	", price: 30 },
  // { id: 341, name: "	MODULO Huawei P30 (SEGUNDA)	", price: 35 },
  // { id: 342, name: "	MODULO Huawei P30 lite (SEGUNDA)	", price: 30 },
  // { id: 343, name: "	MODULO Huawei P9 (SEGUNDA)	", price: 25 },
  // { id: 344, name: "	MODULO Huawei P9 Lite (SEGUNDA)	", price: 25 },
  // { id: 345, name: "	MODULO Huawei P9 Plus (SEGUNDA)	", price: 25 },
  // { id: 346, name: "	MODULO Huawei Y5P (SEGUNDA)	", price: 25 },
  // { id: 347, name: "	MODULO Huawei Y6 2019 (SEGUNDA)	", price: 25 },
  // { id: 348, name: "	MODULO Huawei Y6P (SEGUNDA)	", price: 25 },
  // { id: 349, name: "	MODULO Huawei Y7 2017 (SEGUNDA)	", price: 25 },
  // { id: 350, name: "	MODULO Huawei Y7A (SEGUNDA)	", price: 25 },
  // { id: 351, name: "	MODULO Huawei Y7P (SEGUNDA)	", price: 25 },
  // { id: 352, name: "	MODULO Huawei Y9 2018 (SEGUNDA)	", price: 25 },
  // { id: 353, name: "	MODULO Huawei Y9 2019 (SEGUNDA)	", price: 30 },
  // { id: 354, name: "	MODULO Huawei Y9 prime 2019 (SEGUNDA)	", price: 30 },
  // { id: 355, name: "	MODULO Huawei Y9A (SEGUNDA)	", price: 25 },
  // { id: 356, name: "	MODULO Huawei Y9s (SEGUNDA)	", price: 25 },
  // { id: 357, name: "	MODULO Infinix Hot 10 (ORIGINAL)	", price: 35 },
  // { id: 358, name: "	MODULO Infinix Hot 10 Lite (ORIGINAL)	", price: 35 },
  // { id: 359, name: "	MODULO Infinix Hot 10 Play (ORIGINAL)	", price: 35 },
  // { id: 360, name: "	MODULO Infinix Hot 11 Play (ORIGINAL)	", price: 35 },
  // { id: 361, name: "	MODULO Infinix Hot 8 (ORIGINAL)	", price: 35 },
  // { id: 362, name: "	MODULO Infinix Hot 9 (ORIGINAL)	", price: 35 },
  // { id: 363, name: "	MODULO Infinix Hot 9 Play (ORIGINAL)	", price: 35 },
  // { id: 364, name: "	MODULO Infinix Note 10 (ORIGINAL)	", price: 35 },
  // { id: 365, name: "	MODULO Infinix Note 7  (ORIGINAL)	", price: 35 },
  // { id: 366, name: "	MODULO Infinix Note 7 Lite (ORIGINAL)	", price: 35 },
  // { id: 367, name: "	MODULO Infinix Note 8 (ORIGINAL)	", price: 35 },
  // { id: 368, name: "	MODULO Realme 6 (ORIGINAL)	", price: 35 },
  // { id: 369, name: "	MODULO Realme 6 Pro (ORIGINAL)	", price: 35 },
  // { id: 370, name: "	MODULO Realme 7 (ORIGINAL)	", price: 35 },
  // { id: 371, name: "	MODULO Realme 7 Pro (ORIGINAL)	", price: 35 },
  // { id: 372, name: "	MODULO Realme 7i (ORIGINAL)	", price: 35 },
  // { id: 373, name: "	MODULO Realme 8 Pro (ORIGINAL)	", price: 35 },
  // { id: 374, name: "	MODULO Realme C11 2021 (ORIGINAL)	", price: 35 },
  // { id: 375, name: "	MODULO Realme C21Y 2021 (ORIGINAL)	", price: 35 },
  // { id: 376, name: "	MODULO Realme C3 (ORIGINAL)	", price: 35 },
  // { id: 377, name: "	MODULO Redmi 4 (SEGUNDA)	", price: 25 },
  // { id: 378, name: "	MODULO Redmi 4A (SEGUNDA)	", price: 25 },
  // { id: 379, name: "	MODULO Redmi 4x (SEGUNDA)	", price: 25 },
  // { id: 380, name: "	MODULO Redmi 5 (SEGUNDA)	", price: 25 },
  // { id: 381, name: "	MODULO Redmi 5 Plus (SEGUNDA)	", price: 25 },
  // { id: 382, name: "	MODULO Redmi 5A (SEGUNDA)	", price: 25 },
  // { id: 383, name: "	MODULO Redmi 6A (SEGUNDA)	", price: 25 },
  // { id: 384, name: "	MODULO Redmi 7 (SEGUNDA)	", price: 25 },
  // { id: 385, name: "	MODULO Redmi 8A (SEGUNDA)	", price: 25 },
  // { id: 386, name: "	MODULO Redmi 9 (SEGUNDA)	", price: 25 },
  // { id: 387, name: "	MODULO Redmi 9A (SEGUNDA)	", price: 25 },
  // { id: 388, name: "	MODULO Redmi 9C (SEGUNDA)	", price: 25 },
  // { id: 389, name: "	MODULO Redmi 9T (SEGUNDA)	", price: 25 },
  // { id: 390, name: "	MODULO Redmi Go (SEGUNDA)	", price: 25 },
  // { id: 391, name: "	MODULO Redmi Note 10 (SEGUNDA)	", price: 25 },
  // { id: 392, name: "	MODULO Redmi Note 10 Pro (SEGUNDA)	", price: 25 },
  // { id: 393, name: "	MODULO Redmi Note 2 (SEGUNDA)	", price: 25 },
  // { id: 394, name: "	MODULO Redmi Note 3 (SEGUNDA)	", price: 25 },
  // { id: 395, name: "	MODULO Redmi Note 3 pro (SEGUNDA)	", price: 30 },
  // { id: 396, name: "	MODULO Redmi Note 4x (SEGUNDA)	", price: 25 },
  // { id: 397, name: "	MODULO Redmi Note 5 Plus (SEGUNDA)	", price: 25 },
  // { id: 398, name: "	MODULO Redmi Note 5 pro (SEGUNDA)	", price: 25 },
  // { id: 399, name: "	MODULO Redmi Note 5A (SEGUNDA)	", price: 25 },
  // { id: 400, name: "	MODULO Redmi Note 5A Prime (SEGUNDA)	", price: 25 },
  // { id: 401, name: "	MODULO Redmi Note 6 Pro (SEGUNDA)	", price: 25 },
  // { id: 402, name: "	MODULO Redmi Note 7 (SEGUNDA)	", price: 25 },
  // { id: 403, name: "	MODULO Redmi Note 7 Pro (SEGUNDA)	", price: 30 },
  // { id: 404, name: "	MODULO Redmi Note 8 (SEGUNDA)	", price: 25 },
  // { id: 405, name: "	MODULO Redmi Note 8 pro (SEGUNDA)	", price: 25 },
  // { id: 406, name: "	MODULO Samsung A01 core (SEGUNDA)	", price: 25 },
  // { id: 407, name: "	MODULO Samsung A10S / A107F / M15 (ORIGINAL)	", price: 80 },
  // { id: 408, name: "	MODULO Samsung A22 4G (ORIGINAL)	", price: 120 },
  // { id: 409, name: "	MODULO Samsung A22 4G (SEGUNDA)	", price: 25 },
  // { id: 410, name: "	MODULO Samsung A32 (4G) / A214F (SEGUNDA)	", price: 25 },
  // { id: 411, name: "	MODULO Samsung A32 (5G) / A215B (SEGUNDA)	", price: 25 },
  // { id: 412, name: "	MODULO Samsung A52 (ORIGINAL)	", price: 100 },
  // { id: 413, name: "	MODULO Samsung A80 (ORIGINAL)	", price: 120 },
  // { id: 414, name: "	MODULO Samsung Galaxy  J5 J7 2016 J510 J710 (SEGUNDA)	", price: 5 },
  // { id: 415, name: "	MODULO Samsung Galaxy A01 A015V Type C (SEGUNDA)	", price: 30 },
  // { id: 416, name: "	MODULO Samsung Galaxy A02 A022 (SEGUNDA)	", price: 25 },
  // { id: 417, name: "	MODULO Samsung Galaxy A02s A025F (SEGUNDA)	", price: 25 },
  // { id: 418, name: "	MODULO Samsung Galaxy A10 A105F (SEGUNDA)	", price: 25 },
  // { id: 419, name: "	MODULO Samsung Galaxy A10 A105FN (SEGUNDA)	", price: 35 },
  // { id: 420, name: "	MODULO Samsung Galaxy A10s A107F M15 (SEGUNDA)	", price: 25 },
  // { id: 421, name: "	MODULO Samsung Galaxy A10s A107F M16 (ORIGINAL)	", price: 80 },
  // { id: 422, name: "	MODULO Samsung Galaxy A10s A107F M16 (SEGUNDA)	", price: 25 },
  // { id: 423, name: "	MODULO Samsung Galaxy A11 A115F (SEGUNDA)	", price: 25 },
  // { id: 424, name: "	MODULO Samsung Galaxy A12 A125F (ORIGINAL)	", price: 70 },
  // { id: 425, name: "	MODULO Samsung Galaxy A12 A125F (SEGUNDA)	", price: 25 },
  // { id: 426, name: "	MODULO Samsung Galaxy A13 (4G) / A135F (SEGUNDA)	", price: 25 },
  // { id: 427, name: "	MODULO Samsung Galaxy A13 (5G) / A136B (SEGUNDA)	", price: 25 },
  // { id: 428, name: "	MODULO Samsung Galaxy A13 (ORIGINAL)	", price: 80 },
  // { id: 429, name: "	MODULO Samsung Galaxy A20 A205F (ORIGINAL)	", price: 80 },
  // { id: 430, name: "	MODULO Samsung Galaxy A20 A205F (SEGUNDA)	", price: 25 },
  // { id: 431, name: "	MODULO Samsung Galaxy A20s A207F M12 (ORIGINAL)	", price: 80 },
  // { id: 432, name: "	MODULO Samsung Galaxy A20s A207F M12 (SEGUNDA)	", price: 25 },
  // { id: 433, name: "	MODULO Samsung Galaxy A20s A207F M14 (ORIGINAL)	", price: 80 },
  // { id: 434, name: "	MODULO Samsung Galaxy A20s A207F M14 (SEGUNDA)	", price: 25 },
  // { id: 435, name: "	MODULO Samsung Galaxy A21s A217F (ORIGINAL)	", price: 75 },
  // { id: 436, name: "	MODULO Samsung Galaxy A21s A217F (SEGUNDA)	", price: 25 },
  // { id: 437, name: "	MODULO Samsung Galaxy A30 A305F (ORIGINAL)	", price: 75 },
  // { id: 438, name: "	MODULO Samsung Galaxy A30 A305F (SEGUNDA)	", price: 25 },
  // { id: 439, name: "	MODULO Samsung Galaxy A30s A307F (SEGUNDA)	", price: 25 },
  // { id: 440, name: "	MODULO Samsung Galaxy A5 A500F  (SEGUNDA)	", price: 30 },
  // { id: 441, name: "	MODULO Samsung Galaxy A50 A505F (ORIGINAL)	", price: 75 },
  // { id: 442, name: "	MODULO Samsung Galaxy A50 A505F (SEGUNDA)	", price: 25 },
  // { id: 443, name: "	MODULO Samsung Galaxy A50 A505U (ORIGINAL)	", price: 75 },
  // { id: 444, name: "	MODULO Samsung Galaxy A50s A507F (SEGUNDA)	", price: 25 },
  // { id: 445, name: "	MODULO Samsung Galaxy A51 / A515F (ORIGINAL)	", price: 75 },
  // { id: 446, name: "	MODULO Samsung Galaxy A7 2016 A710F (SEGUNDA)	", price: 35 },
  // { id: 447, name: "	MODULO Samsung Galaxy A7 2018 A750F (SEGUNDA)	", price: 25 },
  // { id: 448, name: "	MODULO Samsung Galaxy A7 A700F (SEGUNDA)	", price: 30 },
  // { id: 449, name: "	MODULO Samsung Galaxy A70 /  A70S / A705F / A707  (ORIGINAL)	", price: 120 },
  // { id: 450, name: "	MODULO Samsung Galaxy A70 A705F (SEGUNDA)	", price: 40 },
  // { id: 451, name: "	MODULO Samsung Galaxy A71 / A715F (ORIGINAL)	", price: 120 },
  // { id: 452, name: "	MODULO Samsung Galaxy J3 J5 J7 2017 J330 J530 J730 (SEGUNDA)	", price: 5 },
  // { id: 453, name: "	MODULO Samsung Galaxy S10 (SEGUNDA)	", price: 30 },
  // { id: 454, name: "	MODULO Samsung Galaxy S6 Edge (SEGUNDA)	", price: 30 },
  // { id: 455, name: "	MODULO Samsung Galaxy S6 Edge Plus (SEGUNDA)	", price: 30 },
  // { id: 456, name: "	MODULO Samsung Galaxy S7 (SEGUNDA)	", price: 35 },
  // { id: 457, name: "	MODULO Samsung Galaxy S7 Edge (SEGUNDA)	", price: 25 },
  // { id: 458, name: "	MODULO Samsung Galaxy S8 (SEGUNDA)	", price: 30 },
  // { id: 459, name: "	MODULO Samsung Galaxy S8 Plus (SEGUNDA)	", price: 30 },
  // { id: 460, name: "	MODULO Samsung Galaxy S9 (SEGUNDA)	", price: 45 },
  // { id: 461, name: "	MODULO Samsung Galaxy S9 Plus (SEGUNDA)	", price: 45 },
  // { id: 462, name: "	MODULO Samsung Note 10 (SEGUNDA)	", price: 35 },
  // { id: 463, name: "	MODULO Samsung Note 10+ (SEGUNDA)	", price: 35 },
  // { id: 464, name: "	MODULO Samsung Note 8 (SEGUNDA)	", price: 30 },
  // { id: 465, name: "	MODULO Samsung Note 9 (SEGUNDA)	", price: 30 },
  // { id: 466, name: "	MODULO Samsung S10 Plus (SEGUNDA)	", price: 45 },
  // { id: 467, name: "	MODULO Samsung S6 (SEGUNDA)	", price: 30 },
  // { id: 468, name: "	MODULO Samsung Samsung Galaxy J320 J500 (SEGUNDA)	", price: 5 },
  // { id: 469, name: "	MODULO Samsung Samsung Galaxy J700 (SEGUNDA)	", price: 5 },
  // { id: 470, name: "	MODULO Sony Xa Ultra (SEGUNDA)	", price: 35 },
  // { id: 471, name: "	MODULO Sony Xa1 Ultra (SEGUNDA)	", price: 30 },
  // { id: 472, name: "	MODULO Sony Xa2 Ultra (SEGUNDA)	", price: 35 },
  // { id: 473, name: "	MODULO Sony Z2 (SEGUNDA)	", price: 25 },
  // { id: 474, name: "	MODULO Sony Z3 (SEGUNDA)	", price: 25 },
  // { id: 475, name: "	MODULO Sony Z5 (SEGUNDA)	", price: 25 },
  // { id: 476, name: "	MODULO Tecno Camon 15 (SEGUNDA)	", price: 35 },
  // { id: 477, name: "	MODULO Tecno Camon 16 (SEGUNDA)	", price: 35 },
  // { id: 478, name: "	MODULO Tecno Camon 16 Premier (ORIGINAL)	", price: 35 },
  // { id: 479, name: "	MODULO Tecno Camon 17 (ORIGINAL)	", price: 35 },
  // { id: 480, name: "	MODULO Tecno Camon 17 Pro (ORIGINAL)	", price: 35 },
  // { id: 481, name: "	MODULO Tecno Pova (ORIGINAL)	", price: 35 },
  // { id: 482, name: "	MODULO Tecno Pova 2 (ORIGINAL)	", price: 35 },
  // { id: 483, name: "	MODULO Tecno Spark (SEGUNDA)	", price: 30 },
  // { id: 484, name: "	MODULO Tecno Spark 5 (SEGUNDA)	", price: 30 },
  // { id: 485, name: "	MODULO Tecno Spark 5 air (SEGUNDA)	", price: 30 },
  // { id: 486, name: "	MODULO Tecno Spark 6 (ORIGINAL)	", price: 35 },
  // { id: 487, name: "	MODULO Tecno Spark 6 go (SEGUNDA)	", price: 35 },
  // { id: 488, name: "	MODULO Tecno Spark Go (ORIGINAL)	", price: 35 },
  // { id: 489, name: "	MODULO Xiaomi Mi 10 lite (SEGUNDA)	", price: 30 },
  // { id: 490, name: "	MODULO Xiaomi Mi 8 (SEGUNDA)	", price: 30 },
  // { id: 491, name: "	MODULO Xiaomi Mi 8 Lite (SEGUNDA)	", price: 30 },
  // { id: 492, name: "	MODULO Xiaomi Mi 9 lite (SEGUNDA)	", price: 30 },
  // { id: 493, name: "	MODULO Xiaomi Mi 9T (SEGUNDA)	", price: 35 },
  // { id: 494, name: "	MODULO Xiaomi Mi A1 (SEGUNDA)	", price: 35 },
  // { id: 495, name: "	MODULO Xiaomi Mi A2 (SEGUNDA)	", price: 30 },
  // { id: 496, name: "	MODULO Xiaomi Mi A2 lite (SEGUNDA)	", price: 30 },
  // { id: 497, name: "	MODULO Xiaomi Mi A3 (SEGUNDA)	", price: 30 },
  // { id: 498, name: "	MODULO Xiaomi Mi Max 2 (SEGUNDA)	", price: 35 },
  // { id: 499, name: "	MODULO Xiaomi Mi Max 3 (SEGUNDA)	", price: 35 },
  // { id: 500, name: "	MODULO Xiaomi Mi Mix 2 (SEGUNDA)	", price: 35 },
  // { id: 501, name: "	MODULO Xiaomi Mi Mix 3 (SEGUNDA)	", price: 35 },
  // { id: 502, name: "	MODULO Xiaomi Redmi 5  (SEGUNDA)	", price: 25 },
  // { id: 503, name: "	MODULO ZTE Blade A51 (ORIGINAL)	", price: 35 },
  { id: 504, name: "	PANTALLA Honor 10 lite (ORIGINAL)	", price: 170 },
  { id: 505, name: "	PANTALLA Honor 50 lite (ORIGINAL)	", price: 170 },
  { id: 506, name: "	PANTALLA Honor 8 (ORIGINAL)	", price: 170 },
  { id: 507, name: "	PANTALLA Honor 8x (ORIGINAL)	", price: 230 },
  { id: 508, name: "	PANTALLA Honor 9x (ORIGINAL)	", price: 215 },
  { id: 509, name: "	PANTALLA Honor x6 (ORIGINAL)	", price: 165 },
  { id: 510, name: "	PANTALLA Honor x7 (ORIGINAL)	", price: 155 },
  { id: 511, name: "	PANTALLA Honor x8 (ORIGINAL)	", price: 170 },
  { id: 512, name: "	PANTALLA Honor x9 (ORIGINAL)	", price: 185 },
  { id: 513, name: "	PANTALLA Huawei Mate 10 (ORIGINAL)	", price: 255 },
  { id: 514, name: "	PANTALLA Huawei Mate 10 lite (ORIGINAL)	", price: 105 },
  { id: 515, name: "	PANTALLA Huawei Mate 10 Pro (OLED)	", price: 260 },
  { id: 516, name: "	PANTALLA Huawei Mate 10 Pro (ORIGINAL)	", price: 270 },
  { id: 517, name: "	PANTALLA Huawei Mate 20 (ORIGINAL)	", price: 330 },
  { id: 518, name: "	PANTALLA Huawei Mate 20 lite (ORIGINAL)	", price: 125 },
  { id: 519, name: "	PANTALLA Huawei Mate 8 (ORIGINAL)	", price: 170 },
  { id: 520, name: "	PANTALLA Huawei Mate 9 (ORIGINAL)	", price: 215 },
  { id: 521, name: "	PANTALLA Huawei Mate 9 lite (ORIGINAL)	", price: 125 },
  { id: 522, name: "	PANTALLA Huawei Nova Y60 (ORIGINAL)	", price: 135 },
  { id: 523, name: "	PANTALLA Huawei P smart 2020 (ORIGINAL)	", price: 210 },
  { id: 524, name: "	PANTALLA Huawei P10 (ORIGINAL)	", price: 165 },
  { id: 525, name: "	PANTALLA Huawei P10 Lite (ORIGINAL)	", price: 140 },
  { id: 526, name: "	PANTALLA Huawei P20 (ORIGINAL)	", price: 210 },
  { id: 527, name: "	PANTALLA Huawei P20 Lite (ORIGINAL)	", price: 135 },
  { id: 528, name: "	PANTALLA Huawei P30 (ORIGINAL)	", price: 390 },
  { id: 529, name: "	PANTALLA Huawei P30 Lite (ORIGINAL)	", price: 175 },
  { id: 530, name: "	PANTALLA Huawei P30 OLED (OLED)	", price: 400 },
  { id: 531, name: "	PANTALLA Huawei P30 PRO (AMOLED)	", price: 445 },
  { id: 532, name: "	PANTALLA Huawei P30 Pro (OLED)	", price: 420 },
  { id: 533, name: "	PANTALLA Huawei P40 (ORIGINAL)	", price: 610 },
  { id: 534, name: "	PANTALLA Huawei P40 Lite (ORIGINAL)	", price: 150 },
  { id: 535, name: "	PANTALLA Huawei P8 (ORIGINAL)	", price: 135 },
  { id: 536, name: "	PANTALLA Huawei P9 Lite (ORIGINAL)	", price: 140 },
  { id: 537, name: "	PANTALLA Huawei Y5 2017 / Y6 2017 (ORIGINAL)	", price: 115 },
  { id: 538, name: "	PANTALLA Huawei Y5 2018 (ORIGINAL)	", price: 105 },
  { id: 539, name: "	PANTALLA Huawei Y5 2019 (ORIGINAL)	", price: 125 },
  { id: 540, name: "	PANTALLA Huawei Y5 II (ORIGINAL)	", price: 110 },
  { id: 541, name: "	PANTALLA Huawei Y5 lite (ORIGINAL)	", price: 95 },
  { id: 542, name: "	PANTALLA Huawei Y6 2018 (ORIGINAL)	", price: 125 },
  { id: 543, name: "	PANTALLA Huawei Y6 2019 (ORIGINAL)	", price: 145 },
  { id: 544, name: "	PANTALLA Huawei Y6 II / 5A (ORIGINAL)	", price: 105 },
  { id: 545, name: "	PANTALLA Huawei Y6 PRIME 2020 / Y6P  (ORIGINAL)	", price: 120 },
  { id: 546, name: "	PANTALLA Huawei Y7 2017 / Y7 PRIME (ORIGINAL)	", price: 145 },
  { id: 547, name: "	PANTALLA Huawei Y7 2018 (ORIGINAL)	", price: 125 },
  { id: 548, name: "	PANTALLA Huawei Y7 2019 (ORIGINAL)	", price: 105 },
  { id: 549, name: "	PANTALLA Huawei Y7 PRIME 2022 / Y7p (ORIGINAL)	", price: 145 },
  { id: 550, name: "	PANTALLA Huawei Y7A (ORIGINAL)	", price: 180 },
  { id: 551, name: "	PANTALLA Huawei Y9 / Y9 2018 (ORIGINAL)	", price: 130 },
  { id: 552, name: "	PANTALLA Huawei Y9 2019 / Y8S (ORIGINAL)	", price: 170 },
  { id: 553, name: "	PANTALLA Infinix Hot 10 (ORIGINAL)	", price: 165 },
  { id: 554, name: "	PANTALLA Infinix Hot 10 Lite (ORIGINAL)	", price: 185 },
  { id: 555, name: "	PANTALLA Infinix Hot 10 Play (ORIGINAL)	", price: 200 },
  { id: 556, name: "	PANTALLA Infinix Hot 10i (ORIGINAL)	", price: 145 },
  { id: 557, name: "	PANTALLA Infinix Hot 10s (ORIGINAL)	", price: 200 },
  { id: 558, name: "	PANTALLA Infinix Hot 11 (ORIGINAL)	", price: 145 },
  { id: 559, name: "	PANTALLA Infinix Hot 11 Play (ORIGINAL)	", price: 155 },
  { id: 560, name: "	PANTALLA Infinix Hot 11S / Tecno Camon 18 / 18p (ORIGINAL)	", price: 165 },
  { id: 561, name: "	PANTALLA Infinix Hot 12i (ORIGINAL)	", price: 155 },
  { id: 562, name: "	PANTALLA Infinix Hot 8 (ORIGINAL)	", price: 155 },
  { id: 563, name: "	PANTALLA Infinix Hot 9 (ORIGINAL)	", price: 160 },
  { id: 564, name: "	PANTALLA Infinix Hot 9 Play (ORIGINAL)	", price: 170 },
  { id: 565, name: "	PANTALLA Infinix Hot 9 Pro (ORIGINAL)	", price: 215 },
  { id: 566, name: "	PANTALLA Infinix Note 11 (INCELL)	", price: 180 },
  { id: 567, name: "	PANTALLA Infinix Note 11 (OLED)	", price: 370 },
  { id: 568, name: "	PANTALLA Infinix Note 11 Pro (ORIGINAL)	", price: 215 },
  { id: 569, name: "	PANTALLA Infinix Note 12 (INCELL)	", price: 185 },
  { id: 570, name: "	PANTALLA Infinix Note 7 (ORIGINAL)	", price: 160 },
  { id: 571, name: "	PANTALLA Infinix Note 7 Lite (ORIGINAL)	", price: 190 },
  { id: 572, name: "	PANTALLA Infinix Note 8 (ORIGINAL)	", price: 190 },
  { id: 573, name: "	PANTALLA Infinix Note 8i (ORIGINAL)	", price: 160 },
  { id: 574, name: "	PANTALLA Infinix Smart 6 (ORIGINAL)	", price: 175 },
  { id: 575, name: "	PANTALLA Iphone SE 2021 (ORIGINAL)	", price: 230 },
  { id: 576, name: "	PANTALLA Lg k22 (ORIGINAL)	", price: 145 },
  { id: 577, name: "	PANTALLA Lg k4 (ORIGINAL)	", price: 105 },
  { id: 578, name: "	PANTALLA Lg k40 (ORIGINAL)	", price: 140 },
  { id: 579, name: "	PANTALLA Lg k50 (ORIGINAL)	", price: 140 },
  { id: 580, name: "	PANTALLA Lg k50s (ORIGINAL)	", price: 155 },
  { id: 581, name: "	PANTALLA Lg k9 (ORIGINAL)	", price: 115 },
  { id: 582, name: "	PANTALLA Mi 8i Pro (ORIGINAL)	", price: 365 },
  { id: 583, name: "	PANTALLA Motorola  E5 Plus (ORIGINAL)	", price: 195 },
  { id: 584, name: "	PANTALLA Motorola  E6 Plus (ORIGINAL)	", price: 160 },
  { id: 585, name: "	PANTALLA Motorola  E7 Plus (ORIGINAL)	", price: 180 },
  { id: 586, name: "	PANTALLA Motorola  G7 / G7 Plus  (ORIGINAL)	", price: 165 },
  { id: 587, name: "	PANTALLA Motorola  G8 POWER (ORIGINAL)	", price: 200 },
  { id: 588, name: "	PANTALLA Motorola  G9 POWER (ORIGINAL)	", price: 165 },
  { id: 589, name: "	PANTALLA Motorola G3 (ORIGINAL)	", price: 155 },
  { id: 590, name: "	PANTALLA Motorola G8 (ORIGINAL)	", price: 145 },
  { id: 591, name: "	PANTALLA Motorola G8 PLUS (ORIGINAL)	", price: 160 },
  { id: 592, name: "	PANTALLA Motorola One Fusion (ORIGINAL)	", price: 145 },
  { id: 593, name: "	PANTALLA Motorola Z2 (ORIGINAL)	", price: 125 },
  { id: 594, name: "	PANTALLA Motorola Z2 Play (ORIGINAL)	", price: 230 },
  { id: 595, name: "	PANTALLA NOKIA 5.1 (CON MARCO) (ORIGINAL)	", price: 180 },
  { id: 596, name: "	PANTALLA NOKIA 5.2 (ORIGINAL)	", price: 200 },
  { id: 597, name: "	PANTALLA Poco F2 Pro (INCELL)	", price: 210 },
  { id: 598, name: "	PANTALLA Pop 4 (ORIGINAL)	", price: 145 },
  { id: 599, name: "	PANTALLA Pop 4 LTE (ORIGINAL)	", price: 140 },
  { id: 600, name: "	PANTALLA Pop 5 (ORIGINAL)	", price: 150 },
  { id: 601, name: "	PANTALLA Realme 6 (ORIGINAL)	", price: 175 },
  { id: 602, name: "	PANTALLA Realme 6 Pro (ORIGINAL)	", price: 160 },
  { id: 603, name: "	PANTALLA Realme 7 (ORIGINAL)	", price: 160 },
  { id: 604, name: "	PANTALLA Realme 7 Pro (INCELL)	", price: 185 },
  { id: 605, name: "	PANTALLA Realme 7i (ORIGINAL)	", price: 210 },
  { id: 606, name: "	PANTALLA Realme 8 (5G) (ORIGINAL)	", price: 190 },
  { id: 607, name: "	PANTALLA Realme 8 Pro (INCELL)	", price: 190 },
  { id: 608, name: "	PANTALLA Realme C11 2020 (ORIGINAL)	", price: 130 },
  { id: 609, name: "	PANTALLA Realme C11 2021 / C20 / C21 (ORIGINAL)	", price: 125 },
  { id: 610, name: "	PANTALLA Realme C21Y 2021 (ORIGINAL)	", price: 125 },
  { id: 611, name: "	PANTALLA Realme C3 / C3/Realme 5 / Realme 5i / Realme 5S / Realme 6i / A8 / A11X (ORIGINAL)	", price: 170 },
  { id: 612, name: "	PANTALLA Realme C35 (ORIGINAL)	", price: 200 },
  { id: 613, name: "	PANTALLA Realme GT Master Edition (ORIGINAL)	", price: 810 },
  { id: 614, name: "	PANTALLA REDMI  NOTE 10 / NOTE 10s (4G) (INFINITO) (AMOLED)	", price: 300 },
  { id: 615, name: "	PANTALLA Redmi  Note 11s / Note 11 (4G)  / POCO M4 Pro (4G) (INCELL)	", price: 270 },
  { id: 616, name: "	PANTALLA Redmi 10 (ORIGINAL)	", price: 180 },
  { id: 617, name: "	PANTALLA Redmi 10A (ORIGINAL)	", price: 140 },
  { id: 618, name: "	PANTALLA Redmi 4A (ORIGINAL)	", price: 110 },
  { id: 619, name: "	PANTALLA Redmi 4X (ORIGINAL)	", price: 110 },
  { id: 620, name: "	PANTALLA Redmi 5 (ORIGINAL)	", price: 160 },
  { id: 621, name: "	PANTALLA Redmi 5 Plus (ORIGINAL)	", price: 165 },
  { id: 622, name: "	PANTALLA Redmi 5A (ORIGINAL)	", price: 120 },
  { id: 623, name: "	PANTALLA Redmi 6 Pro/Mi A2 lite (ORIGINAL)	", price: 155 },
  { id: 624, name: "	PANTALLA Redmi 6A / 6 (ORIGINAL)	", price: 125 },
  { id: 625, name: "	PANTALLA Redmi 7 (ORIGINAL)	", price: 140 },
  { id: 626, name: "	PANTALLA Redmi 7A (ORIGINAL)	", price: 115 },
  { id: 627, name: "	PANTALLA Redmi 8 / 8A (ORIGINAL)	", price: 135 },
  { id: 628, name: "	PANTALLA Redmi 9 (ORIGINAL)	", price: 160 },
  { id: 629, name: "	PANTALLA Redmi 9A / 9C (ORIGINAL)	", price: 170 },
  { id: 630, name: "	PANTALLA Redmi 9T / POCO M3/ NOTE  (4G) (ORIGINAL)	", price: 152 },
  { id: 631, name: "	PANTALLA Redmi Go (ORIGINAL)	", price: 115 },
  { id: 632, name: "	PANTALLA Redmi Note 10 (4G) / Note 10s (AMOLED)	", price: 270 },
  { id: 633, name: "	PANTALLA Redmi Note 10 (5G) (ORIGINAL)	", price: 165 },
  { id: 634, name: "	PANTALLA Redmi Note 10 Pro (4G) (OLED)	", price: 485 },
  { id: 635, name: "	PANTALLA Redmi Note 10 Pro (5G) (ORIGINAL)	", price: 220 },
  { id: 636, name: "	PANTALLA Redmi Note 11 (4G) / Note 11s (4G)	", price: 230 },
  { id: 637, name: "	PANTALLA Redmi Note 11 Pro (4G) (CON MARCO) (INCELL)	", price: 260 },
  { id: 638, name: "	PANTALLA Redmi Note 11 Pro (4G) (INCELL)	", price: 230 },
  { id: 639, name: "	PANTALLA Redmi Note 11s (OLED)	", price: 485 },
  { id: 640, name: "	PANTALLA Redmi Note 11s / Note 11 (4G) / POCO M4 Pro (4G) (OLED)	", price: 695 },
  { id: 641, name: "	PANTALLA Redmi Note 4 (ORIGINAL)	", price: 135 },
  { id: 642, name: "	PANTALLA Redmi Note 4X (ORIGINAL)	", price: 125 },
  { id: 643, name: "	PANTALLA Redmi Note 5/ 5 Pro (ORIGINAL)	", price: 170 },
  { id: 644, name: "	PANTALLA Redmi Note 5A/Prime (ORIGINAL)	", price: 150 },
  { id: 645, name: "	PANTALLA Redmi Note 6 / 6 Pro (ORIGINAL)	", price: 205 },
  { id: 646, name: "	PANTALLA Redmi Note 7 (ORIGINAL)	", price: 170 },
  { id: 647, name: "	PANTALLA Redmi Note 8 (ORIGINAL)	", price: 145 },
  { id: 648, name: "	PANTALLA Redmi Note 8 Pro (ORIGINAL)	", price: 165 },
  { id: 649, name: "	PANTALLA Redmi Note 9 (ORIGINAL)	", price: 160 },
  { id: 650, name: "	PANTALLA Redmi Note 9 Pro (ORIGINAL)	", price: 190 },
  { id: 651, name: "	PANTALLA Redmi Note 9s (ORIGINAL)	", price: 185 },
  { id: 652, name: "	PANTALLA Redmi S2 (ORIGINAL)	", price: 170 },
  { id: 653, name: "	PANTALLA Samsung A01 (ORIGINAL)	", price: 120 },
  { id: 654, name: "	PANTALLA Samsung A01 Core (ORIGINAL)	", price: 135 },
  { id: 655, name: "	PANTALLA Samsung A02 (CON MARCO) (ORIGINAL)	", price: 195 },
  { id: 656, name: "	PANTALLA Samsung A02 / A12 / A03S / A025F / A025M (ORIGINAL)	", price: 165 },
  { id: 657, name: "	PANTALLA Samsung A02s (ORIGINAL)	", price: 120 },
  { id: 658, name: "	PANTALLA Samsung A03 Core / A03 /A032 (ORIGINAL)	", price: 195 },
  { id: 659, name: "	PANTALLA Samsung A03 DERECHO A127 / A032F	", price: 135 },
  { id: 660, name: "	PANTALLA Samsung A03s (ORIGINAL)	", price: 180 },
  { id: 661, name: "	PANTALLA Samsung A04 (ORIGINAL)	", price: 145 },
  { id: 662, name: "	PANTALLA Samsung A10 (CON MARCO) (ORIGINAL)	", price: 125 },
  { id: 663, name: "	PANTALLA Samsung A10 (ORIGINAL)	", price: 115 },
  { id: 664, name: "	PANTALLA Samsung A10s (CON MARCO) (ORIGINAL)	", price: 155 },
  { id: 665, name: "	PANTALLA Samsung A10s (ORIGINAL)	", price: 130 },
  { id: 666, name: "	PANTALLA Samsung A11 (CON MARCO) (ORIGINAL)	", price: 160 },
  { id: 667, name: "	PANTALLA Samsung A11 (ORIGINAL)	", price: 150 },
  { id: 668, name: "	PANTALLA Samsung A12 (CON MARCO) (ORIGINAL)	", price: 160 },
  { id: 669, name: "	PANTALLA Samsung A12 (ORIGINAL)	", price: 130 },
  { id: 670, name: "	PANTALLA Samsung A12 / A02 A125 (ORIGINAL)	", price: 140 },
  { id: 671, name: "	PANTALLA Samsung A13 4G (ORIGINAL)	", price: 140 },
  { id: 672, name: "	PANTALLA Samsung A20 (AMOLED)	", price: 245 },
  { id: 673, name: "	PANTALLA Samsung A20 (AMOLED) (CON MARCO)	", price: 255 },
  { id: 674, name: "	PANTALLA Samsung A20 (INCELL)	", price: 170 },
  { id: 675, name: "	PANTALLA Samsung A20S (CON MARCO) (ORIGINAL)	", price: 140 },
  { id: 676, name: "	PANTALLA Samsung A20s (ORIGINAL)	", price: 135 },
  { id: 677, name: "	PANTALLA Samsung A21 (CON MARCO) (ORIGINAL)	", price: 175 },
  { id: 678, name: "	PANTALLA Samsung A21 (ORIGINAL)	", price: 205 },
  { id: 679, name: "	PANTALLA Samsung A21s (CON MARCO) (ORIGINAL)	", price: 200 },
  { id: 680, name: "	PANTALLA Samsung A21S (ORIGINAL)	", price: 150 },
  { id: 681, name: "	PANTALLA Samsung A22 (4G) (CON MARCO) (ORIGINAL)	", price: 525 },
  { id: 682, name: "	PANTALLA Samsung A22 (5G) (ORIGINAL)	", price: 160 },
  { id: 683, name: "	PANTALLA Samsung A3 Core / A02 Core (ORIGINAL)	", price: 235 },
  { id: 684, name: "	PANTALLA Samsung A30  (OLED)	", price: 270 },
  { id: 685, name: "	PANTALLA Samsung A30 (AMOLED)	", price: 260 },
  { id: 686, name: "	PANTALLA Samsung A30 (AMOLED) (CON MARCO)	", price: 270 },
  { id: 687, name: "	PANTALLA Samsung A30 (CON MARCO) (INCELL)	", price: 220 },
  { id: 688, name: "	PANTALLA Samsung A30 (CON MARCO) (OLED)	", price: 280 },
  { id: 689, name: "	PANTALLA Samsung A30 / A50/ A50s (INCELL)	", price: 190 },
  { id: 690, name: "	PANTALLA Samsung A30s (AMOLED)	", price: 260 },
  { id: 691, name: "	PANTALLA Samsung A30s (AMOLED) (CON MARCO)	", price: 270 },
  { id: 692, name: "	PANTALLA Samsung A30s (CON MARCO) (INCELL)	", price: 220 },
  { id: 693, name: "	PANTALLA Samsung A30s (CON MARCO) (OLED)	", price: 280 },
  { id: 694, name: "	PANTALLA Samsung A30s (OLED)	", price: 260 },
  { id: 695, name: "	PANTALLA Samsung A31 (AMOLED) (CON MARCO)	", price: 265 },
  { id: 696, name: "	PANTALLA Samsung A31 (INCELL)	", price: 225 },
  { id: 697, name: "	PANTALLA Samsung A32 (4G) (CON MARCO) (ORIGINAL) 	", price: 570 },
  { id: 698, name: "	PANTALLA Samsung A32 (5G) (ORIGINAL) 	", price: 195 },
  { id: 699, name: "	PANTALLA Samsung A50 (AMOLED)	", price: 250 },
  { id: 700, name: "	PANTALLA Samsung A50 (CON MARCO) (INCELL)	", price: 220 },
  { id: 701, name: "	PANTALLA Samsung A50 (CON MARCO) (ORIGINAL)	", price: 425 },
  { id: 702, name: "	PANTALLA Samsung A50 (OLED)	", price: 255 },
  { id: 703, name: "	PANTALLA Samsung A50 (ORIGINAL)	", price: 410 },
  { id: 704, name: "	PANTALLA Samsung A51 (AMOLED)	", price: 255 },
  { id: 705, name: "	PANTALLA Samsung A51 (CON MARCO) (INFINITO) (AMOLED) 	", price: 315 },
  { id: 706, name: "	PANTALLA Samsung A51(CON MARCO) (OLED)	", price: 265 },
  { id: 707, name: "	PANTALLA Samsung A52 (4G) (CON MARCO) (INFINITO) (AMOLED) 	", price: 455 },
  { id: 708, name: "	PANTALLA Samsung A52 (4G) (INCELL) 	", price: 320 },
  { id: 709, name: "	PANTALLA Samsung A6 Plus (AMOLED)	", price: 265 },
  { id: 710, name: "	PANTALLA Samsung A7 2017 / A720 (AMOLED)	", price: 230 },
  { id: 711, name: "	PANTALLA Samsung A7 2018 / A750 (AMOLED)	", price: 265 },
  { id: 712, name: "	PANTALLA Samsung A70  (OLED)	", price: 495 },
  { id: 713, name: "	PANTALLA Samsung A70 (CON MARCO) (AMOLED) (INFINITO)	", price: 515 },
  { id: 714, name: "	PANTALLA Samsung A70 (CON MARCO) (INCELL)	", price: 195 },
  { id: 715, name: "	PANTALLA Samsung A70 (CON MARCO) (OLED)	", price: 450 },
  { id: 716, name: "	PANTALLA Samsung A71 (AMOLED) (INFINITO)	", price: 610 },
  { id: 717, name: "	PANTALLA Samsung A71 (CON MARCO) (AMOLED) (INFINITO)	", price: 625 },
  { id: 718, name: "	PANTALLA Samsung A71 (OLED)	", price: 330 },
  { id: 719, name: "	PANTALLA Samsung A72 (CON MARCO) (OLED)	", price: 480 },
  { id: 720, name: "	PANTALLA Samsung A9 2018 (AMOLED)	", price: 260 },
  { id: 721, name: "	PANTALLA Samsung J1 Ace (INCELL)	", price: 110 },
  { id: 722, name: "	PANTALLA Samsung J2 (INCELL)	", price: 125 },
  { id: 723, name: "	PANTALLA Samsung J2 (OLED 2)	", price: 135 },
  { id: 724, name: "	PANTALLA Samsung J2 (OLED)	", price: 220 },
  { id: 725, name: "	PANTALLA Samsung J2 Core (ORIGINAL)	", price: 135 },
  { id: 726, name: " PANTALLA Samsung J2 Prime LCD (DISPLAY) (ORIGINAL)", price: 85 },
  { id: 727, name: " PANTALLA Samsung J2 Prime Touch (ORIGINAL)", price: 30 },
  { id: 728, name: "	PANTALLA Samsung J2 Pro (AMOLED)	", price: 215 },
  { id: 729, name: "	PANTALLA Samsung J2 Pro (OLED 2)	", price: 140 },
  { id: 730, name: "	PANTALLA Samsung J3 2016 (INCELL)	", price: 110 },
  { id: 731, name: "	PANTALLA Samsung J4 (AMOLED)	", price: 215 },
  { id: 732, name: "	PANTALLA Samsung J4 (INCELL)	", price: 145 },
  { id: 733, name: "	PANTALLA Samsung J4 (OLED 2)	", price: 130 },
  { id: 734, name: "	PANTALLA Samsung J5 (OLED 2)	", price: 130 },
  { id: 735, name: "	PANTALLA Samsung J5 2016 (AMOLED)	", price: 220 },
  { id: 736, name: "	PANTALLA Samsung J5 Prime (Blanco) (ORIGINAL)	", price: 130 },
  { id: 737, name: "	PANTALLA Samsung J5 Prime (Negro) (ORIGINAL)	", price: 160 },
  { id: 738, name: "	PANTALLA Samsung J5 Pro (OLED)	", price: 225 },
  { id: 739, name: "	PANTALLA Samsung J5. (OLED)	", price: 215 },
  { id: 740, name: "	PANTALLA Samsung J6 (AMOLED)	", price: 305 },
  { id: 741, name: "	PANTALLA Samsung J6 / J6 2018/ J600 (INCELL)	", price: 140 },
  { id: 742, name: "	PANTALLA Samsung J6 / J6 2018/ J600 (OLED 2)	", price: 140 },
  { id: 743, name: "	PANTALLA Samsung J6 Plus/j4 plus (ORIGINAL)	", price: 155 },
  { id: 744, name: "	PANTALLA Samsung J7 (AMOLED)	", price: 235 },
  { id: 745, name: "	PANTALLA Samsung J7 (OLED)	", price: 215 },
  { id: 746, name: "	PANTALLA Samsung J7 Duo / J720 (AMOLED)	", price: 225 },
  { id: 747, name: "	PANTALLA Samsung J7 Neo (AMOLED)	", price: 205 },
  { id: 748, name: "	PANTALLA Samsung J7 Neo (INCELL)	", price: 135 },
  { id: 749, name: "	PANTALLA Samsung J7 Neo (OLED)	", price: 225 },
  { id: 750, name: "	PANTALLA Samsung J7 Prime (Blanco) (ORIGINAL)	", price: 165 },
  { id: 751, name: "	PANTALLA Samsung J7 Prime (Negro) (ORIGINAL)	", price: 165 },
  { id: 752, name: "	PANTALLA Samsung J7 Pro / J730 / J7 2017 (AMOLED)	", price: 205 },
  { id: 753, name: "	PANTALLA Samsung J7 Pro / J730 / J7 2017 (INCELL)	", price: 170 },
  { id: 754, name: "	PANTALLA Samsung J7 Pro / J730 /J7 2017 (OLED 2)	", price: 165 },
  { id: 755, name: "	PANTALLA Samsung J7 Pro / J730 /J7 2017 (OLED)	", price: 205 },
  { id: 756, name: "	PANTALLA Samsung J710 / J7 2016 (AMOLED)	", price: 205 },
  { id: 757, name: "	PANTALLA Samsung J8 (AMOLED)	", price: 270 },
  { id: 758, name: "	PANTALLA Samsung J8 (OLED 2)	", price: 170 },
  { id: 759, name: "	PANTALLA Samsung J8 / J8 Plus/ J810/ J8 2018 (OLED)	", price: 270 },
  { id: 760, name: "	PANTALLA Samsung M20 (ORIGINAL)	", price: 170 },
  { id: 761, name: "	PANTALLA Samsung M22 (CON MARCO) (ORIGINAL)	", price: 450 },
  { id: 762, name: "	PANTALLA Samsung M31 / M21 / M30 /M30s (OLED)	", price: 250 },
  { id: 763, name: "	PANTALLA Samsung S20 FE (CON MARCO) (ORIGINAL)	", price: 800 },
  { id: 764, name: "	PANTALLA Sony XA Ultra (CON MARCO) (ORIGINAL)	", price: 185 },
  { id: 765, name: "	PANTALLA Sony XA Ultra (ORIGINAL)	", price: 165 },
  { id: 766, name: "	PANTALLA Sony XA1 Ultra (ORIGINAL)	", price: 200 },
  { id: 767, name: "	PANTALLA Sony XA2 Ultra (ORIGINAL)	", price: 230 },
  { id: 768, name: "	PANTALLA Tecno 18 Premier (ORIGINAL)	", price: 450 },
  { id: 769, name: "	PANTALLA Tecno Camon 15 (ORIGINAL)	", price: 185 },
  { id: 770, name: "	PANTALLA Tecno Camon 15 Premier (ORIGINAL)	", price: 185 },
  { id: 771, name: "	PANTALLA Tecno Camon 15 Pro (ORIGINAL)	", price: 175 },
  { id: 772, name: "	PANTALLA Tecno Camon 16 / Spark 6 / KE7 (ORIGINAL)	", price: 130 },
  { id: 773, name: "	PANTALLA Tecno Camon 16 Premier (ORIGINAL)	", price: 260 },
  { id: 774, name: "	PANTALLA Tecno Camon 17 (ORIGINAL)	", price: 200 },
  { id: 775, name: "	PANTALLA Tecno Camon 17 Pro (ORIGINAL)	", price: 175 },
  { id: 776, name: "	PANTALLA Tecno Camon 17P / CG7 (ORIGINAL)	", price: 205 },
  { id: 777, name: "	PANTALLA Tecno Camon 18 / 18p / Hot 11S (ORIGINAL)	", price: 180 },
  { id: 778, name: "	PANTALLA Tecno Camon 18 Pro (ORIGINAL)	", price: 180 },
  { id: 779, name: "	PANTALLA Tecno Pova (ORIGINAL)	", price: 125 },
  { id: 780, name: "	PANTALLA Tecno Pova 2 (ORIGINAL) || INFINIX Note 10	", price: 175 },
  { id: 781, name: "	PANTALLA Tecno Pova 3 (ORIGINAL)	", price: 240 },
  { id: 782, name: "	PANTALLA Tecno Pova Neo (ORIGINAL)	", price: 140 },
  { id: 783, name: "	PANTALLA Tecno Pova Neo 2 (ORIGINAL)	", price: 190 },
  { id: 784, name: "	PANTALLA Tecno Spark 5 (ORIGINAL)	", price: 195 },
  { id: 785, name: "	PANTALLA Tecno Spark 5 Air (ORIGINAL)	", price: 210 },
  { id: 786, name: "	PANTALLA Tecno Spark 6 (ORIGINAL)	", price: 130 },
  { id: 787, name: "	PANTALLA Tecno Spark 6 Go (ORIGINAL) || Spark 7T	", price: 120 },
  { id: 788, name: "	PANTALLA Tecno Spark 7 /Spark 7T / hot 10i (ORIGINAL)	", price: 160 },
  { id: 789, name: "	PANTALLA Tecno Spark 7 Pro (ORIGINAL)	", price: 150 },
  { id: 790, name: "	PANTALLA Tecno Spark 7T (ORIGINAL)	", price: 160 },
  { id: 791, name: "	PANTALLA Tecno Spark 8 Pro (ORIGINAL)	", price: 200 },
  { id: 792, name: "	PANTALLA Tecno Spark 8C (ORIGINAL)	", price: 125 },
  { id: 793, name: "	PANTALLA Tecno Spark 8P (ORIGINAL)	", price: 185 },
  { id: 794, name: "	PANTALLA Tecno Spark 8T (ORIGINA)	", price: 130 },
  { id: 795, name: "	PANTALLA Tecno Spark 9 (ORIGINAL)	", price: 170 },
  { id: 796, name: "	PANTALLA Tecno Spark 9 Pro (ORIGINAL)	", price: 175 },
  { id: 797, name: "	PANTALLA Tecno Spark Go 2020 (ORIGINAL)	", price: 125 },
  { id: 798, name: "	PANTALLA Tecno Spark Go 2022 (ORIGINAL)	", price: 150 },
  { id: 799, name: "	PANTALLA Xiami Mi A1 /5X (ORIGINAL)	", price: 120 },
  { id: 800, name: "	PANTALLA Xiami Mi A2/6X (ORIGINAL)	", price: 215 },
  { id: 801, name: "	PANTALLA Xiaomi  Mi 8 lite (ORIGINAL)	", price: 150 },
  { id: 802, name: "	PANTALLA Xiaomi A3 (ORIGINAL)	", price: 470 },
  { id: 803, name: "	PANTALLA Xiaomi Mi 10 LITE (OLED)	", price: 285 },
  { id: 804, name: "	PANTALLA Xiaomi Mi 11 Lite (ORIGINAL)	", price: 450 },
  { id: 805, name: "	PANTALLA Xiaomi Mi 8 (ORIGINAL)	", price: 250 },
  { id: 806, name: "	PANTALLA Xiaomi Mi 9 (OLED)	", price: 270 },
  { id: 807, name: "	PANTALLA Xiaomi Mi 9 (ORIGINAL)	", price: 410 },
  { id: 808, name: "	PANTALLA Xiaomi Mi 9 LITE (AMOLED)	", price: 280 },
  { id: 809, name: "	PANTALLA Xiaomi Mi 9T (OLED)	", price: 365 },
  { id: 810, name: "	PANTALLA Xiaomi Mi Max 3 (ORIGINAL)	", price: 220 },
  { id: 811, name: "	PANTALLA Xiaomi Mi note 10 / MI Note 10 lite/ Note 10 Pro (ORIGINAL)	", price: 280 },
  { id: 812, name: "	PANTALLA Xiaomi Mix 3 (OLED)	", price: 310 },
  { id: 813, name: "	PANTALLA Xiaomi Poco F1 (ORIGINAL)	", price: 220 },
  { id: 814, name: "	PANTALLA Xiaomi Poco F3 (INCELL)	", price: 250 },
  { id: 815, name: "	PANTALLA Xiaomi Poco M3 (ORIGINAL)	", price: 230 },
  { id: 816, name: "	PANTALLA Xiaomi Poco M4 (ORIGINAL)	", price: 245 },
  { id: 817, name: "	PANTALLA Xiaomi Poco X3 / Poco X3 Pro (ORIGINAL)	", price: 230 },
  { id: 818, name: "	PANTALLA Zte Blade A3 2020 (ORIGINAL)	", price: 160 },
  { id: 819, name: "	PANTALLA Zte Blade A31 Plus (ORIGINAL)	", price: 195 },
  { id: 820, name: "	PANTALLA Zte Blade A5 2020 (ORIGINAL)	", price: 150 },
  { id: 821, name: "	PANTALLA Zte Blade A51 (ORIGINAL)	", price: 165 },
  { id: 822, name: "	PANTALLA Zte Blade A71 (ORIGINAL)	", price: 150 },
  { id: 823, name: "	PANTALLA Zte Blade A7s 2020 (ORIGINAL)	", price: 175 },
  { id: 824, name: "	PANTALLA Zte V20 smart 6.82 (ORIGINAL)	", price: 240 },
  // { id: 825, name: "	REPARACION (REPARACION)	", price: 10 },
  // { id: 826, name: "	TABLET Samsung Galaxy Tab A 2016 7.0 ( SM-T285)	", price: 225 },
  // { id: 827, name: "	TAPA  Xiaomi Mi 8 (ORIGINAL)	", price: 35 },
  // { id: 828, name: "	TAPA Honor 8x (ORIGINAL)	", price: 35 },
  // { id: 829, name: "	TAPA Huawei Honor 10 (ORIGINAL)	", price: 45 },
  // { id: 830, name: "	TAPA Huawei Honor 10i (ORIGINAL)	", price: 40 },
  // { id: 831, name: "	TAPA Huawei Honor 9x (ORIGINAL)	", price: 45 },
  // { id: 832, name: "	TAPA Huawei Mate 20 lite (ORIGINAL)	", price: 35 },
  // { id: 833, name: "	TAPA Huawei Mate 30 (ORIGINAL)	", price: 45 },
  // { id: 834, name: "	TAPA Huawei Mate 30 Pro (ORIGINAL)	", price: 40 },
  // { id: 835, name: "	TAPA Huawei Mate 40 (ORIGINAL)	", price: 50 },
  // { id: 836, name: "	TAPA Huawei Nova 8 (ORIGINAL)	", price: 50 },
  // { id: 837, name: "	TAPA Huawei Nova 8 pro (ORIGINAL)	", price: 50 },
  // { id: 838, name: "	TAPA Huawei P smart 2020 (ORIGINAL)	", price: 30 },
  // { id: 839, name: "	TAPA Huawei P20 (ORIGINAL)	", price: 40 },
  // { id: 840, name: "	TAPA Huawei P20 lite (ORIGINAL)	", price: 30 },
  // { id: 841, name: "	TAPA Huawei P20 pro (ORIGINAL)	", price: 45 },
  // { id: 842, name: "	TAPA Huawei P30 (ORIGINAL)	", price: 50 },
  // { id: 843, name: "	TAPA Huawei P30 lite (ORIGINAL)	", price: 45 },
  // { id: 844, name: "	TAPA Huawei P30 pro (ORIGINAL)	", price: 50 },
  // { id: 845, name: "	TAPA Huawei P40 (ORIGINAL)	", price: 50 },
  // { id: 846, name: "	TAPA Huawei P40 lite (ORIGINAL)	", price: 35 },
  // { id: 847, name: "	TAPA Huawei P40 pro (ORIGINAL)	", price: 50 },
  // { id: 848, name: "	TAPA Huawei Y9 2019 (ORIGINAL)	", price: 45 },
  // { id: 849, name: "	TAPA Huawei Y9 Prime (ORIGINAL)	", price: 35 },
  // { id: 850, name: "	TAPA Realme 8 Pro (ORIGINAL)	", price: 35 },
  // { id: 851, name: "	TAPA Redmi 8 (ORIGINAL)	", price: 35 },
  // { id: 852, name: "	TAPA Redmi 8A (ORIGINAL)	", price: 35 },
  // { id: 853, name: "	TAPA Redmi Note 10s (ORIGINAL)	", price: 35 },
  // { id: 854, name: "	TAPA Samsung A02 (ORIGINAL)	", price: 25 },
  // { id: 855, name: "	TAPA Samsung A02s (ORIGINAL)	", price: 25 },
  // { id: 856, name: "	TAPA Samsung A10S (ORIGINAL)	", price: 25 },
  // { id: 857, name: "	TAPA Samsung A12 (ORIGINAL)	", price: 30 },
  // { id: 858, name: "	TAPA Samsung A20 (ORIGINAL)	", price: 30 },
  // { id: 859, name: "	TAPA Samsung A20s (ORIGINAL)	", price: 25 },
  // { id: 860, name: "	TAPA Samsung A21s (ORIGINAL)	", price: 25 },
  // { id: 861, name: "	TAPA Samsung A22 (ORIGINAL)	", price: 25 },
  // { id: 862, name: "	TAPA Samsung A31 (ORIGINAL)	", price: 30 },
  // { id: 863, name: "	TAPA Samsung A32 (ORIGINAL)	", price: 25 },
  // { id: 864, name: "	TAPA Samsung A50 (ORIGINAL)	", price: 30 },
  // { id: 865, name: "	TAPA Samsung A51 (ORIGINAL)	", price: 30 },
  // { id: 866, name: "	TAPA Samsung A52 (ORIGINAL)	", price: 25 },
  // { id: 867, name: "	TAPA Samsung A70 (ORIGINAL)	", price: 30 },
  // { id: 868, name: "	TAPA Samsung A72 (ORIGINAL)	", price: 35 },
  // { id: 869, name: "	TAPA Samsung Note 10 (ORIGINAL)	", price: 45 },
  // { id: 870, name: "	TAPA Samsung Note 10 Plus (ORIGINAL)	", price: 45 },
  // { id: 871, name: "	TAPA Samsung Note 20 (ORIGINAL)	", price: 60 },
  // { id: 872, name: "	TAPA Samsung Note 20 Plus (ORIGINAL)	", price: 55 },
  // { id: 873, name: "	TAPA Samsung Note 20 Ultra (ORIGINAL)	", price: 60 },
  // { id: 874, name: "	TAPA Samsung S10 (ORIGINAL)	", price: 45 },
  // { id: 875, name: "	TAPA Samsung S10 Plus (ORIGINAL)	", price: 45 },
  // { id: 876, name: "	TAPA Samsung S20 (ORIGINAL)	", price: 55 },
  // { id: 877, name: "	TAPA Samsung S20 FE (ORIGINAL)	", price: 50 },
  // { id: 878, name: "	TAPA Samsung S20 Plus (ORIGINAL)	", price: 55 },
  // { id: 879, name: "	TAPA Samsung S20 Ultra (ORIGINAL)	", price: 55 },
  // { id: 880, name: "	TAPA Samsung S21 (ORIGINAL)	", price: 55 },
  // { id: 881, name: "	TAPA Samsung S21 Plus (ORIGINAL)	", price: 65 },
  // { id: 882, name: "	TAPA Samsung S21 Ultra (ORIGINAL)	", price: 65 },
  // { id: 883, name: "	TAPA Tecno Spark 6 (ORIGINAL)	", price: 35 },
  // { id: 884, name: "	TAPA Tecno Spark 6 Go (ORIGINAL)	", price: 35 },
  // { id: 885, name: "	TAPA Tecno Spark 7 (ORIGINAL)	", price: 35 },
  // { id: 886, name: "	TAPA Tecno Spark 8C (ORIGINAL)	", price: 35 },
  // { id: 887, name: "	TAPA Xiaomi Mi 10 (ORIGINAL)	", price: 45 },
  // { id: 888, name: "	TAPA Xiaomi Mi 10 Lite (ORIGINAL)	", price: 35 },
  // { id: 889, name: "	TAPA Xiaomi Mi 10 Pro (ORIGINAL)	", price: 40 },
  // { id: 890, name: "	TAPA Xiaomi Mi 10T (ORIGINAL)	", price: 40 },
  // { id: 891, name: "	TAPA Xiaomi Mi 10T Pro (ORIGINAL)	", price: 40 },
  // { id: 892, name: "	TAPA Xiaomi Mi 11 (ORIGINAL)	", price: 45 },
  // { id: 893, name: "	TAPA Xiaomi Mi 11 Lite (ORIGINAL)	", price: 45 },
  // { id: 894, name: "	TAPA Xiaomi Mi 8 Lite (ORIGINAL)	", price: 35 },
  // { id: 895, name: "	TAPA Xiaomi Mi 9 (ORIGINAL)	", price: 35 },
  // { id: 896, name: "	TAPA Xiaomi Mi 9 lite (ORIGINAL)	", price: 45 },
  // { id: 897, name: "	TAPA Xiaomi Mi 9T (ORIGINAL)	", price: 40 },
  // { id: 898, name: "	TAPA Xiaomi Mi 9T Pro (ORIGINAL)	", price: 35 },
  // { id: 899, name: "	TAPA Xiaomi Mi A2 (ORIGINAL)	", price: 45 },
  // { id: 900, name: "	TAPA Xiaomi Mi A3 (ORIGINAL)	", price: 40 },
  // { id: 901, name: "	TAPA Xiaomi Mi Note 10 (ORIGINAL)	", price: 40 },
  // { id: 902, name: "	TAPA Xiaomi Mi Note 10 Pro (ORIGINAL)	", price: 40 },
  // { id: 903, name: "	TAPA Xiaomi Poco F1 (ORIGINAL)	", price: 35 },
  // { id: 904, name: "	TAPA Xiaomi Poco X3 (ORIGINAL)	", price: 35 },
  // { id: 905, name: "	TAPA Xiaomi Redmi 9 (ORIGINAL)	", price: 35 },
  // { id: 906, name: "	TAPA Xiaomi Redmi 9A (ORIGINAL)	", price: 35 },
  // { id: 907, name: "	TAPA Xiaomi Redmi 9C (ORIGINAL)	", price: 35 },
  // { id: 908, name: "	TAPA Xiaomi Redmi 9T (ORIGINAL)	", price: 35 },
  // { id: 909, name: "	TAPA Xiaomi Redmi Note 10 (ORIGINAL)	", price: 35 },
  // { id: 910, name: "	TAPA Xiaomi Redmi Note 8 (ORIGINAL)	", price: 40 },
  // { id: 911, name: "	TAPA Xiaomi Redmi Note 8 Pro (ORIGINAL)	", price: 40 },
  // { id: 912, name: "	TAPA Xiaomi Redmi Note 9 (ORIGINAL)	", price: 40 },
  // { id: 913, name: "	TAPA Xiaomi Redmi Note 9S (ORIGINAL)	", price: 40 },
  // { id: 914, name: "	TAPA Xiaomi Redmi Note 9T (ORIGINAL)	", price: 40 },
  // { id: 915, name: "	VISOR Huawei Honor 10 (ORIGINAL)	", price: 15 },
  // { id: 916, name: "	VISOR Huawei Honor 9x (ORIGINAL)	", price: 20 },
  // { id: 917, name: "	VISOR Huawei Mate 20 (ORIGINAL)	", price: 25 },
  // { id: 918, name: "	VISOR Huawei Mate 20 lite (ORIGINAL)	", price: 15 },
  // { id: 919, name: "	VISOR Huawei Mate 30 (ORIGINAL)	", price: 35 },
  // { id: 920, name: "	VISOR Huawei Mate 40 (ORIGINAL)	", price: 35 },
  // { id: 921, name: "	VISOR Huawei P20 (ORIGINAL)	", price: 15 },
  // { id: 922, name: "	VISOR Huawei P20 lite (ORIGINAL)	", price: 15 },
  // { id: 923, name: "	VISOR Huawei P20 pro (ORIGINAL)	", price: 35 },
  // { id: 924, name: "	VISOR Huawei P30 (ORIGINAL)	", price: 20 },
  // { id: 925, name: "	VISOR Huawei P30 lite (ORIGINAL)	", price: 20 },
  // { id: 926, name: "	VISOR Huawei P30 pro (ORIGINAL)	", price: 20 },
  // { id: 927, name: "	VISOR Huawei P40 (ORIGINAL)	", price: 35 },
  // { id: 928, name: "	VISOR Huawei P40 lite (ORIGINAL)	", price: 25 },
  // { id: 929, name: "	VISOR Huawei P40 pro (ORIGINAL)	", price: 35 },
  // { id: 930, name: "	VISOR Realme Realme 7 (ORIGINAL)	", price: 25 },
  // { id: 931, name: "	VISOR Realme Realme 7 Pro (ORIGINAL)	", price: 30 },
  // { id: 932, name: "	VISOR Redmi 8 / 8A (ORIGINAL)	", price: 15 },
  // { id: 933, name: "	VISOR Redmi 9 (ORIGINAL)	", price: 20 },
  // { id: 934, name: "	VISOR Redmi 9C (ORIGINAL)	", price: 25 },
  // { id: 935, name: "	VISOR Redmi 9T (ORIGINAL)	", price: 30 },
  // { id: 936, name: "	VISOR Redmi Note 10 Pro (ORIGINAL)	", price: 30 },
  // { id: 937, name: "	VISOR Redmi Note 10s (ORIGINAL)	", price: 35 },
  // { id: 938, name: "	VISOR Redmi Note 8 (ORIGINAL)	", price: 20 },
  // { id: 939, name: "	VISOR Redmi Note 8 Pro (ORIGINAL)	", price: 20 },
  // { id: 940, name: "	VISOR Redmi Note 9 (ORIGINAL)	", price: 25 },
  // { id: 941, name: "	VISOR Redmi Note 9 Pro (ORIGINAL)	", price: 25 },
  // { id: 942, name: "	VISOR Redmi Note 9T (ORIGINAL)	", price: 25 },
  // { id: 943, name: "	VISOR Samsung A10, A20, A30, A40 (ORIGINAL)	", price: 15 },
  // { id: 944, name: "	VISOR Samsung A11 (ORIGINAL)	", price: 15 },
  // { id: 945, name: "	VISOR Samsung A12 (ORIGINAL)	", price: 20 },
  // { id: 946, name: "	VISOR Samsung A80 (ORIGINAL)	", price: 20 },
  // { id: 947, name: "	VISOR Samsung J3 (ORIGINAL)	", price: 15 },
  // { id: 948, name: "	VISOR sansung A02s (ORIGINAL)	", price: 15 },
  // { id: 949, name: "	VISOR Xiaomi Mi 10 (ORIGINAL)	", price: 20 },
  // { id: 950, name: "	VISOR Xiaomi Mi 10 Lite (ORIGINAL)	", price: 30 },
  // { id: 951, name: "	VISOR Xiaomi Mi 11 (ORIGINAL)	", price: 20 },
  // { id: 952, name: "	VISOR Xiaomi Mi 11 Lite (ORIGINAL)	", price: 25 },
  // { id: 953, name: "	VISOR Xiaomi Mi 9 (ORIGINAL)	", price: 20 },
  // { id: 954, name: "	VISOR Xiaomi Mi 9 Lite (ORIGINAL)	", price: 20 },
  // { id: 955, name: "	VISOR Xiaomi Mi 9T (ORIGINAL)	", price: 15 },
  // { id: 956, name: "	VISOR Xiaomi Mi A3 (ORIGINAL)	", price: 20 },
  // { id: 957, name: "	VISOR Xiaomi Mi Note 10 (ORIGINAL)	", price: 30 },
  // { id: 958, name: "	VISOR Xiaomi Poco X3 (ORIGINAL)	", price: 30 },
  // { id: 959, name: "	VISOR Xiaomi Poco X3 Pro (ORIGINAL)	", price: 30 },
  // FIN DEL CARGDO DE DATOS //
];
// PARA CONPARAR DOS LISTAS

async function
  ordenarListas() {
  // Carga las dos listas .json en variables separadas utilizando el módulo fs
  const lista1 = JSON.parse(fs.readFileSync('lista1.json', 'utf8'));
  const lista2 = JSON.parse(fs.readFileSync('lista2.json', 'utf8'));
  console.log(JSON.stringify(lista1));
  // Genera embeddings de las descripciones de cada lista utilizando la función generarEmbedding
  async function generarEmbeddings(lista) {
    for (const elemento of lista) {
      const embedding = await generarEmbedding_(elemento.name);
      // console.log(embedding);
      elemento.embedding = embedding;
    }
  }

  async function generarEmbedding_(texto) {
    const resultado = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: texto
    });
    //   console.log(resultado.data);
    return resultado.data;

  }

  console.log(JSON.stringify(generarEmbeddings(lista1)));
  console.log(JSON.stringify(generarEmbeddings(lista2)));
  // // Genera embeddings para ambas listas de manera asíncrona
  // await Promise.all([
  //   generarEmbeddings(lista1),
  //   generarEmbeddings(lista2),
  // ]);

  // // Ordena ambas listas en función de los embeddings generados
  // console.log(lista1);
  // ordenarLista(lista1);
  // ordenarLista(lista2);

  // // Guarda las listas ordenadas en dos nuevos archivos .json utilizando el módulo fs
  // fs.writeFileSync('lista1-ordenada.json', JSON.stringify(lista1));
  // fs.writeFileSync('lista2-ordenada.json', JSON.stringify(lista2));
}



function hacerSolicitudPost(url, datos) {
  axios.post(url, {
    datos: datos
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
}

client.on('message', async msg => {

console.log('este el el id', msg.from);
//59160516920-1630611139@g.us 1
//59160516920-1630939850@g.us 3
//59175291569-1627146663@g.us 2
//59175291569-1630178079@g.us c
//59160516920-1632369605@g.us 11

   if (msg.from === '59160516920-1630611139@g.us' || msg.from === `59160516920-1630939850@g.us`  || msg.from === `59175291569-1627146663@g.us` || msg.from === `59175291569-1630178079@g.us` || msg.from === `59160516920-1632369605@g.us`) {
  console.log('ingreso de los grupos');
    hacerSolicitudPost(url_, msg.body);
    const result = hasPantalla(msg.body);
    if (result === "") {
      // msg.reply('En seguida case!')
    } else {
      msg.reply(result)
    }

  } else {
    return;
  }
  // if (msg.from === `120363093599564616@g.us`) {
  //   if (msg.body == 'case?') {
  //     msg.reply('si case!')
  //   } else {
  //     // obtenerPrecio(msg.body)
  //     // .then(respuesta => {
  //     //   console.log(respuesta);
  //     //    msg.reply(respuesta)
  //     // })
  //     // .catch(error => {
  //     //   console.error(error);
  //     // });


  //     const resultados = buscarPeliculas(msg.body, lista);
  //     //const resultado = buscarCoincidencias(lista, msg.body);
  //     //const resultado = search(msg.body);
  //     console.log("YA ESTAMOS ADENTRO");
  //     console.log(resultado);
  //     let result = ""; // Inicializar la variable de resultado como un string vacío

  //     for (let i = 0; i < resultado.length; i++) {
  //       // Concatenar el id, name y price de cada objeto en la lista
  //       result = result.concat(`name: ${resultado[i].name}, price: ${resultado[i].price}\n`);
  //     }

  //     let movieTitles = '';

  //     for (let i = 0; i < resultados.length; i++) {
  //       movieTitles = movieTitles.concat(resultados[i].title);
  //       if (i < resultados.length - 1) {
  //         movieTitles = movieTitles.concat(', ');
  //       }
  //     }
  //     msg.reply(results)
  //   }


  // }
  // if (msg.body == '!ping') {
  //   msg.reply('pong');
  // } else if (msg.body == 'good morning') {
  //   msg.reply('selamat pagi');
  // } else if (msg.body == '!groups') {
  //   client.getChats().then(chats => {
  //     const groups = chats.filter(chat => chat.isGroup);

  //     if (groups.length == 0) {
  //       msg.reply('You have no group yet.');
  //     } else {
  //       let replyMsg = '*YOUR GROUPS*\n\n';
  //       groups.forEach((group, i) => {
  //         replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
  //       });
  //       replyMsg += '_You can use the group id to send a message to the group._'
  //       msg.reply(replyMsg);
  //     }
});


// NOTE!
// UNCOMMENT THE SCRIPT BELOW IF YOU WANT TO SAVE THE MESSAGE MEDIA FILES
// Downloading media
// if (msg.hasMedia) {
//   msg.downloadMedia().then(media => {
//     // To better understanding
//     // Please look at the console what data we get
//     console.log(media);

//     if (media) {
//       // The folder to store: change as you want!
//       // Create if not exists
//       const mediaPath = './downloaded-media/';

//       if (!fs.existsSync(mediaPath)) {
//         fs.mkdirSync(mediaPath);
//       }

//       // Get the file extension by mime-type
//       const extension = mime.extension(media.mimetype);

//       // Filename: change as you want! 
//       // I will use the time for this example
//       // Why not use media.filename? Because the value is not certain exists
//       const filename = new Date().getTime();

//       const fullFilename = mediaPath + filename + '.' + extension;

//       // Save to file
//       try {
//         fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' }); 
//         console.log('File downloaded successfully!', fullFilename);
//       } catch (err) {
//         console.log('Failed to save the file:', err);
//       }
//     }
//   });
// }


client.initialize();

// Socket IO
io.on('connection', function (socket) {
  socket.emit('message', 'Connecting...');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code received, scan please!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  client.on('authenticated', () => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
    console.log('AUTHENTICATED');
  });

  client.on('auth_failure', function (session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is disconnected!');
    client.destroy();
    client.initialize();
  });
});


const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}




// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Send media
app.post('/send-media', async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  // const media = MessageMedia.fromFilePath('./image-example.png');
  // const file = req.files.file;
  // const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);
  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

const findGroupByName = async function (name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat =>
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
    );
  });
  return group;
}

// Send message to group
// You can use chatID or group name, yea!
app.post('/send-group-message', [
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  let chatId = req.body.id;
  const groupName = req.body.name;
  const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Clearing message on spesific chat
app.post('/clear-message', [
  body('number').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  const chat = await client.getChatById(number);

  chat.clearMessages().then(status => {
    res.status(200).json({
      status: true,
      response: status
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  })
});

server.listen(port, function () {
  console.log('App running on *: ' + port);
});
// const  lista = [
//   // INICIO DE CARGDO DE DATOS  //
//   {id:	1	,name:"	BANDEJA SIM Huawei MATE 20 LITE (ORIGINAL)	",price:	15	},
//   {id:	2	,name:"	BANDEJA SIM Huawei y6 2018 (ORIGINAL)	",price:	15	},
//   {id:	3	,name:"	BANDEJA SIM Huawei y6 2019 (ORIGINAL)	",price:	15	},
//   {id:	4	,name:"	BANDEJA SIM Huawei y9 2019 (ORIGINAL)	",price:	15	},
//   {id:	5	,name:"	BANDEJA SIM Huawei y9 Prime (ORIGINAL)	",price:	15	},
//   {id:	6	,name:"	BANDEJA SIM Samsung A01 Core (ORIGINAL)	",price:	15	},
//   {id:	7	,name:"	BANDEJA SIM Samsung A02 Core (ORIGINAL)	",price:	15	},
//   {id:	8	,name:"	BANDEJA SIM Samsung A11 (ORIGINAL)	",price:	15	},
//   {id:	9	,name:"	BANDEJA SIM Samsung A20 (ORIGINAL)	",price:	15	},
//   {id:	10	,name:"	BANDEJA SIM Samsung A21s (ORIGINAL)	",price:	15	},
//   {id:	11	,name:"	BANDEJA SIM Samsung A22 (ORIGINAL)	",price:	15	},
//   {id:	12	,name:"	BANDEJA SIM Samsung A31 (ORIGINAL)	",price:	15	},
//   {id:	13	,name:"	BANDEJA SIM Samsung A32 (ORIGINAL)	",price:	15	},
//   {id:	14	,name:"	BANDEJA SIM Samsung A40 (ORIGINAL)	",price:	15	},
//   {id:	15	,name:"	BANDEJA SIM Samsung A5 / A7 2017 (ORIGINAL)	",price:	15	},
//   {id:	16	,name:"	BANDEJA SIM Samsung A51 (ORIGINAL)	",price:	15	},
//   {id:	17	,name:"	BANDEJA SIM Samsung A52 (ORIGINAL)	",price:	15	},
//   {id:	18	,name:"	BANDEJA SIM Samsung A60 (ORIGINAL)	",price:	15	},
//   {id:	19	,name:"	BANDEJA SIM Samsung A7 2018 (ORIGINAL)	",price:	15	},
//   {id:	20	,name:"	BANDEJA SIM Samsung A70 (ORIGINAL)	",price:	15	},
//   {id:	21	,name:"	BANDEJA SIM Samsung A72  (ORIGINAL)	",price:	15	},
//   {id:	22	,name:"	BANDEJA SIM Samsung A8 (ORIGINAL)	",price:	15	},
//   {id:	23	,name:"	BANDEJA SIM Samsung A8 Plus	",price:	15	},
//   {id:	24	,name:"	BANDEJA SIM Samsung A9 (ORIGINAL)	",price:	15	},
//   {id:	25	,name:"	BANDEJA SIM Samsung A9 2018 (ORIGINAL)	",price:	15	},
//   {id:	26	,name:"	BANDEJA SIM Spark 6 (ORIGINAL)	",price:	15	},
//   {id:	27	,name:"	BANDEJA SIM Spark 6 Go (ORIGINAL)	",price:	15	},
//   {id:	28	,name:"	BANDEJA SIM Tecno Camon 15 (ORIGINAL)	",price:	15	},
//   {id:	29	,name:"	BANDEJA SIM Tecno Camon 16 (ORIGINAL)	",price:	15	},
//   {id:	30	,name:"	BANDEJA SIM Tecno Camon 16 Pro (ORIGINAL)	",price:	15	},
//   {id:	31	,name:"	BANDEJA SIM Tecno Camon 17 (ORIGINAL)	",price:	15	},
//   {id:	32	,name:"	BANDEJA SIM Tecno Camon 17 Pro (ORIGINAL)	",price:	15	},
//   {id:	33	,name:"	BANDEJA SIM Tecno POVA (ORIGINAL)	",price:	15	},
//   {id:	34	,name:"	BANDEJA SIM Xiaomi Poco M3 (ORIGINAL)	",price:	15	},
//   {id:	35	,name:"	BATERIA Honor Honor 10 || (ORIGINAL)	",price:	75	},
//   {id:	36	,name:"	BATERIA Honor Honor 10 lite || Huawei P Smart 2019/ Honor 10 Lite/Honor 20 Lite (ORIGINAL)	",price:	70	},
//   {id:	37	,name:"	BATERIA Honor Honor 7A || (ORIGINAL)	",price:	75	},
//   {id:	38	,name:"	BATERIA Honor Honor 7S || (ORIGINAL)	",price:	75	},
//   {id:	39	,name:"	BATERIA Honor Honor 8A || Batería Para Huawei Y6s/ Honor 8a (ORIGINAL)	",price:	75	},
//   {id:	40	,name:"	BATERIA Honor Honor 8S || Huawei Honor 6A/ Honor 8A/ Honor 8s (ORIGINAL)	",price:	75	},
//   {id:	41	,name:"	BATERIA Honor Honor 8X || Huawei Honor 8X/Honor View 10 Lite y9 2019 (ORIGINAL)	",price:	70	},
//   {id:	42	,name:"	BATERIA Honor Honor 9 || Huawei P10 / Honor 9 (ORIGINAL)	",price:	75	},
//   {id:	43	,name:"	BATERIA Honor Honor 9 lite || Huawei P9/P9 LITE/P10 Lite/P8 Lite 2017/P20 Lite/Y6 2018/Y7 2018/P Smart/Honor 8 Lite/Honor 9/Honor 9 Lite/Honor 5C 7C 7A/Nova Lite (ORIGINAL)	",price:	75	},
//   {id:	44	,name:"	BATERIA Huawei G Play mini || (ORIGINAL)	",price:	75	},
//   {id:	45	,name:"	BATERIA Huawei mate 10 lite || Bateria Huawei Mate10 Lite/Nova Plus2/ P30 Lite Original Caja (ORIGINAL)	",price:	70	},
//   {id:	46	,name:"	BATERIA Huawei mate 10 pro || Mate 10 Pro/ Mate 20 Pro/ P20 Pro/ Honor View 20 (ORIGINAL)	",price:	75	},
//   {id:	47	,name:"	BATERIA Huawei mate 30 || Huawei Honor V30/ P40 LITE/ Mate 30 (ORIGINAL)	",price:	75	},
//   {id:	48	,name:"	BATERIA Huawei Mate 7 || (ORIGINAL)	",price:	75	},
//   {id:	49	,name:"	BATERIA Huawei Mate 8 || (ORIGINAL)	",price:	65	},
//   {id:	50	,name:"	BATERIA Huawei mate 9 || Bateria Huawei Mate 9 / Mate 9 Pro / Gw Metal / Y7 Prime (ORIGINAL)	",price:	75	},
//   {id:	51	,name:"	BATERIA Huawei mate 9 pro || (ORIGINAL)	",price:	75	},
//   {id:	52	,name:"	BATERIA Huawei nova 2 || (ORIGINAL)	",price:	75	},
//   {id:	53	,name:"	BATERIA Huawei nova 3 || Huawei Mate 20 Lite /P10 Plus/ Nova 3 (ORIGINAL)	",price:	75	},
//   {id:	54	,name:"	BATERIA Huawei nova 5T || Nova 5t /Honor 20/mate 20 Lite /nova3 (ORIGINAL)	",price:	70	},
//   {id:	55	,name:"	BATERIA Huawei nova plus || Huawei Nova Plus / G9 Plus / Honor 6X (ORIGINAL)	",price:	75	},
//   {id:	56	,name:"	BATERIA Huawei P smart 2019 || Huawei P Smart 2019 / Honor 10 Lite/Honor 20i / (ORIGINAL)	",price:	65	},
//   {id:	57	,name:"	BATERIA Huawei P10 || Huawei P10 / Honor 9/ (ORIGINAL)	",price:	75	},
//   {id:	58	,name:"	BATERIA Huawei P10 lite || (ORIGINAL)	",price:	65	},
//   {id:	59	,name:"	BATERIA Huawei P20 || (ORIGINAL)	",price:	75	},
//   {id:	60	,name:"	BATERIA Huawei P20 lite || P20 Lite/P9/P9 Lite/P10 Lite/P8 Lite 2017 (ORIGINAL)	",price:	65	},
//   {id:	61	,name:"	BATERIA Huawei P20 Smart || (ORIGINAL)	",price:	75	},
//   {id:	62	,name:"	BATERIA Huawei P30 lite || P30 Lite/Honor 7X 9i/Mate 9 Lite/Nova 2 Plus/Nova 4E/Nova 2S/Mate SE (ORIGINAL)	",price:	70	},
//   {id:	63	,name:"	BATERIA Huawei P30 pro || P30 Pro/ Mate 20 Pro (ORIGINAL)	",price:	85	},
//   {id:	64	,name:"	BATERIA Huawei P8 || (ORIGINAL)	",price:	75	},
//   {id:	65	,name:"	BATERIA Huawei P8 lite || (ORIGINAL)	",price:	75	},
//   {id:	66	,name:"	BATERIA Huawei P9 || P9/P9 LITE/P10 Lite/P8 Lite 2017/P20 Lite/Y6 2018/Y7 2018/P Smart/Honor 8 Lite/Honor 9/Honor 9 Lite/Honor 5C 7C 7A/Nova Lite (ORIGINAL)	",price:	65	},
//   {id:	67	,name:"	BATERIA Huawei P9 Lite || Huawei P9 Lite/ P8 Lite 2017/ Huawei P9/ 2017/ Huawei P10 Lite/ Huawei P20 Lite/ Honor 5C/ Honor 7 Lite/ Honor 8/ Lite/ Huawei G9 Lite/ Huawei Nova 3e/ Huawei Nova Lite/ (ORIGINAL)	",price:	65	},
//   {id:	68	,name:"	BATERIA Huawei P9 Plus || (ORIGINAL)	",price:	75	},
//   {id:	69	,name:"	BATERIA Huawei P9 smart || (ORIGINAL)	",price:	75	},
//   {id:	70	,name:"	BATERIA Huawei Y5P || Huawei Y5 2017/ Y5 2018/ Y5 2019/ Y6 2019/ Y5p (ORIGINAL)	",price:	75	},
//   {id:	71	,name:"	BATERIA Huawei Y6 2019 || Y6-2019/Nova lite/ Y5-2018/ Y5-2017/ Y5 lite 2017 (ORIGINAL)	",price:	75	},
//   {id:	72	,name:"	BATERIA Huawei Y6 pro || Y6 Pro / Honor 4c / Enjoy 5 (ORIGINAL)	",price:	75	},
//   {id:	73	,name:"	BATERIA Huawei Y6P || Huawei Honor 9A/ Y6p (ORIGINAL)	",price:	75	},
//   {id:	74	,name:"	BATERIA Huawei Y7 2018 || (ORIGINAL)	",price:	75	},
//   {id:	75	,name:"	BATERIA Huawei Y7 2019 || Y7 2019/Y9 2019/Honor 8C (ORIGINAL)	",price:	70	},
//   {id:	76	,name:"	BATERIA Huawei Y7 Prime || Y7 2019 Original / Y7 Prime/ Y9 2018 (ORIGINAL)	",price:	75	},
//   {id:	77	,name:"	BATERIA Huawei Y7A || (ORIGINAL)	",price:	75	},
//   {id:	78	,name:"	BATERIA Huawei Y9 2018 || Y9 2018/ Y7 2017/ Y7 Prime/ Y7 2019/ Y7 Pro 2019/ Y9 Pro 2018/ Y9 2019/ Y9 Prime 2019/ Enjoy 7 Plus/ (ORIGINAL)	",price:	70	},
//   {id:	79	,name:"	BATERIA Huawei Y9 2019 || Y7 2019/Y9 2019/Honor 8C (ORIGINAL)	",price:	75	},
//   {id:	80	,name:"	BATERIA Huawei Y9 prime 2019 || Y9 Prime 2019 / Y9s / Honor 9x / Y9p/ y9 2019 (ORIGINAL)	",price:	80	},
//   {id:	81	,name:"	BATERIA Huawei Y9A || (ORIGINAL)	",price:	75	},
//   {id:	82	,name:"	BATERIA Huawei Y9S || Huawei Y9 Prime 2019 / Y9s / Honor 9x / Y9p (ORIGINAL)	",price:	75	},
//   {id:	83	,name:"	BATERIA Iphone Iphone 6 || (ORIGINAL)	",price:	75	},
//   {id:	84	,name:"	BATERIA Redmi mi 9 || Xiaomi 9 / MI9 / M9 / MI 9 (ORIGINAL)	",price:	75	},
//   {id:	85	,name:"	BATERIA Redmi mi 9 pro || revisar el modelo (ORIGINAL)	",price:	75	},
//   {id:	86	,name:"	BATERIA Redmi mi mix3 || (ORIGINAL)	",price:	75	},
//   {id:	87	,name:"	BATERIA Redmi Note 8 (ORIGINAL)	",price:	85	},
//   {id:	88	,name:"	BATERIA Redmi Redmi 6 || Xiaomi Redmi 6 / 6a (ORIGINAL)	",price:	75	},
//   {id:	89	,name:"	BATERIA Redmi Redmi 7A || (ORIGINAL)	",price:	75	},
//   {id:	90	,name:"	BATERIA Redmi Redmi Mi X2 || (ORIGINAL)	",price:	75	},
//   {id:	91	,name:"	BATERIA Redmi Redmi Note 5A || Bateria Xiaomi Redmi Note 5a/s2/5x/mi A1 (ORIGINAL)	",price:	75	},
//   {id:	92	,name:"	BATERIA Redmi Redmi Note 5A Prime || Xiaomi Mi A1 / Note 5A / Note 5A Prime/Redmi S2 / Redmi Y1 /Y1 Lite/Mi A1 / Mi 5X (ORIGINAL)	",price:	75	},
//   {id:	93	,name:"	BATERIA Samsung Galaxy A02 || Samsung A21S-A12-A02 (ORIGINAL)	",price:	75	},
//   {id:	94	,name:"	BATERIA Samsung Galaxy A02s || (ORIGINAL)	",price:	75	},
//   {id:	95	,name:"	BATERIA Samsung Galaxy A12 || (ORIGINAL)	",price:	75	},
//   {id:	96	,name:"	BATERIA Samsung Galaxy A20 || Samsung Galaxy A20 / A30 / A50 (ORIGINAL)	",price:	75	},
//   {id:	97	,name:"	BATERIA Samsung Galaxy A20s || Samsung GALAXY A10S / A11 / A20S / A21 (ORIGINAL)	",price:	75	},
//   {id:	98	,name:"	BATERIA Samsung Galaxy A21s || Samsung A21S-A12-A02 (ORIGINAL)	",price:	75	},
//   {id:	99	,name:"	BATERIA Samsung Galaxy A30 || Samsung Galaxy A20 / A30 / A50 (ORIGINAL)	",price:	75	},
//   {id:	100	,name:"	BATERIA Samsung Galaxy A30s || Samsung A20/ A30/ A30s/ A50 (ORIGINAL)	",price:	75	},
//   {id:	101	,name:"	BATERIA Samsung Galaxy A32 || (ORIGINAL)	",price:	75	},
//   {id:	102	,name:"	BATERIA Samsung Galaxy A5 || (ORIGINAL)	",price:	75	},
//   {id:	103	,name:"	BATERIA Samsung Galaxy A50s || (ORIGINAL)	",price:	75	},
//   {id:	104	,name:"	BATERIA Samsung Galaxy A51 || (ORIGINAL)	",price:	75	},
//   {id:	105	,name:"	BATERIA Samsung Galaxy A7 2015 || (ORIGINAL)	",price:	75	},
//   {id:	106	,name:"	BATERIA Samsung Galaxy A7 2016 || (ORIGINAL)	",price:	75	},
//   {id:	107	,name:"	BATERIA Samsung Galaxy A7 2018 || Samsung Galaxy A10 A7 2018 (ORIGINAL)	",price:	75	},
//   {id:	108	,name:"	BATERIA Samsung Galaxy A70 || (ORIGINAL)	",price:	75	},
//   {id:	109	,name:"	BATERIA Samsung Galaxy A70s || (ORIGINAL)	",price:	75	},
//   {id:	110	,name:"	BATERIA Samsung Galaxy A71 || (ORIGINAL)	",price:	75	},
//   {id:	111	,name:"	BATERIA Samsung Galaxy S10 || (ORIGINAL)	",price:	75	},
//   {id:	112	,name:"	BATERIA Samsung Galaxy S8 Plus || (ORIGINAL)	",price:	75	},
//   {id:	113	,name:"	BATERIA Samsung Galaxy S9 || (ORIGINAL)	",price:	75	},
//   {id:	114	,name:"	BATERIA Samsung note 10 || (ORIGINAL)	",price:	75	},
//   {id:	115	,name:"	BATERIA Samsung note 10 + || (ORIGINAL)	",price:	75	},
//   {id:	116	,name:"	BATERIA Samsung note 10 lite || (ORIGINAL)	",price:	75	},
//   {id:	117	,name:"	BATERIA Samsung note 8 || (ORIGINAL)	",price:	75	},
//   {id:	118	,name:"	BATERIA Samsung note 9 || (ORIGINAL)	",price:	75	},
//   {id:	119	,name:"	BATERIA Sony Sony z2 || (ORIGINAL)	",price:	75	},
//   {id:	120	,name:"	BATERIA Sony Sony z3 || (ORIGINAL)	",price:	75	},
//   {id:	121	,name:"	BATERIA Sony Sony z5 || (ORIGINAL)	",price:	75	},
//   {id:	122	,name:"	BATERIA Sony xa Ultra || (ORIGINAL)	",price:	75	},
//   {id:	123	,name:"	BATERIA Sony xa1 Ultra || (ORIGINAL)	",price:	75	},
//   {id:	124	,name:"	BATERIA Sony xa2 Ultra || (ORIGINAL)	",price:	75	},
//   {id:	125	,name:"	BATERIA Sony Z5 Premium (ORIGINAL)	",price:	70	},
//   {id:	126	,name:"	BATERIA Xiaomi mi 10 lite || (ORIGINAL)	",price:	75	},
//   {id:	127	,name:"	BATERIA Xiaomi mi 10 pro || (ORIGINAL)	",price:	75	},
//   {id:	128	,name:"	BATERIA Xiaomi mi 8 || (ORIGINAL)	",price:	75	},
//   {id:	129	,name:"	BATERIA Xiaomi mi 8 pro || (ORIGINAL)	",price:	75	},
//   {id:	130	,name:"	BATERIA Xiaomi mi 9 lite || Xiaomi CC9 / Mi 9 Lite (ORIGINAL)	",price:	75	},
//   {id:	131	,name:"	BATERIA Xiaomi mi A1 || Xiaomi Mi A1/ Mi 5X/Redmi Note 5A (ORIGINAL)	",price:	75	},
//   {id:	132	,name:"	BATERIA Xiaomi mi A2 Lite || Xiaomi A2 Lite/ Redmi 6 Pro/ mi 6X (ORIGINAL)	",price:	75	},
//   {id:	133	,name:"	BATERIA Xiaomi mi A3 Lite || (ORIGINAL)	",price:	75	},
//   {id:	134	,name:"	BATERIA Xiaomi mi max2 || (ORIGINAL)	",price:	75	},
//   {id:	135	,name:"	BATERIA Xiaomi MI Mix 2 || (ORIGINAL)	",price:	75	},
//   {id:	136	,name:"	BATERIA Xiaomi Redmi 6A || Redmi 6/ Redmi 6A (ORIGINAL)	",price:	75	},
//   {id:	137	,name:"	BATERIA Xiaomi Redmi 9 || Xiaomi Redmi 9/ Redmi Note 9 (ORIGINAL)	",price:	75	},
//   {id:	138	,name:"	BATERIA Xiaomi Redmi 9A || Xiaomi Redmi 9A/ Redmi 9C (ORIGINAL)	",price:	75	},
//   {id:	139	,name:"	BATERIA Xiaomi Redmi 9s (creo que es Redmi note 9s) || revisar (ORIGINAL)	",price:	75	},
//   {id:	140	,name:"	BATERIA Xiaomi Redmi Note 3 || Redmi Note 3/ Note 3 Pro (ORIGINAL)	",price:	75	},
//   {id:	141	,name:"	BATERIA Xiaomi Redmi Note 3 Pro || Redmi Note 3/ Note 3 Pro (ORIGINAL)	",price:	75	},
//   {id:	142	,name:"	BATERIA Xiaomi Redmi Note 8 Pro || XIAOM MI / Xiaomi MI MIX 2 / MIX 2S/ note 8 (ORIGINAL)	",price:	75	},
//   {id:	143	,name:"	CAMBIO BATERIA (CAMBIO BATERIA)	",price:	20	},
//   {id:	144	,name:"	CAMBIO PANTALLA (CAMBIO PANTALLA)	",price:	20	},
//   {id:	145	,name:"	CAMBIO VISOR 	",price:	10	},
//   {id:	146	,name:"	FLEX MAIN BOARD	",price:	30	},
//   {id:	147	,name:"	FLEX MAIN BOARD Hawei Mate 10 Lite (ORIGINAL)	",price:	20	},
//   {id:	148	,name:"	FLEX MAIN BOARD Huawei Huawei Mate 30 (ORIGINAL)	",price:	20	},
//   {id:	149	,name:"	FLEX MAIN BOARD Huawei Huawei Y7 Prime (ORIGINAL)	",price:	20	},
//   {id:	150	,name:"	FLEX MAIN BOARD Huawei Y9 2019 (ORIGINAL)	",price:	25	},
//   {id:	151	,name:"	FLEX MAIN BOARD Huawei Y9 Prime (ORIGINAL)	",price:	25	},
//   {id:	152	,name:"	FLEX MAIN BOARD Redmi 4 (ORIGINAL)	",price:	15	},
//   {id:	153	,name:"	FLEX MAIN BOARD Redmi 5 Plus (ORIGINAL)	",price:	20	},
//   {id:	154	,name:"	FLEX MAIN BOARD Redmi 5A (ORIGINAL)	",price:	15	},
//   {id:	155	,name:"	FLEX MAIN BOARD Redmi 5A Prime (ORIGINAL)	",price:	15	},
//   {id:	156	,name:"	FLEX MAIN BOARD Redmi 6A (ORIGINAL)	",price:	20	},
//   {id:	157	,name:"	FLEX MAIN BOARD Redmi Go (ORIGINAL)	",price:	15	},
//   {id:	158	,name:"	FLEX MAIN BOARD Redmi Note 10 (ORIGINAL)	",price:	25	},
//   {id:	159	,name:"	FLEX MAIN BOARD Redmi Note 10 Pro (ORIGINAL)	",price:	25	},
//   {id:	160	,name:"	FLEX MAIN BOARD Redmi Note 2 (ORIGINAL)	",price:	15	},
//   {id:	161	,name:"	FLEX MAIN BOARD Redmi Note 3 (ORIGINAL)	",price:	15	},
//   {id:	162	,name:"	FLEX MAIN BOARD Redmi Note 3 Pro (ORIGINAL)	",price:	15	},
//   {id:	163	,name:"	FLEX MAIN BOARD Redmi Note 4x (ORIGINAL)	",price:	15	},
//   {id:	164	,name:"	FLEX MAIN BOARD Redmi Note 5T (ORIGINAL)	",price:	15	},
//   {id:	165	,name:"	FLEX MAIN BOARD Redmi Note 6 Pro (ORIGINAL)	",price:	20	},
//   {id:	166	,name:"	FLEX MAIN BOARD Redmi Note 7 (ORIGINAL)	",price:	20	},
//   {id:	167	,name:"	FLEX MAIN BOARD Redmi Note 7 Pro (ORIGINAL)	",price:	20	},
//   {id:	168	,name:"	FLEX MAIN BOARD Redmi Note 8 (ORIGINAL)	",price:	20	},
//   {id:	169	,name:"	FLEX MAIN BOARD Redmi Note 9 (ORIGINAL)	",price:	20	},
//   {id:	170	,name:"	FLEX MAIN BOARD Redmi Note 9s (ORIGINAL)	",price:	20	},
//   {id:	171	,name:"	FLEX MAIN BOARD Redmi Redmi 10 (ORIGINAL)	",price:	20	},
//   {id:	172	,name:"	FLEX MAIN BOARD Redmi Redmi 9 (ORIGINAL)	",price:	20	},
//   {id:	173	,name:"	FLEX MAIN BOARD Redmi Redmi Note 10s (ORIGINAL)	",price:	25	},
//   {id:	174	,name:"	FLEX MAIN BOARD Redmi Redmi Note 11 (ORIGINAL)	",price:	25	},
//   {id:	175	,name:"	FLEX MAIN BOARD Redmi Redmi Note 11 Pro (ORIGINAL)	",price:	25	},
//   {id:	176	,name:"	FLEX MAIN BOARD Samsung A10 (ORIGINAL)	",price:	20	},
//   {id:	177	,name:"	FLEX MAIN BOARD Samsung A10s / M13 (ORIGINAL)	",price:	20	},
//   {id:	178	,name:"	FLEX MAIN BOARD Samsung A20 (ORIGINAL)	",price:	20	},
//   {id:	179	,name:"	FLEX MAIN BOARD Samsung A20s / M12 (ORIGINAL)	",price:	20	},
//   {id:	180	,name:"	FLEX MAIN BOARD Samsung A20s / M14 (ORIGINAL)	",price:	20	},
//   {id:	181	,name:"	FLEX MAIN BOARD Samsung A21 (ORIGINAL)	",price:	20	},
//   {id:	182	,name:"	FLEX MAIN BOARD Samsung A21s (ORIGINAL)	",price:	20	},
//   {id:	183	,name:"	FLEX MAIN BOARD Samsung A22 4G (ORIGINAL)	",price:	30	},
//   {id:	184	,name:"	FLEX MAIN BOARD Samsung A22 5G (ORIGINAL)	",price:	30	},
//   {id:	185	,name:"	FLEX MAIN BOARD Samsung A30 (ORIGINAL)	",price:	20	},
//   {id:	186	,name:"	FLEX MAIN BOARD Samsung A30s (ORIGINAL)	",price:	20	},
//   {id:	187	,name:"	FLEX MAIN BOARD Samsung A31 (ORIGINAL)	",price:	20	},
//   {id:	188	,name:"	FLEX MAIN BOARD Samsung A32 4G (ORIGINAL)	",price:	30	},
//   {id:	189	,name:"	FLEX MAIN BOARD Samsung A50 (ORIGINAL)	",price:	20	},
//   {id:	190	,name:"	FLEX MAIN BOARD Samsung A60 (ORIGINAL)	",price:	30	},
//   {id:	191	,name:"	FLEX MAIN BOARD Samsung a7 2018 (ORIGINAL)	",price:	20	},
//   {id:	192	,name:"	FLEX MAIN BOARD Samsung A70/A70s (ORIGINAL)	",price:	30	},
//   {id:	193	,name:"	FLEX MAIN BOARD Samsung A71 (ORIGINAL)	",price:	30	},
//   {id:	194	,name:"	FLEX MAIN BOARD Samsung A72 (ORIGINAL)	",price:	45	},
//   {id:	195	,name:"	FLEX MAIN BOARD Tecno Tecno Camon 17p (ORIGINAL)	",price:	30	},
//   {id:	196	,name:"	FLEX MAIN BOARD Tecno Tecno Camon 18p (ORIGINAL)	",price:	30	},
//   {id:	197	,name:"	FLEX MAIN BOARD Xiaomi Poco X3 (ORIGINAL)	",price:	25	},
//   {id:	198	,name:"	FLEX MAIN BOARD Xiaomi Xiaomi Poco X3 Pro (ORIGINAL)	",price:	25	},
//   {id:	199	,name:"	FLEX note7 (ORIGINAL)	",price:	25	},
//   {id:	200	,name:"	FLEX Power y volumen	",price:	20	},
//   {id:	201	,name:"	FLEX Samsung A51	",price:	30	},
//   {id:	202	,name:"	LCD FLEX Samsung A20 (ORIGINAL)	",price:	20	},
//   {id:	203	,name:"	LCD FLEX Samsung A50 (ORIGINAL)	",price:	20	},
//   {id:	204	,name:"	MANTA TERMICA	",price:	85	},
//   {id:	205	,name:"	MIKA CON OCA HUAWEI P30 PRO (ORIGINAL)	",price:	18	},
//   {id:	206	,name:"	MIKA CON OCA HUAWEI Y9 2019 (ORIGINAL)	",price:	18	},
//   {id:	207	,name:"	MIKA CON OCA HUAWEI Y9 PRIME (ORIGINAL)	",price:	18	},
//   {id:	208	,name:"	MIKA CON OCA Infinix HOT 10 (ORIGINAL)	",price:	20	},
//   {id:	209	,name:"	MIKA CON OCA Infinix HOT 10 LITE (ORIGINAL)	",price:	20	},
//   {id:	210	,name:"	MIKA CON OCA Infinix HOT 10s (ORIGINAL)	",price:	20	},
//   {id:	211	,name:"	MIKA CON OCA Infinix HOT 11 (ORIGINAL)	",price:	25	},
//   {id:	212	,name:"	MIKA CON OCA Infinix HOT 11 PLAY (ORIGINAL)	",price:	25	},
//   {id:	213	,name:"	MIKA CON OCA Infinix HOT 11s (ORIGINAL)	",price:	25	},
//   {id:	214	,name:"	MIKA CON OCA Infinix HOT 8 (ORIGINAL)	",price:	20	},
//   {id:	215	,name:"	MIKA CON OCA Infinix HOT 9 (ORIGINAL)	",price:	20	},
//   {id:	216	,name:"	MIKA CON OCA Infinix HOT 9 PLAY (ORIGINAL)	",price:	20	},
//   {id:	217	,name:"	MIKA CON OCA Infinix HOT 9 PRO (ORIGINAL)	",price:	20	},
//   {id:	218	,name:"	MIKA CON OCA Infinix Infinix HOT 12 (ORIGINAL)	",price:	25	},
//   {id:	219	,name:"	MIKA CON OCA Infinix Infinix HOT 12 PLAY (ORIGINAL)	",price:	25	},
//   {id:	220	,name:"	MIKA CON OCA Infinix NOTE 10 (ORIGINAL)	",price:	25	},
//   {id:	221	,name:"	MIKA CON OCA Infinix NOTE 11 (ORIGINAL)	",price:	25	},
//   {id:	222	,name:"	MIKA CON OCA Infinix NOTE 11 PRO (ORIGINAL)	",price:	25	},
//   {id:	223	,name:"	MIKA CON OCA Infinix NOTE 7 (ORIGINAL)	",price:	25	},
//   {id:	224	,name:"	MIKA CON OCA Infinix NOTE 7 LITE (ORIGINAL)	",price:	25	},
//   {id:	225	,name:"	MIKA CON OCA Infinix NOTE 8 (ORIGINAL)	",price:	25	},
//   {id:	226	,name:"	MIKA CON OCA Infinix NOTE 8i (ORIGINAL)	",price:	25	},
//   {id:	227	,name:"	MIKA CON OCA REALME 9i (ORIGINAL)	",price:	25	},
//   {id:	228	,name:"	MIKA CON OCA Redmi Note 10 (ORIGINAL)	",price:	18	},
//   {id:	229	,name:"	MIKA CON OCA Redmi Note 10 pro (ORIGINAL)	",price:	18	},
//   {id:	230	,name:"	MIKA CON OCA Redmi Note 8 (ORIGINAL)	",price:	18	},
//   {id:	231	,name:"	MIKA CON OCA Redmi Note 9 (ORIGINAL)	",price:	18	},
//   {id:	232	,name:"	MIKA CON OCA Redmi Note 9s (ORIGINAL)	",price:	18	},
//   {id:	233	,name:"	MIKA CON OCA Redmi REDMI 10 (ORIGINAL)	",price:	15	},
//   {id:	234	,name:"	MIKA CON OCA Redmi REDMI 10C (ORIGINAL)	",price:	18	},
//   {id:	235	,name:"	MIKA CON OCA Redmi REDMI 5 (ORIGINAL)	",price:	15	},
//   {id:	236	,name:"	MIKA CON OCA Redmi REDMI 8 (ORIGINAL)	",price:	15	},
//   {id:	237	,name:"	MIKA CON OCA Redmi REDMI 8A (ORIGINAL)	",price:	15	},
//   {id:	238	,name:"	MIKA CON OCA Redmi REDMI 9 (ORIGINAL)	",price:	15	},
//   {id:	239	,name:"	MIKA CON OCA Redmi REDMI 9A (ORIGINAL)	",price:	15	},
//   {id:	240	,name:"	MIKA CON OCA Redmi REDMI 9T (ORIGINAL)	",price:	15	},
//   {id:	241	,name:"	MIKA CON OCA Redmi REDMI NOTE 10 (5G) (ORIGINAL)	",price:	20	},
//   {id:	242	,name:"	MIKA CON OCA Redmi REDMI NOTE 10s (ORIGINAL)	",price:	20	},
//   {id:	243	,name:"	MIKA CON OCA Redmi REDMI NOTE 11 (ORIGINAL)	",price:	20	},
//   {id:	244	,name:"	MIKA CON OCA Redmi REDMI NOTE 5 (ORIGINAL)	",price:	15	},
//   {id:	245	,name:"	MIKA CON OCA Redmi REDMI NOTE 5 PRO (ORIGINAL)	",price:	15	},
//   {id:	246	,name:"	MIKA CON OCA Redmi REDMI NOTE 6 (ORIGINAL)	",price:	15	},
//   {id:	247	,name:"	MIKA CON OCA Redmi REDMI NOTE 6 PRO (ORIGINAL)	",price:	15	},
//   {id:	248	,name:"	MIKA CON OCA Redmi REDMI NOTE 8 PRO (ORIGINAL)	",price:	18	},
//   {id:	249	,name:"	MIKA CON OCA Redmi REDMI NOTE 9 (ORIGINAL)	",price:	18	},
//   {id:	250	,name:"	MIKA CON OCA Redmi REDMI NOTE 9 PRO (ORIGINAL)	",price:	18	},
//   {id:	251	,name:"	MIKA CON OCA Redmi REDMI NOTE 9S (ORIGINAL)	",price:	18	},
//   {id:	252	,name:"	MIKA CON OCA Samsung A01 core (ORIGINAL)	",price:	15	},
//   {id:	253	,name:"	MIKA CON OCA Samsung A02 (ORIGINAL)	",price:	18	},
//   {id:	254	,name:"	MIKA CON OCA Samsung A02 core (ORIGINAL)	",price:	15	},
//   {id:	255	,name:"	MIKA CON OCA Samsung A02s (ORIGINAL)	",price:	18	},
//   {id:	256	,name:"	MIKA CON OCA Samsung A03 (ORIGINAL)	",price:	15	},
//   {id:	257	,name:"	MIKA CON OCA Samsung A03s (ORIGINAL)	",price:	15	},
//   {id:	258	,name:"	MIKA CON OCA Samsung A10 (ORIGINAL)	",price:	18	},
//   {id:	259	,name:"	MIKA CON OCA Samsung A10s (ORIGINAL)	",price:	18	},
//   {id:	260	,name:"	MIKA CON OCA Samsung A11 (ORIGINAL)	",price:	18	},
//   {id:	261	,name:"	MIKA CON OCA Samsung A12 (ORIGINAL)	",price:	18	},
//   {id:	262	,name:"	MIKA CON OCA Samsung A20 (ORIGINAL)	",price:	18	},
//   {id:	263	,name:"	MIKA CON OCA Samsung A20s (ORIGINAL)	",price:	15	},
//   {id:	264	,name:"	MIKA CON OCA Samsung A21 (ORIGINAL)	",price:	15	},
//   {id:	265	,name:"	MIKA CON OCA Samsung A21s (ORIGINAL)	",price:	18	},
//   {id:	266	,name:"	MIKA CON OCA Samsung A22 (ORIGINAL)	",price:	18	},
//   {id:	267	,name:"	MIKA CON OCA Samsung A30 (ORIGINAL)	",price:	18	},
//   {id:	268	,name:"	MIKA CON OCA Samsung A30s (ORIGINAL)	",price:	18	},
//   {id:	269	,name:"	MIKA CON OCA Samsung A31 (ORIGINAL)	",price:	18	},
//   {id:	270	,name:"	MIKA CON OCA Samsung A32 (ORIGINAL)	",price:	18	},
//   {id:	271	,name:"	MIKA CON OCA Samsung A32 5G (ORIGINAL)	",price:	18	},
//   {id:	272	,name:"	MIKA CON OCA Samsung A50 (ORIGINAL)	",price:	18	},
//   {id:	273	,name:"	MIKA CON OCA Samsung A51 (ORIGINAL)	",price:	18	},
//   {id:	274	,name:"	MIKA CON OCA Samsung A70 (ORIGINAL)	",price:	18	},
//   {id:	275	,name:"	MIKA CON OCA Samsung A71 (ORIGINAL)	",price:	18	},
//   {id:	276	,name:"	MIKA CON OCA Samsung A72 (ORIGINAL)	",price:	18	},
//   {id:	277	,name:"	MIKA CON OCA Samsung A9 2018 (ORIGINAL)	",price:	18	},
//   {id:	278	,name:"	MIKA CON OCA Samsung J1 ACE TOUCH (ORIGINAL)	",price:	25	},
//   {id:	279	,name:"	MIKA CON OCA Samsung J2 CORE (ORIGINAL)	",price:	15	},
//   {id:	280	,name:"	MIKA CON OCA Samsung J4 PLUS (ORIGINAL)	",price:	15	},
//   {id:	281	,name:"	MIKA CON OCA Samsung J5 PRIME (ORIGINAL)	",price:	15	},
//   {id:	282	,name:"	MIKA CON OCA Samsung J6 (ORIGINAL)	",price:	15	},
//   {id:	283	,name:"	MIKA CON OCA Samsung J6 PLUS (ORIGINAL)	",price:	15	},
//   {id:	284	,name:"	MIKA CON OCA Samsung J7 PRIME (ORIGINAL)	",price:	15	},
//   {id:	285	,name:"	MIKA CON OCA Samsung J8 (ORIGINAL)	",price:	15	},
//   {id:	286	,name:"	MIKA CON OCA Samsung J8 PLUS (ORIGINAL)	",price:	15	},
//   {id:	287	,name:"	MIKA CON OCA Tecno CAMON 15 (ORIGINAL)	",price:	25	},
//   {id:	288	,name:"	MIKA CON OCA Tecno CAMON 15 PREMIER (ORIGINAL)	",price:	25	},
//   {id:	289	,name:"	MIKA CON OCA Tecno CAMON 15 PRO (ORIGINAL)	",price:	25	},
//   {id:	290	,name:"	MIKA CON OCA Tecno CAMON 16 (ORIGINAL)	",price:	25	},
//   {id:	291	,name:"	MIKA CON OCA Tecno CAMON 17 (ORIGINAL)	",price:	25	},
//   {id:	292	,name:"	MIKA CON OCA Tecno CAMON 17 PRO (ORIGINAL)	",price:	25	},
//   {id:	293	,name:"	MIKA CON OCA Tecno CAMON 18 (ORIGINAL)	",price:	25	},
//   {id:	294	,name:"	MIKA CON OCA Tecno CAMON 18P (ORIGINAL)	",price:	25	},
//   {id:	295	,name:"	MIKA CON OCA Tecno POVA (ORIGINAL)	",price:	25	},
//   {id:	296	,name:"	MIKA CON OCA Tecno POVA 2 (ORIGINAL)	",price:	25	},
//   {id:	297	,name:"	MIKA CON OCA Tecno POVA 3 (ORIGINAL)	",price:	25	},
//   {id:	298	,name:"	MIKA CON OCA Tecno SPARK 5 (ORIGINAL)	",price:	25	},
//   {id:	299	,name:"	MIKA CON OCA Tecno SPARK 5 air (ORIGINAL)	",price:	25	},
//   {id:	300	,name:"	MIKA CON OCA Tecno SPARK 6 (ORIGINAL)	",price:	25	},
//   {id:	301	,name:"	MIKA CON OCA Tecno SPARK 6 GO (ORIGINAL)	",price:	25	},
//   {id:	302	,name:"	MIKA CON OCA Tecno SPARK 7 (ORIGINAL)	",price:	25	},
//   {id:	303	,name:"	MIKA CON OCA Tecno SPARK 7 PRO (ORIGINAL)	",price:	25	},
//   {id:	304	,name:"	MIKA CON OCA Tecno SPARK 8 PRO (ORIGINAL)	",price:	25	},
//   {id:	305	,name:"	MIKA CON OCA Xiaomi Poco x3 (ORIGINAL)	",price:	18	},
//   {id:	306	,name:"	MIKA CON OCA ZTE A5 2020 (ORIGINAL)	",price:	25	},
//   {id:	307	,name:"	MIKA CON OCA ZTE A51 (ORIGINAL)	",price:	25	},
//   {id:	308	,name:"	MIKA CON OCA ZTE A71 (ORIGINAL)	",price:	25	},
//   {id:	309	,name:"	MIKA CON OCA ZTE A7S (ORIGINAL)	",price:	25	},
//   {id:	310	,name:"	MIKA CON OCA ZTE V20 SMART (ORIGINAL)	",price:	25	},
//   {id:	311	,name:"	MODULO Huawei Honor 10 (SEGUNDA)	",price:	30	},
//   {id:	312	,name:"	MODULO Huawei Honor 10 lite (SEGUNDA)	",price:	30	},
//   {id:	313	,name:"	MODULO Huawei Honor 20 (SEGUNDA)	",price:	30	},
//   {id:	314	,name:"	MODULO Huawei Honor 5C (SEGUNDA)	",price:	30	},
//   {id:	315	,name:"	MODULO Huawei Honor 7A (SEGUNDA)	",price:	25	},
//   {id:	316	,name:"	MODULO Huawei Honor 7S (SEGUNDA)	",price:	25	},
//   {id:	317	,name:"	MODULO Huawei Honor 7x (SEGUNDA)	",price:	25	},
//   {id:	318	,name:"	MODULO Huawei Honor 8A (SEGUNDA)	",price:	25	},
//   {id:	319	,name:"	MODULO Huawei Honor 8s (SEGUNDA)	",price:	25	},
//   {id:	320	,name:"	MODULO Huawei Honor 8x (SEGUNDA)	",price:	25	},
//   {id:	321	,name:"	MODULO Huawei Honor 9 (SEGUNDA)	",price:	25	},
//   {id:	322	,name:"	MODULO Huawei Honor 9 lite (SEGUNDA)	",price:	25	},
//   {id:	323	,name:"	MODULO Huawei Mate 10 (SEGUNDA)	",price:	25	},
//   {id:	324	,name:"	MODULO Huawei Mate 10 lite (SEGUNDA)	",price:	25	},
//   {id:	325	,name:"	MODULO Huawei Mate 20 (SEGUNDA)	",price:	25	},
//   {id:	326	,name:"	MODULO Huawei Mate 7 (SEGUNDA)	",price:	25	},
//   {id:	327	,name:"	MODULO Huawei Mate 8 (SEGUNDA)	",price:	25	},
//   {id:	328	,name:"	MODULO Huawei Mate 9 (SEGUNDA)	",price:	25	},
//   {id:	329	,name:"	MODULO Huawei Mate 9 lite (SEGUNDA)	",price:	25	},
//   {id:	330	,name:"	MODULO Huawei Mate 9 pro (SEGUNDA)	",price:	30	},
//   {id:	331	,name:"	MODULO Huawei Nova 2 (SEGUNDA)	",price:	25	},
//   {id:	332	,name:"	MODULO Huawei Nova 3 (SEGUNDA)	",price:	25	},
//   {id:	333	,name:"	MODULO Huawei Nova 5i (SEGUNDA)	",price:	25	},
//   {id:	334	,name:"	MODULO Huawei Nova 5T (SEGUNDA)	",price:	25	},
//   {id:	335	,name:"	MODULO Huawei Nova plus (SEGUNDA)	",price:	25	},
//   {id:	336	,name:"	MODULO Huawei P smart 2019 (SEGUNDA)	",price:	30	},
//   {id:	337	,name:"	MODULO Huawei P10 (SEGUNDA)	",price:	30	},
//   {id:	338	,name:"	MODULO Huawei P10 lite (SEGUNDA)	",price:	30	},
//   {id:	339	,name:"	MODULO Huawei P10 Plus (SEGUNDA)	",price:	30	},
//   {id:	340	,name:"	MODULO Huawei P20 lite (SEGUNDA)	",price:	30	},
//   {id:	341	,name:"	MODULO Huawei P30 (SEGUNDA)	",price:	35	},
//   {id:	342	,name:"	MODULO Huawei P30 lite (SEGUNDA)	",price:	30	},
//   {id:	343	,name:"	MODULO Huawei P9 (SEGUNDA)	",price:	25	},
//   {id:	344	,name:"	MODULO Huawei P9 Lite (SEGUNDA)	",price:	25	},
//   {id:	345	,name:"	MODULO Huawei P9 Plus (SEGUNDA)	",price:	25	},
//   {id:	346	,name:"	MODULO Huawei Y5P (SEGUNDA)	",price:	25	},
//   {id:	347	,name:"	MODULO Huawei Y6 2019 (SEGUNDA)	",price:	25	},
//   {id:	348	,name:"	MODULO Huawei Y6P (SEGUNDA)	",price:	25	},
//   {id:	349	,name:"	MODULO Huawei Y7 2017 (SEGUNDA)	",price:	25	},
//   {id:	350	,name:"	MODULO Huawei Y7A (SEGUNDA)	",price:	25	},
//   {id:	351	,name:"	MODULO Huawei Y7P (SEGUNDA)	",price:	25	},
//   {id:	352	,name:"	MODULO Huawei Y9 2018 (SEGUNDA)	",price:	25	},
//   {id:	353	,name:"	MODULO Huawei Y9 2019 (SEGUNDA)	",price:	30	},
//   {id:	354	,name:"	MODULO Huawei Y9 prime 2019 (SEGUNDA)	",price:	30	},
//   {id:	355	,name:"	MODULO Huawei Y9A (SEGUNDA)	",price:	25	},
//   {id:	356	,name:"	MODULO Huawei Y9s (SEGUNDA)	",price:	25	},
//   {id:	357	,name:"	MODULO Infinix Hot 10 (ORIGINAL)	",price:	35	},
//   {id:	358	,name:"	MODULO Infinix Hot 10 Lite (ORIGINAL)	",price:	35	},
//   {id:	359	,name:"	MODULO Infinix Hot 10 Play (ORIGINAL)	",price:	35	},
//   {id:	360	,name:"	MODULO Infinix Hot 11 Play (ORIGINAL)	",price:	35	},
//   {id:	361	,name:"	MODULO Infinix Hot 8 (ORIGINAL)	",price:	35	},
//   {id:	362	,name:"	MODULO Infinix Hot 9 (ORIGINAL)	",price:	35	},
//   {id:	363	,name:"	MODULO Infinix Hot 9 Play (ORIGINAL)	",price:	35	},
//   {id:	364	,name:"	MODULO Infinix Note 10 (ORIGINAL)	",price:	35	},
//   {id:	365	,name:"	MODULO Infinix Note 7  (ORIGINAL)	",price:	35	},
//   {id:	366	,name:"	MODULO Infinix Note 7 Lite (ORIGINAL)	",price:	35	},
//   {id:	367	,name:"	MODULO Infinix Note 8 (ORIGINAL)	",price:	35	},
//   {id:	368	,name:"	MODULO Realme 6 (ORIGINAL)	",price:	35	},
//   {id:	369	,name:"	MODULO Realme 6 Pro (ORIGINAL)	",price:	35	},
//   {id:	370	,name:"	MODULO Realme 7 (ORIGINAL)	",price:	35	},
//   {id:	371	,name:"	MODULO Realme 7 Pro (ORIGINAL)	",price:	35	},
//   {id:	372	,name:"	MODULO Realme 7i (ORIGINAL)	",price:	35	},
//   {id:	373	,name:"	MODULO Realme 8 Pro (ORIGINAL)	",price:	35	},
//   {id:	374	,name:"	MODULO Realme C11 2021 (ORIGINAL)	",price:	35	},
//   {id:	375	,name:"	MODULO Realme C21Y 2021 (ORIGINAL)	",price:	35	},
//   {id:	376	,name:"	MODULO Realme C3 (ORIGINAL)	",price:	35	},
//   {id:	377	,name:"	MODULO Redmi 4 (SEGUNDA)	",price:	25	},
//   {id:	378	,name:"	MODULO Redmi 4A (SEGUNDA)	",price:	25	},
//   {id:	379	,name:"	MODULO Redmi 4x (SEGUNDA)	",price:	25	},
//   {id:	380	,name:"	MODULO Redmi 5 (SEGUNDA)	",price:	25	},
//   {id:	381	,name:"	MODULO Redmi 5 Plus (SEGUNDA)	",price:	25	},
//   {id:	382	,name:"	MODULO Redmi 5A (SEGUNDA)	",price:	25	},
//   {id:	383	,name:"	MODULO Redmi 6A (SEGUNDA)	",price:	25	},
//   {id:	384	,name:"	MODULO Redmi 7 (SEGUNDA)	",price:	25	},
//   {id:	385	,name:"	MODULO Redmi 8A (SEGUNDA)	",price:	25	},
//   {id:	386	,name:"	MODULO Redmi 9 (SEGUNDA)	",price:	25	},
//   {id:	387	,name:"	MODULO Redmi 9A (SEGUNDA)	",price:	25	},
//   {id:	388	,name:"	MODULO Redmi 9C (SEGUNDA)	",price:	25	},
//   {id:	389	,name:"	MODULO Redmi 9T (SEGUNDA)	",price:	25	},
//   {id:	390	,name:"	MODULO Redmi Go (SEGUNDA)	",price:	25	},
//   {id:	391	,name:"	MODULO Redmi Note 10 (SEGUNDA)	",price:	25	},
//   {id:	392	,name:"	MODULO Redmi Note 10 Pro (SEGUNDA)	",price:	25	},
//   {id:	393	,name:"	MODULO Redmi Note 2 (SEGUNDA)	",price:	25	},
//   {id:	394	,name:"	MODULO Redmi Note 3 (SEGUNDA)	",price:	25	},
//   {id:	395	,name:"	MODULO Redmi Note 3 pro (SEGUNDA)	",price:	30	},
//   {id:	396	,name:"	MODULO Redmi Note 4x (SEGUNDA)	",price:	25	},
//   {id:	397	,name:"	MODULO Redmi Note 5 Plus (SEGUNDA)	",price:	25	},
//   {id:	398	,name:"	MODULO Redmi Note 5 pro (SEGUNDA)	",price:	25	},
//   {id:	399	,name:"	MODULO Redmi Note 5A (SEGUNDA)	",price:	25	},
//   {id:	400	,name:"	MODULO Redmi Note 5A Prime (SEGUNDA)	",price:	25	},
//   {id:	401	,name:"	MODULO Redmi Note 6 Pro (SEGUNDA)	",price:	25	},
//   {id:	402	,name:"	MODULO Redmi Note 7 (SEGUNDA)	",price:	25	},
//   {id:	403	,name:"	MODULO Redmi Note 7 Pro (SEGUNDA)	",price:	30	},
//   {id:	404	,name:"	MODULO Redmi Note 8 (SEGUNDA)	",price:	25	},
//   {id:	405	,name:"	MODULO Redmi Note 8 pro (SEGUNDA)	",price:	25	},
//   {id:	406	,name:"	MODULO Samsung A01 core (SEGUNDA)	",price:	25	},
//   {id:	407	,name:"	MODULO Samsung A10S / A107F / M15 (ORIGINAL)	",price:	80	},
//   {id:	408	,name:"	MODULO Samsung A22 4G (ORIGINAL)	",price:	120	},
//   {id:	409	,name:"	MODULO Samsung A22 4G (SEGUNDA)	",price:	25	},
//   {id:	410	,name:"	MODULO Samsung A32 (4G) / A214F (SEGUNDA)	",price:	25	},
//   {id:	411	,name:"	MODULO Samsung A32 (5G) / A215B (SEGUNDA)	",price:	25	},
//   {id:	412	,name:"	MODULO Samsung A52 (ORIGINAL)	",price:	100	},
//   {id:	413	,name:"	MODULO Samsung A80 (ORIGINAL)	",price:	120	},
//   {id:	414	,name:"	MODULO Samsung Galaxy  J5 J7 2016 J510 J710 (SEGUNDA)	",price:	5	},
//   {id:	415	,name:"	MODULO Samsung Galaxy A01 A015V Type C (SEGUNDA)	",price:	30	},
//   {id:	416	,name:"	MODULO Samsung Galaxy A02 A022 (SEGUNDA)	",price:	25	},
//   {id:	417	,name:"	MODULO Samsung Galaxy A02s A025F (SEGUNDA)	",price:	25	},
//   {id:	418	,name:"	MODULO Samsung Galaxy A10 A105F (SEGUNDA)	",price:	25	},
//   {id:	419	,name:"	MODULO Samsung Galaxy A10 A105FN (SEGUNDA)	",price:	35	},
//   {id:	420	,name:"	MODULO Samsung Galaxy A10s A107F M15 (SEGUNDA)	",price:	25	},
//   {id:	421	,name:"	MODULO Samsung Galaxy A10s A107F M16 (ORIGINAL)	",price:	80	},
//   {id:	422	,name:"	MODULO Samsung Galaxy A10s A107F M16 (SEGUNDA)	",price:	25	},
//   {id:	423	,name:"	MODULO Samsung Galaxy A11 A115F (SEGUNDA)	",price:	25	},
//   {id:	424	,name:"	MODULO Samsung Galaxy A12 A125F (ORIGINAL)	",price:	70	},
//   {id:	425	,name:"	MODULO Samsung Galaxy A12 A125F (SEGUNDA)	",price:	25	},
//   {id:	426	,name:"	MODULO Samsung Galaxy A13 (4G) / A135F (SEGUNDA)	",price:	25	},
//   {id:	427	,name:"	MODULO Samsung Galaxy A13 (5G) / A136B (SEGUNDA)	",price:	25	},
//   {id:	428	,name:"	MODULO Samsung Galaxy A13 (ORIGINAL)	",price:	80	},
//   {id:	429	,name:"	MODULO Samsung Galaxy A20 A205F (ORIGINAL)	",price:	80	},
//   {id:	430	,name:"	MODULO Samsung Galaxy A20 A205F (SEGUNDA)	",price:	25	},
//   {id:	431	,name:"	MODULO Samsung Galaxy A20s A207F M12 (ORIGINAL)	",price:	80	},
//   {id:	432	,name:"	MODULO Samsung Galaxy A20s A207F M12 (SEGUNDA)	",price:	25	},
//   {id:	433	,name:"	MODULO Samsung Galaxy A20s A207F M14 (ORIGINAL)	",price:	80	},
//   {id:	434	,name:"	MODULO Samsung Galaxy A20s A207F M14 (SEGUNDA)	",price:	25	},
//   {id:	435	,name:"	MODULO Samsung Galaxy A21s A217F (ORIGINAL)	",price:	75	},
//   {id:	436	,name:"	MODULO Samsung Galaxy A21s A217F (SEGUNDA)	",price:	25	},
//   {id:	437	,name:"	MODULO Samsung Galaxy A30 A305F (ORIGINAL)	",price:	75	},
//   {id:	438	,name:"	MODULO Samsung Galaxy A30 A305F (SEGUNDA)	",price:	25	},
//   {id:	439	,name:"	MODULO Samsung Galaxy A30s A307F (SEGUNDA)	",price:	25	},
//   {id:	440	,name:"	MODULO Samsung Galaxy A5 A500F  (SEGUNDA)	",price:	30	},
//   {id:	441	,name:"	MODULO Samsung Galaxy A50 A505F (ORIGINAL)	",price:	75	},
//   {id:	442	,name:"	MODULO Samsung Galaxy A50 A505F (SEGUNDA)	",price:	25	},
//   {id:	443	,name:"	MODULO Samsung Galaxy A50 A505U (ORIGINAL)	",price:	75	},
//   {id:	444	,name:"	MODULO Samsung Galaxy A50s A507F (SEGUNDA)	",price:	25	},
//   {id:	445	,name:"	MODULO Samsung Galaxy A51 / A515F (ORIGINAL)	",price:	75	},
//   {id:	446	,name:"	MODULO Samsung Galaxy A7 2016 A710F (SEGUNDA)	",price:	35	},
//   {id:	447	,name:"	MODULO Samsung Galaxy A7 2018 A750F (SEGUNDA)	",price:	25	},
//   {id:	448	,name:"	MODULO Samsung Galaxy A7 A700F (SEGUNDA)	",price:	30	},
//   {id:	449	,name:"	MODULO Samsung Galaxy A70 /  A70S / A705F / A707  (ORIGINAL)	",price:	120	},
//   {id:	450	,name:"	MODULO Samsung Galaxy A70 A705F (SEGUNDA)	",price:	40	},
//   {id:	451	,name:"	MODULO Samsung Galaxy A71 / A715F (ORIGINAL)	",price:	120	},
//   {id:	452	,name:"	MODULO Samsung Galaxy J3 J5 J7 2017 J330 J530 J730 (SEGUNDA)	",price:	5	},
//   {id:	453	,name:"	MODULO Samsung Galaxy S10 (SEGUNDA)	",price:	30	},
//   {id:	454	,name:"	MODULO Samsung Galaxy S6 Edge (SEGUNDA)	",price:	30	},
//   {id:	455	,name:"	MODULO Samsung Galaxy S6 Edge Plus (SEGUNDA)	",price:	30	},
//   {id:	456	,name:"	MODULO Samsung Galaxy S7 (SEGUNDA)	",price:	35	},
//   {id:	457	,name:"	MODULO Samsung Galaxy S7 Edge (SEGUNDA)	",price:	25	},
//   {id:	458	,name:"	MODULO Samsung Galaxy S8 (SEGUNDA)	",price:	30	},
//   {id:	459	,name:"	MODULO Samsung Galaxy S8 Plus (SEGUNDA)	",price:	30	},
//   {id:	460	,name:"	MODULO Samsung Galaxy S9 (SEGUNDA)	",price:	45	},
//   {id:	461	,name:"	MODULO Samsung Galaxy S9 Plus (SEGUNDA)	",price:	45	},
//   {id:	462	,name:"	MODULO Samsung Note 10 (SEGUNDA)	",price:	35	},
//   {id:	463	,name:"	MODULO Samsung Note 10+ (SEGUNDA)	",price:	35	},
//   {id:	464	,name:"	MODULO Samsung Note 8 (SEGUNDA)	",price:	30	},
//   {id:	465	,name:"	MODULO Samsung Note 9 (SEGUNDA)	",price:	30	},
//   {id:	466	,name:"	MODULO Samsung S10 Plus (SEGUNDA)	",price:	45	},
//   {id:	467	,name:"	MODULO Samsung S6 (SEGUNDA)	",price:	30	},
//   {id:	468	,name:"	MODULO Samsung Samsung Galaxy J320 J500 (SEGUNDA)	",price:	5	},
//   {id:	469	,name:"	MODULO Samsung Samsung Galaxy J700 (SEGUNDA)	",price:	5	},
//   {id:	470	,name:"	MODULO Sony Xa Ultra (SEGUNDA)	",price:	35	},
//   {id:	471	,name:"	MODULO Sony Xa1 Ultra (SEGUNDA)	",price:	30	},
//   {id:	472	,name:"	MODULO Sony Xa2 Ultra (SEGUNDA)	",price:	35	},
//   {id:	473	,name:"	MODULO Sony Z2 (SEGUNDA)	",price:	25	},
//   {id:	474	,name:"	MODULO Sony Z3 (SEGUNDA)	",price:	25	},
//   {id:	475	,name:"	MODULO Sony Z5 (SEGUNDA)	",price:	25	},
//   {id:	476	,name:"	MODULO Tecno Camon 15 (SEGUNDA)	",price:	35	},
//   {id:	477	,name:"	MODULO Tecno Camon 16 (SEGUNDA)	",price:	35	},
//   {id:	478	,name:"	MODULO Tecno Camon 16 Premier (ORIGINAL)	",price:	35	},
//   {id:	479	,name:"	MODULO Tecno Camon 17 (ORIGINAL)	",price:	35	},
//   {id:	480	,name:"	MODULO Tecno Camon 17 Pro (ORIGINAL)	",price:	35	},
//   {id:	481	,name:"	MODULO Tecno Pova (ORIGINAL)	",price:	35	},
//   {id:	482	,name:"	MODULO Tecno Pova 2 (ORIGINAL)	",price:	35	},
//   {id:	483	,name:"	MODULO Tecno Spark (SEGUNDA)	",price:	30	},
//   {id:	484	,name:"	MODULO Tecno Spark 5 (SEGUNDA)	",price:	30	},
//   {id:	485	,name:"	MODULO Tecno Spark 5 air (SEGUNDA)	",price:	30	},
//   {id:	486	,name:"	MODULO Tecno Spark 6 (ORIGINAL)	",price:	35	},
//   {id:	487	,name:"	MODULO Tecno Spark 6 go (SEGUNDA)	",price:	35	},
//   {id:	488	,name:"	MODULO Tecno Spark Go (ORIGINAL)	",price:	35	},
//   {id:	489	,name:"	MODULO Xiaomi Mi 10 lite (SEGUNDA)	",price:	30	},
//   {id:	490	,name:"	MODULO Xiaomi Mi 8 (SEGUNDA)	",price:	30	},
//   {id:	491	,name:"	MODULO Xiaomi Mi 8 Lite (SEGUNDA)	",price:	30	},
//   {id:	492	,name:"	MODULO Xiaomi Mi 9 lite (SEGUNDA)	",price:	30	},
//   {id:	493	,name:"	MODULO Xiaomi Mi 9T (SEGUNDA)	",price:	35	},
//   {id:	494	,name:"	MODULO Xiaomi Mi A1 (SEGUNDA)	",price:	35	},
//   {id:	495	,name:"	MODULO Xiaomi Mi A2 (SEGUNDA)	",price:	30	},
//   {id:	496	,name:"	MODULO Xiaomi Mi A2 lite (SEGUNDA)	",price:	30	},
//   {id:	497	,name:"	MODULO Xiaomi Mi A3 (SEGUNDA)	",price:	30	},
//   {id:	498	,name:"	MODULO Xiaomi Mi Max 2 (SEGUNDA)	",price:	35	},
//   {id:	499	,name:"	MODULO Xiaomi Mi Max 3 (SEGUNDA)	",price:	35	},
//   {id:	500	,name:"	MODULO Xiaomi Mi Mix 2 (SEGUNDA)	",price:	35	},
//   {id:	501	,name:"	MODULO Xiaomi Mi Mix 3 (SEGUNDA)	",price:	35	},
//   {id:	502	,name:"	MODULO Xiaomi Redmi 5  (SEGUNDA)	",price:	25	},
//   {id:	503	,name:"	MODULO ZTE Blade A51 (ORIGINAL)	",price:	35	},
//   {id:	504	,name:"	PANTALLA Honor 10 lite (ORIGINAL)	",price:	170	},
//   {id:	505	,name:"	PANTALLA Honor 50 lite (ORIGINAL)	",price:	170	},
//   {id:	506	,name:"	PANTALLA Honor 8 (ORIGINAL)	",price:	170	},
//   {id:	507	,name:"	PANTALLA Honor 8x (ORIGINAL)	",price:	230	},
//   {id:	508	,name:"	PANTALLA Honor 9x (ORIGINAL)	",price:	215	},
//   {id:	509	,name:"	PANTALLA Honor x6 (ORIGINAL)	",price:	165	},
//   {id:	510	,name:"	PANTALLA Honor x7 (ORIGINAL)	",price:	155	},
//   {id:	511	,name:"	PANTALLA Honor x8 (ORIGINAL)	",price:	170	},
//   {id:	512	,name:"	PANTALLA Honor x9 (ORIGINAL)	",price:	185	},
//   {id:	513	,name:"	PANTALLA Huawei Mate 10 (ORIGINAL)	",price:	255	},
//   {id:	514	,name:"	PANTALLA Huawei Mate 10 lite (ORIGINAL)	",price:	105	},
//   {id:	515	,name:"	PANTALLA Huawei Mate 10 Pro (OLED)	",price:	260	},
//   {id:	516	,name:"	PANTALLA Huawei Mate 10 Pro (ORIGINAL)	",price:	270	},
//   {id:	517	,name:"	PANTALLA Huawei Mate 20 (ORIGINAL)	",price:	330	},
//   {id:	518	,name:"	PANTALLA Huawei Mate 20 lite (ORIGINAL)	",price:	125	},
//   {id:	519	,name:"	PANTALLA Huawei Mate 8 (ORIGINAL)	",price:	170	},
//   {id:	520	,name:"	PANTALLA Huawei Mate 9 (ORIGINAL)	",price:	215	},
//   {id:	521	,name:"	PANTALLA Huawei Mate 9 lite (ORIGINAL)	",price:	125	},
//   {id:	522	,name:"	PANTALLA Huawei Nova Y60 (ORIGINAL)	",price:	135	},
//   {id:	523	,name:"	PANTALLA Huawei P smart 2020 (ORIGINAL)	",price:	210	},
//   {id:	524	,name:"	PANTALLA Huawei P10 (ORIGINAL)	",price:	165	},
//   {id:	525	,name:"	PANTALLA Huawei P10 Lite (ORIGINAL)	",price:	140	},
//   {id:	526	,name:"	PANTALLA Huawei P20 (ORIGINAL)	",price:	210	},
//   {id:	527	,name:"	PANTALLA Huawei P20 Lite (ORIGINAL)	",price:	135	},
//   {id:	528	,name:"	PANTALLA Huawei P30 (ORIGINAL)	",price:	390	},
//   {id:	529	,name:"	PANTALLA Huawei P30 Lite (ORIGINAL)	",price:	175	},
//   {id:	530	,name:"	PANTALLA Huawei P30 OLED (OLED)	",price:	400	},
//   {id:	531	,name:"	PANTALLA Huawei P30 PRO (AMOLED)	",price:	445	},
//   {id:	532	,name:"	PANTALLA Huawei P30 Pro (OLED)	",price:	420	},
//   {id:	533	,name:"	PANTALLA Huawei P40 (ORIGINAL)	",price:	610	},
//   {id:	534	,name:"	PANTALLA Huawei P40 Lite (ORIGINAL)	",price:	150	},
//   {id:	535	,name:"	PANTALLA Huawei P8 (ORIGINAL)	",price:	135	},
//   {id:	536	,name:"	PANTALLA Huawei P9 Lite (ORIGINAL)	",price:	140	},
//   {id:	537	,name:"	PANTALLA Huawei Y5 2017 / Y6 2017 (ORIGINAL)	",price:	115	},
//   {id:	538	,name:"	PANTALLA Huawei Y5 2018 (ORIGINAL)	",price:	105	},
//   {id:	539	,name:"	PANTALLA Huawei Y5 2019 (ORIGINAL)	",price:	125	},
//   {id:	540	,name:"	PANTALLA Huawei Y5 II (ORIGINAL)	",price:	110	},
//   {id:	541	,name:"	PANTALLA Huawei Y5 lite (ORIGINAL)	",price:	95	},
//   {id:	542	,name:"	PANTALLA Huawei Y6 2018 (ORIGINAL)	",price:	125	},
//   {id:	543	,name:"	PANTALLA Huawei Y6 2019 (ORIGINAL)	",price:	145	},
//   {id:	544	,name:"	PANTALLA Huawei Y6 II / 5A (ORIGINAL)	",price:	105	},
//   {id:	545	,name:"	PANTALLA Huawei Y6 PRIME 2020 / Y6P  (ORIGINAL)	",price:	120	},
//   {id:	546	,name:"	PANTALLA Huawei Y7 2017 / Y7 PRIME (ORIGINAL)	",price:	145	},
//   {id:	547	,name:"	PANTALLA Huawei Y7 2018 (ORIGINAL)	",price:	125	},
//   {id:	548	,name:"	PANTALLA Huawei Y7 2019 (ORIGINAL)	",price:	105	},
//   {id:	549	,name:"	PANTALLA Huawei Y7 PRIME 2022 / Y7p (ORIGINAL)	",price:	145	},
//   {id:	550	,name:"	PANTALLA Huawei Y7A (ORIGINAL)	",price:	180	},
//   {id:	551	,name:"	PANTALLA Huawei Y9 / Y9 2018 (ORIGINAL)	",price:	130	},
//   {id:	552	,name:"	PANTALLA Huawei Y9 2019 / Y8S (ORIGINAL)	",price:	170	},
//   {id:	553	,name:"	PANTALLA Infinix Hot 10 (ORIGINAL)	",price:	165	},
//   {id:	554	,name:"	PANTALLA Infinix Hot 10 Lite (ORIGINAL)	",price:	185	},
//   {id:	555	,name:"	PANTALLA Infinix Hot 10 Play (ORIGINAL)	",price:	200	},
//   {id:	556	,name:"	PANTALLA Infinix Hot 10i (ORIGINAL)	",price:	145	},
//   {id:	557	,name:"	PANTALLA Infinix Hot 10s (ORIGINAL)	",price:	200	},
//   {id:	558	,name:"	PANTALLA Infinix Hot 11 (ORIGINAL)	",price:	145	},
//   {id:	559	,name:"	PANTALLA Infinix Hot 11 Play (ORIGINAL)	",price:	155	},
//   {id:	560	,name:"	PANTALLA Infinix Hot 11S / Tecno Camon 18 / 18p (ORIGINAL)	",price:	165	},
//   {id:	561	,name:"	PANTALLA Infinix Hot 12i (ORIGINAL)	",price:	155	},
//   {id:	562	,name:"	PANTALLA Infinix Hot 8 (ORIGINAL)	",price:	155	},
//   {id:	563	,name:"	PANTALLA Infinix Hot 9 (ORIGINAL)	",price:	160	},
//   {id:	564	,name:"	PANTALLA Infinix Hot 9 Play (ORIGINAL)	",price:	170	},
//   {id:	565	,name:"	PANTALLA Infinix Hot 9 Pro (ORIGINAL)	",price:	215	},
//   {id:	566	,name:"	PANTALLA Infinix Note 11 (INCELL)	",price:	180	},
//   {id:	567	,name:"	PANTALLA Infinix Note 11 (OLED)	",price:	370	},
//   {id:	568	,name:"	PANTALLA Infinix Note 11 Pro (ORIGINAL)	",price:	215	},
//   {id:	569	,name:"	PANTALLA Infinix Note 12 (INCELL)	",price:	185	},
//   {id:	570	,name:"	PANTALLA Infinix Note 7 (ORIGINAL)	",price:	160	},
//   {id:	571	,name:"	PANTALLA Infinix Note 7 Lite (ORIGINAL)	",price:	190	},
//   {id:	572	,name:"	PANTALLA Infinix Note 8 (ORIGINAL)	",price:	190	},
//   {id:	573	,name:"	PANTALLA Infinix Note 8i (ORIGINAL)	",price:	160	},
//   {id:	574	,name:"	PANTALLA Infinix Smart 6 (ORIGINAL)	",price:	175	},
//   {id:	575	,name:"	PANTALLA Iphone SE 2021 (ORIGINAL)	",price:	230	},
//   {id:	576	,name:"	PANTALLA Lg k22 (ORIGINAL)	",price:	145	},
//   {id:	577	,name:"	PANTALLA Lg k4 (ORIGINAL)	",price:	105	},
//   {id:	578	,name:"	PANTALLA Lg k40 (ORIGINAL)	",price:	140	},
//   {id:	579	,name:"	PANTALLA Lg k50 (ORIGINAL)	",price:	140	},
//   {id:	580	,name:"	PANTALLA Lg k50s (ORIGINAL)	",price:	155	},
//   {id:	581	,name:"	PANTALLA Lg k9 (ORIGINAL)	",price:	115	},
//   {id:	582	,name:"	PANTALLA Mi 8i Pro (ORIGINAL)	",price:	365	},
//   {id:	583	,name:"	PANTALLA Motorola  E5 Plus (ORIGINAL)	",price:	195	},
//   {id:	584	,name:"	PANTALLA Motorola  E6 Plus (ORIGINAL)	",price:	160	},
//   {id:	585	,name:"	PANTALLA Motorola  E7 Plus (ORIGINAL)	",price:	180	},
//   {id:	586	,name:"	PANTALLA Motorola  G7 / G7 Plus  (ORIGINAL)	",price:	165	},
//   {id:	587	,name:"	PANTALLA Motorola  G8 POWER (ORIGINAL)	",price:	200	},
//   {id:	588	,name:"	PANTALLA Motorola  G9 POWER (ORIGINAL)	",price:	165	},
//   {id:	589	,name:"	PANTALLA Motorola G3 (ORIGINAL)	",price:	155	},
//   {id:	590	,name:"	PANTALLA Motorola G8 (ORIGINAL)	",price:	145	},
//   {id:	591	,name:"	PANTALLA Motorola G8 PLUS (ORIGINAL)	",price:	160	},
//   {id:	592	,name:"	PANTALLA Motorola One Fusion (ORIGINAL)	",price:	145	},
//   {id:	593	,name:"	PANTALLA Motorola Z2 (ORIGINAL)	",price:	125	},
//   {id:	594	,name:"	PANTALLA Motorola Z2 Play (ORIGINAL)	",price:	230	},
//   {id:	595	,name:"	PANTALLA NOKIA 5.1 (CON MARCO) (ORIGINAL)	",price:	180	},
//   {id:	596	,name:"	PANTALLA NOKIA 5.2 (ORIGINAL)	",price:	200	},
//   {id:	597	,name:"	PANTALLA Poco F2 Pro (INCELL)	",price:	210	},
//   {id:	598	,name:"	PANTALLA Pop 4 (ORIGINAL)	",price:	145	},
//   {id:	599	,name:"	PANTALLA Pop 4 LTE (ORIGINAL)	",price:	140	},
//   {id:	600	,name:"	PANTALLA Pop 5 (ORIGINAL)	",price:	150	},
//   {id:	601	,name:"	PANTALLA Realme 6 (ORIGINAL)	",price:	175	},
//   {id:	602	,name:"	PANTALLA Realme 6 Pro (ORIGINAL)	",price:	160	},
//   {id:	603	,name:"	PANTALLA Realme 7 (ORIGINAL)	",price:	160	},
//   {id:	604	,name:"	PANTALLA Realme 7 Pro (INCELL)	",price:	185	},
//   {id:	605	,name:"	PANTALLA Realme 7i (ORIGINAL)	",price:	210	},
//   {id:	606	,name:"	PANTALLA Realme 8 (5G) (ORIGINAL)	",price:	190	},
//   {id:	607	,name:"	PANTALLA Realme 8 Pro (INCELL)	",price:	190	},
//   {id:	608	,name:"	PANTALLA Realme C11 2020 (ORIGINAL)	",price:	130	},
//   {id:	609	,name:"	PANTALLA Realme C11 2021 / C20 / C21 (ORIGINAL)	",price:	125	},
//   {id:	610	,name:"	PANTALLA Realme C21Y 2021 (ORIGINAL)	",price:	125	},
//   {id:	611	,name:"	PANTALLA Realme C3 / C3/Realme 5 / Realme 5i / Realme 5S / Realme 6i / A8 / A11X (ORIGINAL)	",price:	170	},
//   {id:	612	,name:"	PANTALLA Realme C35 (ORIGINAL)	",price:	200	},
//   {id:	613	,name:"	PANTALLA Realme GT Master Edition (ORIGINAL)	",price:	810	},
//   {id:	614	,name:"	PANTALLA REDMI  NOTE 10 / NOTE 10s (4G) (INFINITO) (AMOLED)	",price:	300	},
//   {id:	615	,name:"	PANTALLA Redmi  Note 11s / Note 11 (4G)  / POCO M4 Pro (4G) (INCELL)	",price:	270	},
//   {id:	616	,name:"	PANTALLA Redmi 10 (ORIGINAL)	",price:	180	},
//   {id:	617	,name:"	PANTALLA Redmi 10A (ORIGINAL)	",price:	140	},
//   {id:	618	,name:"	PANTALLA Redmi 4A (ORIGINAL)	",price:	110	},
//   {id:	619	,name:"	PANTALLA Redmi 4X (ORIGINAL)	",price:	110	},
//   {id:	620	,name:"	PANTALLA Redmi 5 (ORIGINAL)	",price:	160	},
//   {id:	621	,name:"	PANTALLA Redmi 5 Plus (ORIGINAL)	",price:	165	},
//   {id:	622	,name:"	PANTALLA Redmi 5A (ORIGINAL)	",price:	120	},
//   {id:	623	,name:"	PANTALLA Redmi 6 Pro/Mi A2 lite (ORIGINAL)	",price:	155	},
//   {id:	624	,name:"	PANTALLA Redmi 6A / 6 (ORIGINAL)	",price:	125	},
//   {id:	625	,name:"	PANTALLA Redmi 7 (ORIGINAL)	",price:	140	},
//   {id:	626	,name:"	PANTALLA Redmi 7A (ORIGINAL)	",price:	115	},
//   {id:	627	,name:"	PANTALLA Redmi 8 / 8A (ORIGINAL)	",price:	135	},
//   {id:	628	,name:"	PANTALLA Redmi 9 (ORIGINAL)	",price:	160	},
//   {id:	629	,name:"	PANTALLA Redmi 9A / 9C (ORIGINAL)	",price:	170	},
//   {id:	630	,name:"	PANTALLA Redmi 9T / POCO M3/ NOTE  (4G) (ORIGINAL)	",price:	152	},
//   {id:	631	,name:"	PANTALLA Redmi Go (ORIGINAL)	",price:	115	},
//   {id:	632	,name:"	PANTALLA Redmi Note 10 (4G) / Note 10s (AMOLED)	",price:	270	},
//   {id:	633	,name:"	PANTALLA Redmi Note 10 (5G) (ORIGINAL)	",price:	165	},
//   {id:	634	,name:"	PANTALLA Redmi Note 10 Pro (4G) (OLED)	",price:	485	},
//   {id:	635	,name:"	PANTALLA Redmi Note 10 Pro (5G) (ORIGINAL)	",price:	220	},
//   {id:	636	,name:"	PANTALLA Redmi Note 11 (4G) / Note 11s (4G)	",price:	230	},
//   {id:	637	,name:"	PANTALLA Redmi Note 11 Pro (4G) (CON MARCO) (INCELL)	",price:	260	},
//   {id:	638	,name:"	PANTALLA Redmi Note 11 Pro (4G) (INCELL)	",price:	230	},
//   {id:	639	,name:"	PANTALLA Redmi Note 11s (OLED)	",price:	485	},
//   {id:	640	,name:"	PANTALLA Redmi Note 11s / Note 11 (4G) / POCO M4 Pro (4G) (OLED)	",price:	695	},
//   {id:	641	,name:"	PANTALLA Redmi Note 4 (ORIGINAL)	",price:	135	},
//   {id:	642	,name:"	PANTALLA Redmi Note 4X (ORIGINAL)	",price:	125	},
//   {id:	643	,name:"	PANTALLA Redmi Note 5/ 5 Pro (ORIGINAL)	",price:	170	},
//   {id:	644	,name:"	PANTALLA Redmi Note 5A/Prime (ORIGINAL)	",price:	150	},
//   {id:	645	,name:"	PANTALLA Redmi Note 6 / 6 Pro (ORIGINAL)	",price:	205	},
//   {id:	646	,name:"	PANTALLA Redmi Note 7 (ORIGINAL)	",price:	170	},
//   {id:	647	,name:"	PANTALLA Redmi Note 8 (ORIGINAL)	",price:	145	},
//   {id:	648	,name:"	PANTALLA Redmi Note 8 Pro (ORIGINAL)	",price:	165	},
//   {id:	649	,name:"	PANTALLA Redmi Note 9 (ORIGINAL)	",price:	160	},
//   {id:	650	,name:"	PANTALLA Redmi Note 9 Pro (ORIGINAL)	",price:	190	},
//   {id:	651	,name:"	PANTALLA Redmi Note 9s (ORIGINAL)	",price:	185	},
//   {id:	652	,name:"	PANTALLA Redmi S2 (ORIGINAL)	",price:	170	},
//   {id:	653	,name:"	PANTALLA Samsung A01 (ORIGINAL)	",price:	120	},
//   {id:	654	,name:"	PANTALLA Samsung A01 Core (ORIGINAL)	",price:	135	},
//   {id:	655	,name:"	PANTALLA Samsung A02 (CON MARCO) (ORIGINAL)	",price:	195	},
//   {id:	656	,name:"	PANTALLA Samsung A02 / A12 / A03S / A025F / A025M (ORIGINAL)	",price:	165	},
//   {id:	657	,name:"	PANTALLA Samsung A02s (ORIGINAL)	",price:	120	},
//   {id:	658	,name:"	PANTALLA Samsung A03 Core / A03 /A032 (ORIGINAL)	",price:	195	},
//   {id:	659	,name:"	PANTALLA Samsung A03 DERECHO A127 / A032F	",price:	135	},
//   {id:	660	,name:"	PANTALLA Samsung A03s (ORIGINAL)	",price:	180	},
//   {id:	661	,name:"	PANTALLA Samsung A04 (ORIGINAL)	",price:	145	},
//   {id:	662	,name:"	PANTALLA Samsung A10 (CON MARCO) (ORIGINAL)	",price:	125	},
//   {id:	663	,name:"	PANTALLA Samsung A10 (ORIGINAL)	",price:	115	},
//   {id:	664	,name:"	PANTALLA Samsung A10s (CON MARCO) (ORIGINAL)	",price:	155	},
//   {id:	665	,name:"	PANTALLA Samsung A10s (ORIGINAL)	",price:	130	},
//   {id:	666	,name:"	PANTALLA Samsung A11 (CON MARCO) (ORIGINAL)	",price:	160	},
//   {id:	667	,name:"	PANTALLA Samsung A11 (ORIGINAL)	",price:	150	},
//   {id:	668	,name:"	PANTALLA Samsung A12 (CON MARCO) (ORIGINAL)	",price:	160	},
//   {id:	669	,name:"	PANTALLA Samsung A12 (ORIGINAL)	",price:	130	},
//   {id:	670	,name:"	PANTALLA Samsung A12 / A02 A125 (ORIGINAL)	",price:	140	},
//   {id:	671	,name:"	PANTALLA Samsung A13 4G (ORIGINAL)	",price:	140	},
//   {id:	672	,name:"	PANTALLA Samsung A20 (AMOLED)	",price:	245	},
//   {id:	673	,name:"	PANTALLA Samsung A20 (AMOLED) (CON MARCO)	",price:	255	},
//   {id:	674	,name:"	PANTALLA Samsung A20 (INCELL)	",price:	170	},
//   {id:	675	,name:"	PANTALLA Samsung A20S (CON MARCO) (ORIGINAL)	",price:	140	},
//   {id:	676	,name:"	PANTALLA Samsung A20s (ORIGINAL)	",price:	135	},
//   {id:	677	,name:"	PANTALLA Samsung A21 (CON MARCO) (ORIGINAL)	",price:	175	},
//   {id:	678	,name:"	PANTALLA Samsung A21 (ORIGINAL)	",price:	205	},
//   {id:	679	,name:"	PANTALLA Samsung A21s (CON MARCO) (ORIGINAL)	",price:	200	},
//   {id:	680	,name:"	PANTALLA Samsung A21S (ORIGINAL)	",price:	150	},
//   {id:	681	,name:"	PANTALLA Samsung A22 (4G) (CON MARCO) (ORIGINAL)	",price:	525	},
//   {id:	682	,name:"	PANTALLA Samsung A22 (5G) (ORIGINAL)	",price:	160	},
//   {id:	683	,name:"	PANTALLA Samsung A3 Core / A02 Core (ORIGINAL)	",price:	235	},
//   {id:	684	,name:"	PANTALLA Samsung A30  (OLED)	",price:	270	},
//   {id:	685	,name:"	PANTALLA Samsung A30 (AMOLED)	",price:	260	},
//   {id:	686	,name:"	PANTALLA Samsung A30 (AMOLED) (CON MARCO)	",price:	270	},
//   {id:	687	,name:"	PANTALLA Samsung A30 (CON MARCO) (INCELL)	",price:	220	},
//   {id:	688	,name:"	PANTALLA Samsung A30 (CON MARCO) (OLED)	",price:	280	},
//   {id:	689	,name:"	PANTALLA Samsung A30 / A50/ A50s (INCELL)	",price:	190	},
//   {id:	690	,name:"	PANTALLA Samsung A30s (AMOLED)	",price:	260	},
//   {id:	691	,name:"	PANTALLA Samsung A30s (AMOLED) (CON MARCO)	",price:	270	},
//   {id:	692	,name:"	PANTALLA Samsung A30s (CON MARCO) (INCELL)	",price:	220	},
//   {id:	693	,name:"	PANTALLA Samsung A30s (CON MARCO) (OLED)	",price:	280	},
//   {id:	694	,name:"	PANTALLA Samsung A30s (OLED)	",price:	260	},
//   {id:	695	,name:"	PANTALLA Samsung A31 (AMOLED) (CON MARCO)	",price:	265	},
//   {id:	696	,name:"	PANTALLA Samsung A31 (INCELL)	",price:	225	},
//   {id:	697	,name:"	PANTALLA Samsung A32 (4G) (CON MARCO) (ORIGINAL) 	",price:	570	},
//   {id:	698	,name:"	PANTALLA Samsung A32 (5G) (ORIGINAL) 	",price:	195	},
//   {id:	699	,name:"	PANTALLA Samsung A50 (AMOLED)	",price:	250	},
//   {id:	700	,name:"	PANTALLA Samsung A50 (CON MARCO) (INCELL)	",price:	220	},
//   {id:	701	,name:"	PANTALLA Samsung A50 (CON MARCO) (ORIGINAL)	",price:	425	},
//   {id:	702	,name:"	PANTALLA Samsung A50 (OLED)	",price:	255	},
//   {id:	703	,name:"	PANTALLA Samsung A50 (ORIGINAL)	",price:	410	},
//   {id:	704	,name:"	PANTALLA Samsung A51 (AMOLED)	",price:	255	},
//   {id:	705	,name:"	PANTALLA Samsung A51 (CON MARCO) (INFINITO) (AMOLED) 	",price:	315	},
//   {id:	706	,name:"	PANTALLA Samsung A51(CON MARCO) (OLED)	",price:	265	},
//   {id:	707	,name:"	PANTALLA Samsung A52 (4G) (CON MARCO) (INFINITO) (AMOLED) 	",price:	455	},
//   {id:	708	,name:"	PANTALLA Samsung A52 (4G) (INCELL) 	",price:	320	},
//   {id:	709	,name:"	PANTALLA Samsung A6 Plus (AMOLED)	",price:	265	},
//   {id:	710	,name:"	PANTALLA Samsung A7 2017 / A720 (AMOLED)	",price:	230	},
//   {id:	711	,name:"	PANTALLA Samsung A7 2018 / A750 (AMOLED)	",price:	265	},
//   {id:	712	,name:"	PANTALLA Samsung A70  (OLED)	",price:	495	},
//   {id:	713	,name:"	PANTALLA Samsung A70 (CON MARCO) (AMOLED) (INFINITO)	",price:	515	},
//   {id:	714	,name:"	PANTALLA Samsung A70 (CON MARCO) (INCELL)	",price:	195	},
//   {id:	715	,name:"	PANTALLA Samsung A70 (CON MARCO) (OLED)	",price:	450	},
//   {id:	716	,name:"	PANTALLA Samsung A71 (AMOLED) (INFINITO)	",price:	610	},
//   {id:	717	,name:"	PANTALLA Samsung A71 (CON MARCO) (AMOLED) (INFINITO)	",price:	625	},
//   {id:	718	,name:"	PANTALLA Samsung A71 (OLED)	",price:	330	},
//   {id:	719	,name:"	PANTALLA Samsung A72 (CON MARCO) (OLED)	",price:	480	},
//   {id:	720	,name:"	PANTALLA Samsung A9 2018 (AMOLED)	",price:	260	},
//   {id:	721	,name:"	PANTALLA Samsung J1 Ace (INCELL)	",price:	110	},
//   {id:	722	,name:"	PANTALLA Samsung J2 (INCELL)	",price:	125	},
//   {id:	723	,name:"	PANTALLA Samsung J2 (OLED 2)	",price:	135	},
//   {id:	724	,name:"	PANTALLA Samsung J2 (OLED)	",price:	220	},
//   {id:	725	,name:"	PANTALLA Samsung J2 Core (ORIGINAL)	",price:	135	},
//   {id:	726	,name:" PANTALLA Samsung J2 Prime LCD (DISPLAY) (ORIGINAL)" ,price:	85	},
//   {id:	727	,name:" PANTALLA Samsung J2 Prime Touch (ORIGINAL)" ,price:	30	},
//   {id:	728	,name:"	PANTALLA Samsung J2 Pro (AMOLED)	",price:	215	},
//   {id:	729	,name:"	PANTALLA Samsung J2 Pro (OLED 2)	",price:	140	},
//   {id:	730	,name:"	PANTALLA Samsung J3 2016 (INCELL)	",price:	110	},
//   {id:	731	,name:"	PANTALLA Samsung J4 (AMOLED)	",price:	215	},
//   {id:	732	,name:"	PANTALLA Samsung J4 (INCELL)	",price:	145	},
//   {id:	733	,name:"	PANTALLA Samsung J4 (OLED 2)	",price:	130	},
//   {id:	734	,name:"	PANTALLA Samsung J5 (OLED 2)	",price:	130	},
//   {id:	735	,name:"	PANTALLA Samsung J5 2016 (AMOLED)	",price:	220	},
//   {id:	736	,name:"	PANTALLA Samsung J5 Prime (Blanco) (ORIGINAL)	",price:	130	},
//   {id:	737	,name:"	PANTALLA Samsung J5 Prime (Negro) (ORIGINAL)	",price:	160	},
//   {id:	738	,name:"	PANTALLA Samsung J5 Pro (OLED)	",price:	225	},
//   {id:	739	,name:"	PANTALLA Samsung J5. (OLED)	",price:	215	},
//   {id:	740	,name:"	PANTALLA Samsung J6 (AMOLED)	",price:	305	},
//   {id:	741	,name:"	PANTALLA Samsung J6 / J6 2018/ J600 (INCELL)	",price:	140	},
//   {id:	742	,name:"	PANTALLA Samsung J6 / J6 2018/ J600 (OLED 2)	",price:	140	},
//   {id:	743	,name:"	PANTALLA Samsung J6 Plus/j4 plus (ORIGINAL)	",price:	155	},
//   {id:	744	,name:"	PANTALLA Samsung J7 (AMOLED)	",price:	235	},
//   {id:	745	,name:"	PANTALLA Samsung J7 (OLED)	",price:	215	},
//   {id:	746	,name:"	PANTALLA Samsung J7 Duo / J720 (AMOLED)	",price:	225	},
//   {id:	747	,name:"	PANTALLA Samsung J7 Neo (AMOLED)	",price:	205	},
//   {id:	748	,name:"	PANTALLA Samsung J7 Neo (INCELL)	",price:	135	},
//   {id:	749	,name:"	PANTALLA Samsung J7 Neo (OLED)	",price:	225	},
//   {id:	750	,name:"	PANTALLA Samsung J7 Prime (Blanco) (ORIGINAL)	",price:	165	},
//   {id:	751	,name:"	PANTALLA Samsung J7 Prime (Negro) (ORIGINAL)	",price:	165	},
//   {id:	752	,name:"	PANTALLA Samsung J7 Pro / J730 / J7 2017 (AMOLED)	",price:	205	},
//   {id:	753	,name:"	PANTALLA Samsung J7 Pro / J730 / J7 2017 (INCELL)	",price:	170	},
//   {id:	754	,name:"	PANTALLA Samsung J7 Pro / J730 /J7 2017 (OLED 2)	",price:	165	},
//   {id:	755	,name:"	PANTALLA Samsung J7 Pro / J730 /J7 2017 (OLED)	",price:	205	},
//   {id:	756	,name:"	PANTALLA Samsung J710 / J7 2016 (AMOLED)	",price:	205	},
//   {id:	757	,name:"	PANTALLA Samsung J8 (AMOLED)	",price:	270	},
//   {id:	758	,name:"	PANTALLA Samsung J8 (OLED 2)	",price:	170	},
//   {id:	759	,name:"	PANTALLA Samsung J8 / J8 Plus/ J810/ J8 2018 (OLED)	",price:	270	},
//   {id:	760	,name:"	PANTALLA Samsung M20 (ORIGINAL)	",price:	170	},
//   {id:	761	,name:"	PANTALLA Samsung M22 (CON MARCO) (ORIGINAL)	",price:	450	},
//   {id:	762	,name:"	PANTALLA Samsung M31 / M21 / M30 /M30s (OLED)	",price:	250	},
//   {id:	763	,name:"	PANTALLA Samsung S20 FE (CON MARCO) (ORIGINAL)	",price:	800	},
//   {id:	764	,name:"	PANTALLA Sony XA Ultra (CON MARCO) (ORIGINAL)	",price:	185	},
//   {id:	765	,name:"	PANTALLA Sony XA Ultra (ORIGINAL)	",price:	165	},
//   {id:	766	,name:"	PANTALLA Sony XA1 Ultra (ORIGINAL)	",price:	200	},
//   {id:	767	,name:"	PANTALLA Sony XA2 Ultra (ORIGINAL)	",price:	230	},
//   {id:	768	,name:"	PANTALLA Tecno 18 Premier (ORIGINAL)	",price:	450	},
//   {id:	769	,name:"	PANTALLA Tecno Camon 15 (ORIGINAL)	",price:	185	},
//   {id:	770	,name:"	PANTALLA Tecno Camon 15 Premier (ORIGINAL)	",price:	185	},
//   {id:	771	,name:"	PANTALLA Tecno Camon 15 Pro (ORIGINAL)	",price:	175	},
//   {id:	772	,name:"	PANTALLA Tecno Camon 16 / Spark 6 / KE7 (ORIGINAL)	",price:	130	},
//   {id:	773	,name:"	PANTALLA Tecno Camon 16 Premier (ORIGINAL)	",price:	260	},
//   {id:	774	,name:"	PANTALLA Tecno Camon 17 (ORIGINAL)	",price:	200	},
//   {id:	775	,name:"	PANTALLA Tecno Camon 17 Pro (ORIGINAL)	",price:	175	},
//   {id:	776	,name:"	PANTALLA Tecno Camon 17P / CG7 (ORIGINAL)	",price:	205	},
//   {id:	777	,name:"	PANTALLA Tecno Camon 18 / 18p / Hot 11S (ORIGINAL)	",price:	180	},
//   {id:	778	,name:"	PANTALLA Tecno Camon 18 Pro (ORIGINAL)	",price:	180	},
//   {id:	779	,name:"	PANTALLA Tecno Pova (ORIGINAL)	",price:	125	},
//   {id:	780	,name:"	PANTALLA Tecno Pova 2 (ORIGINAL) || INFINIX Note 10	",price:	175	},
//   {id:	781	,name:"	PANTALLA Tecno Pova 3 (ORIGINAL)	",price:	240	},
//   {id:	782	,name:"	PANTALLA Tecno Pova Neo (ORIGINAL)	",price:	140	},
//   {id:	783	,name:"	PANTALLA Tecno Pova Neo 2 (ORIGINAL)	",price:	190	},
//   {id:	784	,name:"	PANTALLA Tecno Spark 5 (ORIGINAL)	",price:	195	},
//   {id:	785	,name:"	PANTALLA Tecno Spark 5 Air (ORIGINAL)	",price:	210	},
//   {id:	786	,name:"	PANTALLA Tecno Spark 6 (ORIGINAL)	",price:	130	},
//   {id:	787	,name:"	PANTALLA Tecno Spark 6 Go (ORIGINAL) || Spark 7T	",price:	120	},
//   {id:	788	,name:"	PANTALLA Tecno Spark 7 /Spark 7T / hot 10i (ORIGINAL)	",price:	160	},
//   {id:	789	,name:"	PANTALLA Tecno Spark 7 Pro (ORIGINAL)	",price:	150	},
//   {id:	790	,name:"	PANTALLA Tecno Spark 7T (ORIGINAL)	",price:	160	},
//   {id:	791	,name:"	PANTALLA Tecno Spark 8 Pro (ORIGINAL)	",price:	200	},
//   {id:	792	,name:"	PANTALLA Tecno Spark 8C (ORIGINAL)	",price:	125	},
//   {id:	793	,name:"	PANTALLA Tecno Spark 8P (ORIGINAL)	",price:	185	},
//   {id:	794	,name:"	PANTALLA Tecno Spark 8T (ORIGINA)	",price:	130	},
//   {id:	795	,name:"	PANTALLA Tecno Spark 9 (ORIGINAL)	",price:	170	},
//   {id:	796	,name:"	PANTALLA Tecno Spark 9 Pro (ORIGINAL)	",price:	175	},
//   {id:	797	,name:"	PANTALLA Tecno Spark Go 2020 (ORIGINAL)	",price:	125	},
//   {id:	798	,name:"	PANTALLA Tecno Spark Go 2022 (ORIGINAL)	",price:	150	},
//   {id:	799	,name:"	PANTALLA Xiami Mi A1 /5X (ORIGINAL)	",price:	120	},
//   {id:	800	,name:"	PANTALLA Xiami Mi A2/6X (ORIGINAL)	",price:	215	},
//   {id:	801	,name:"	PANTALLA Xiaomi  Mi 8 lite (ORIGINAL)	",price:	150	},
//   {id:	802	,name:"	PANTALLA Xiaomi A3 (ORIGINAL)	",price:	470	},
//   {id:	803	,name:"	PANTALLA Xiaomi Mi 10 LITE (OLED)	",price:	285	},
//   {id:	804	,name:"	PANTALLA Xiaomi Mi 11 Lite (ORIGINAL)	",price:	450	},
//   {id:	805	,name:"	PANTALLA Xiaomi Mi 8 (ORIGINAL)	",price:	250	},
//   {id:	806	,name:"	PANTALLA Xiaomi Mi 9 (OLED)	",price:	270	},
//   {id:	807	,name:"	PANTALLA Xiaomi Mi 9 (ORIGINAL)	",price:	410	},
//   {id:	808	,name:"	PANTALLA Xiaomi Mi 9 LITE (AMOLED)	",price:	280	},
//   {id:	809	,name:"	PANTALLA Xiaomi Mi 9T (OLED)	",price:	365	},
//   {id:	810	,name:"	PANTALLA Xiaomi Mi Max 3 (ORIGINAL)	",price:	220	},
//   {id:	811	,name:"	PANTALLA Xiaomi Mi note 10 / MI Note 10 lite/ Note 10 Pro (ORIGINAL)	",price:	280	},
//   {id:	812	,name:"	PANTALLA Xiaomi Mix 3 (OLED)	",price:	310	},
//   {id:	813	,name:"	PANTALLA Xiaomi Poco F1 (ORIGINAL)	",price:	220	},
//   {id:	814	,name:"	PANTALLA Xiaomi Poco F3 (INCELL)	",price:	250	},
//   {id:	815	,name:"	PANTALLA Xiaomi Poco M3 (ORIGINAL)	",price:	230	},
//   {id:	816	,name:"	PANTALLA Xiaomi Poco M4 (ORIGINAL)	",price:	245	},
//   {id:	817	,name:"	PANTALLA Xiaomi Poco X3 / Poco X3 Pro (ORIGINAL)	",price:	230	},
//   {id:	818	,name:"	PANTALLA Zte Blade A3 2020 (ORIGINAL)	",price:	160	},
//   {id:	819	,name:"	PANTALLA Zte Blade A31 Plus (ORIGINAL)	",price:	195	},
//   {id:	820	,name:"	PANTALLA Zte Blade A5 2020 (ORIGINAL)	",price:	150	},
//   {id:	821	,name:"	PANTALLA Zte Blade A51 (ORIGINAL)	",price:	165	},
//   {id:	822	,name:"	PANTALLA Zte Blade A71 (ORIGINAL)	",price:	150	},
//   {id:	823	,name:"	PANTALLA Zte Blade A7s 2020 (ORIGINAL)	",price:	175	},
//   {id:	824	,name:"	PANTALLA Zte V20 smart 6.82 (ORIGINAL)	",price:	240	},
//   {id:	825	,name:"	REPARACION (REPARACION)	",price:	10	},
//   {id:	826	,name:"	TABLET Samsung Galaxy Tab A 2016 7.0 ( SM-T285)	",price:	225	},
//   {id:	827	,name:"	TAPA  Xiaomi Mi 8 (ORIGINAL)	",price:	35	},
//   {id:	828	,name:"	TAPA Honor 8x (ORIGINAL)	",price:	35	},
//   {id:	829	,name:"	TAPA Huawei Honor 10 (ORIGINAL)	",price:	45	},
//   {id:	830	,name:"	TAPA Huawei Honor 10i (ORIGINAL)	",price:	40	},
//   {id:	831	,name:"	TAPA Huawei Honor 9x (ORIGINAL)	",price:	45	},
//   {id:	832	,name:"	TAPA Huawei Mate 20 lite (ORIGINAL)	",price:	35	},
//   {id:	833	,name:"	TAPA Huawei Mate 30 (ORIGINAL)	",price:	45	},
//   {id:	834	,name:"	TAPA Huawei Mate 30 Pro (ORIGINAL)	",price:	40	},
//   {id:	835	,name:"	TAPA Huawei Mate 40 (ORIGINAL)	",price:	50	},
//   {id:	836	,name:"	TAPA Huawei Nova 8 (ORIGINAL)	",price:	50	},
//   {id:	837	,name:"	TAPA Huawei Nova 8 pro (ORIGINAL)	",price:	50	},
//   {id:	838	,name:"	TAPA Huawei P smart 2020 (ORIGINAL)	",price:	30	},
//   {id:	839	,name:"	TAPA Huawei P20 (ORIGINAL)	",price:	40	},
//   {id:	840	,name:"	TAPA Huawei P20 lite (ORIGINAL)	",price:	30	},
//   {id:	841	,name:"	TAPA Huawei P20 pro (ORIGINAL)	",price:	45	},
//   {id:	842	,name:"	TAPA Huawei P30 (ORIGINAL)	",price:	50	},
//   {id:	843	,name:"	TAPA Huawei P30 lite (ORIGINAL)	",price:	45	},
//   {id:	844	,name:"	TAPA Huawei P30 pro (ORIGINAL)	",price:	50	},
//   {id:	845	,name:"	TAPA Huawei P40 (ORIGINAL)	",price:	50	},
//   {id:	846	,name:"	TAPA Huawei P40 lite (ORIGINAL)	",price:	35	},
//   {id:	847	,name:"	TAPA Huawei P40 pro (ORIGINAL)	",price:	50	},
//   {id:	848	,name:"	TAPA Huawei Y9 2019 (ORIGINAL)	",price:	45	},
//   {id:	849	,name:"	TAPA Huawei Y9 Prime (ORIGINAL)	",price:	35	},
//   {id:	850	,name:"	TAPA Realme 8 Pro (ORIGINAL)	",price:	35	},
//   {id:	851	,name:"	TAPA Redmi 8 (ORIGINAL)	",price:	35	},
//   {id:	852	,name:"	TAPA Redmi 8A (ORIGINAL)	",price:	35	},
//   {id:	853	,name:"	TAPA Redmi Note 10s (ORIGINAL)	",price:	35	},
//   {id:	854	,name:"	TAPA Samsung A02 (ORIGINAL)	",price:	25	},
//   {id:	855	,name:"	TAPA Samsung A02s (ORIGINAL)	",price:	25	},
//   {id:	856	,name:"	TAPA Samsung A10S (ORIGINAL)	",price:	25	},
//   {id:	857	,name:"	TAPA Samsung A12 (ORIGINAL)	",price:	30	},
//   {id:	858	,name:"	TAPA Samsung A20 (ORIGINAL)	",price:	30	},
//   {id:	859	,name:"	TAPA Samsung A20s (ORIGINAL)	",price:	25	},
//   {id:	860	,name:"	TAPA Samsung A21s (ORIGINAL)	",price:	25	},
//   {id:	861	,name:"	TAPA Samsung A22 (ORIGINAL)	",price:	25	},
//   {id:	862	,name:"	TAPA Samsung A31 (ORIGINAL)	",price:	30	},
//   {id:	863	,name:"	TAPA Samsung A32 (ORIGINAL)	",price:	25	},
//   {id:	864	,name:"	TAPA Samsung A50 (ORIGINAL)	",price:	30	},
//   {id:	865	,name:"	TAPA Samsung A51 (ORIGINAL)	",price:	30	},
//   {id:	866	,name:"	TAPA Samsung A52 (ORIGINAL)	",price:	25	},
//   {id:	867	,name:"	TAPA Samsung A70 (ORIGINAL)	",price:	30	},
//   {id:	868	,name:"	TAPA Samsung A72 (ORIGINAL)	",price:	35	},
//   {id:	869	,name:"	TAPA Samsung Note 10 (ORIGINAL)	",price:	45	},
//   {id:	870	,name:"	TAPA Samsung Note 10 Plus (ORIGINAL)	",price:	45	},
//   {id:	871	,name:"	TAPA Samsung Note 20 (ORIGINAL)	",price:	60	},
//   {id:	872	,name:"	TAPA Samsung Note 20 Plus (ORIGINAL)	",price:	55	},
//   {id:	873	,name:"	TAPA Samsung Note 20 Ultra (ORIGINAL)	",price:	60	},
//   {id:	874	,name:"	TAPA Samsung S10 (ORIGINAL)	",price:	45	},
//   {id:	875	,name:"	TAPA Samsung S10 Plus (ORIGINAL)	",price:	45	},
//   {id:	876	,name:"	TAPA Samsung S20 (ORIGINAL)	",price:	55	},
//   {id:	877	,name:"	TAPA Samsung S20 FE (ORIGINAL)	",price:	50	},
//   {id:	878	,name:"	TAPA Samsung S20 Plus (ORIGINAL)	",price:	55	},
//   {id:	879	,name:"	TAPA Samsung S20 Ultra (ORIGINAL)	",price:	55	},
//   {id:	880	,name:"	TAPA Samsung S21 (ORIGINAL)	",price:	55	},
//   {id:	881	,name:"	TAPA Samsung S21 Plus (ORIGINAL)	",price:	65	},
//   {id:	882	,name:"	TAPA Samsung S21 Ultra (ORIGINAL)	",price:	65	},
//   {id:	883	,name:"	TAPA Tecno Spark 6 (ORIGINAL)	",price:	35	},
//   {id:	884	,name:"	TAPA Tecno Spark 6 Go (ORIGINAL)	",price:	35	},
//   {id:	885	,name:"	TAPA Tecno Spark 7 (ORIGINAL)	",price:	35	},
//   {id:	886	,name:"	TAPA Tecno Spark 8C (ORIGINAL)	",price:	35	},
//   {id:	887	,name:"	TAPA Xiaomi Mi 10 (ORIGINAL)	",price:	45	},
//   {id:	888	,name:"	TAPA Xiaomi Mi 10 Lite (ORIGINAL)	",price:	35	},
//   {id:	889	,name:"	TAPA Xiaomi Mi 10 Pro (ORIGINAL)	",price:	40	},
//   {id:	890	,name:"	TAPA Xiaomi Mi 10T (ORIGINAL)	",price:	40	},
//   {id:	891	,name:"	TAPA Xiaomi Mi 10T Pro (ORIGINAL)	",price:	40	},
//   {id:	892	,name:"	TAPA Xiaomi Mi 11 (ORIGINAL)	",price:	45	},
//   {id:	893	,name:"	TAPA Xiaomi Mi 11 Lite (ORIGINAL)	",price:	45	},
//   {id:	894	,name:"	TAPA Xiaomi Mi 8 Lite (ORIGINAL)	",price:	35	},
//   {id:	895	,name:"	TAPA Xiaomi Mi 9 (ORIGINAL)	",price:	35	},
//   {id:	896	,name:"	TAPA Xiaomi Mi 9 lite (ORIGINAL)	",price:	45	},
//   {id:	897	,name:"	TAPA Xiaomi Mi 9T (ORIGINAL)	",price:	40	},
//   {id:	898	,name:"	TAPA Xiaomi Mi 9T Pro (ORIGINAL)	",price:	35	},
//   {id:	899	,name:"	TAPA Xiaomi Mi A2 (ORIGINAL)	",price:	45	},
//   {id:	900	,name:"	TAPA Xiaomi Mi A3 (ORIGINAL)	",price:	40	},
//   {id:	901	,name:"	TAPA Xiaomi Mi Note 10 (ORIGINAL)	",price:	40	},
//   {id:	902	,name:"	TAPA Xiaomi Mi Note 10 Pro (ORIGINAL)	",price:	40	},
//   {id:	903	,name:"	TAPA Xiaomi Poco F1 (ORIGINAL)	",price:	35	},
//   {id:	904	,name:"	TAPA Xiaomi Poco X3 (ORIGINAL)	",price:	35	},
//   {id:	905	,name:"	TAPA Xiaomi Redmi 9 (ORIGINAL)	",price:	35	},
//   {id:	906	,name:"	TAPA Xiaomi Redmi 9A (ORIGINAL)	",price:	35	},
//   {id:	907	,name:"	TAPA Xiaomi Redmi 9C (ORIGINAL)	",price:	35	},
//   {id:	908	,name:"	TAPA Xiaomi Redmi 9T (ORIGINAL)	",price:	35	},
//   {id:	909	,name:"	TAPA Xiaomi Redmi Note 10 (ORIGINAL)	",price:	35	},
//   {id:	910	,name:"	TAPA Xiaomi Redmi Note 8 (ORIGINAL)	",price:	40	},
//   {id:	911	,name:"	TAPA Xiaomi Redmi Note 8 Pro (ORIGINAL)	",price:	40	},
//   {id:	912	,name:"	TAPA Xiaomi Redmi Note 9 (ORIGINAL)	",price:	40	},
//   {id:	913	,name:"	TAPA Xiaomi Redmi Note 9S (ORIGINAL)	",price:	40	},
//   {id:	914	,name:"	TAPA Xiaomi Redmi Note 9T (ORIGINAL)	",price:	40	},
//   {id:	915	,name:"	VISOR Huawei Honor 10 (ORIGINAL)	",price:	15	},
//   {id:	916	,name:"	VISOR Huawei Honor 9x (ORIGINAL)	",price:	20	},
//   {id:	917	,name:"	VISOR Huawei Mate 20 (ORIGINAL)	",price:	25	},
//   {id:	918	,name:"	VISOR Huawei Mate 20 lite (ORIGINAL)	",price:	15	},
//   {id:	919	,name:"	VISOR Huawei Mate 30 (ORIGINAL)	",price:	35	},
//   {id:	920	,name:"	VISOR Huawei Mate 40 (ORIGINAL)	",price:	35	},
//   {id:	921	,name:"	VISOR Huawei P20 (ORIGINAL)	",price:	15	},
//   {id:	922	,name:"	VISOR Huawei P20 lite (ORIGINAL)	",price:	15	},
//   {id:	923	,name:"	VISOR Huawei P20 pro (ORIGINAL)	",price:	35	},
//   {id:	924	,name:"	VISOR Huawei P30 (ORIGINAL)	",price:	20	},
//   {id:	925	,name:"	VISOR Huawei P30 lite (ORIGINAL)	",price:	20	},
//   {id:	926	,name:"	VISOR Huawei P30 pro (ORIGINAL)	",price:	20	},
//   {id:	927	,name:"	VISOR Huawei P40 (ORIGINAL)	",price:	35	},
//   {id:	928	,name:"	VISOR Huawei P40 lite (ORIGINAL)	",price:	25	},
//   {id:	929	,name:"	VISOR Huawei P40 pro (ORIGINAL)	",price:	35	},
//   {id:	930	,name:"	VISOR Realme Realme 7 (ORIGINAL)	",price:	25	},
//   {id:	931	,name:"	VISOR Realme Realme 7 Pro (ORIGINAL)	",price:	30	},
//   {id:	932	,name:"	VISOR Redmi 8 / 8A (ORIGINAL)	",price:	15	},
//   {id:	933	,name:"	VISOR Redmi 9 (ORIGINAL)	",price:	20	},
//   {id:	934	,name:"	VISOR Redmi 9C (ORIGINAL)	",price:	25	},
//   {id:	935	,name:"	VISOR Redmi 9T (ORIGINAL)	",price:	30	},
//   {id:	936	,name:"	VISOR Redmi Note 10 Pro (ORIGINAL)	",price:	30	},
//   {id:	937	,name:"	VISOR Redmi Note 10s (ORIGINAL)	",price:	35	},
//   {id:	938	,name:"	VISOR Redmi Note 8 (ORIGINAL)	",price:	20	},
//   {id:	939	,name:"	VISOR Redmi Note 8 Pro (ORIGINAL)	",price:	20	},
//   {id:	940	,name:"	VISOR Redmi Note 9 (ORIGINAL)	",price:	25	},
//   {id:	941	,name:"	VISOR Redmi Note 9 Pro (ORIGINAL)	",price:	25	},
//   {id:	942	,name:"	VISOR Redmi Note 9T (ORIGINAL)	",price:	25	},
//   {id:	943	,name:"	VISOR Samsung A10, A20, A30, A40 (ORIGINAL)	",price:	15	},
//   {id:	944	,name:"	VISOR Samsung A11 (ORIGINAL)	",price:	15	},
//   {id:	945	,name:"	VISOR Samsung A12 (ORIGINAL)	",price:	20	},
//   {id:	946	,name:"	VISOR Samsung A80 (ORIGINAL)	",price:	20	},
//   {id:	947	,name:"	VISOR Samsung J3 (ORIGINAL)	",price:	15	},
//   {id:	948	,name:"	VISOR sansung A02s (ORIGINAL)	",price:	15	},
//   {id:	949	,name:"	VISOR Xiaomi Mi 10 (ORIGINAL)	",price:	20	},
//   {id:	950	,name:"	VISOR Xiaomi Mi 10 Lite (ORIGINAL)	",price:	30	},
//   {id:	951	,name:"	VISOR Xiaomi Mi 11 (ORIGINAL)	",price:	20	},
//   {id:	952	,name:"	VISOR Xiaomi Mi 11 Lite (ORIGINAL)	",price:	25	},
//   {id:	953	,name:"	VISOR Xiaomi Mi 9 (ORIGINAL)	",price:	20	},
//   {id:	954	,name:"	VISOR Xiaomi Mi 9 Lite (ORIGINAL)	",price:	20	},
//   {id:	955	,name:"	VISOR Xiaomi Mi 9T (ORIGINAL)	",price:	15	},
//   {id:	956	,name:"	VISOR Xiaomi Mi A3 (ORIGINAL)	",price:	20	},
//   {id:	957	,name:"	VISOR Xiaomi Mi Note 10 (ORIGINAL)	",price:	30	},
//   {id:	958	,name:"	VISOR Xiaomi Poco X3 (ORIGINAL)	",price:	30	},
//   {id:	959	,name:"	VISOR Xiaomi Poco X3 Pro (ORIGINAL)	",price:	30	},
//   // FIN DEL CARGDO DE DATOS //
//     ];
const lista = [
  { id: 1, name: "BANDEJA SIM Huawei Mate 20 lite (ORIGINAL)", price: 15 },
  { id: 2, name: "BANDEJA SIM Huawei y6 2018 (ORIGINAL)", price: 15 },
  { id: 3, name: "Cable de datos USB Huawei (ORIGINAL)", price: 10 },
  { id: 4, name: "Cargador de pared Huawei (ORIGINAL)", price: 20 },
  { id: 5, name: "Cargador de coche Huawei (ORIGINAL)", price: 15 }
];

const movies = [
  { title: 'El señor de los anillos', description: 'Una película de aventuras y fantasía.' },
  { title: 'Harry Potter y la piedra filosofal', description: 'Una película de aventuras y magia.' },
  { title: 'El padrino', description: 'Una película de drama y crimen.' },
  { title: 'El club de la pelea', description: 'Una película de drama y suspenso.' }
];

function buscarPeliculas(query, lista) {
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.PorterStemmer;

  const tokens = tokenizer.tokenize(query);
  const stems = tokens.map(token => stemmer.stem(token));

  return lista.filter(lista =>
    stems.some(stem =>
      lista.name.includes(stem)
    )
  );
}

async function obtenerPrecio(textoPregunta) {
  try {
    textoFinal = '';
    if (!hasPantalla(textoPregunta)) {
      return textoFinal = 'En seguida case!'
    }

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `a cuento esta la Pantalla ${textoPregunta}`
    });

    const precios = this.products_;
    const descripcionProducto = response.data.choices[0].text;
    console.log('recibido', descripcionProducto);
    const producto = encontrarProducto(textoPregunta, precios);

    if (Object.keys(producto).length === 0) {
      return 'Lo siento, no encontré ningún producto con esa descripción';
    } else {
      const campoDeTexto = `Nombre: ${producto.name}\nPrecio: ${producto.price}`;
      return campoDeTexto;
    }
  } catch (error) {
    console.error(error);
    return 'Ocurrió un error al procesar la solicitud';
  }
}

function encontrarProducto(descripcion, precios) {
  // Obtener una lista de todas las descripciones de productos
  const descripcionesProductos = precios.map((producto) => {
    return producto.name.toLowerCase();
  });

  // Encontrar la descripción más similar a la pregunta del cliente
  const resultadoSimilitud = stringSimilarity.findBestMatch(descripcion.toLowerCase(), descripcionesProductos);

  // Devolver el producto correspondiente a la descripción más similar
  return precios[resultadoSimilitud.bestMatchIndex];
}

function hasPantalla(texto) {
  switch (true) {
    case texto.toLowerCase().includes("case?"):
      return "¡si case!";
    case texto.toLowerCase().includes("buenos días"):
      return "¡Buenos días case!";
    case texto.toLowerCase().includes("buenas tardes"):
      return "¡Buenas tardes case!";
    case texto.toLowerCase().includes("buenas noches"):
      return "¡Buenas noches case!";
    case texto.toLowerCase().includes("hora atendera"):
      return "*Horarios de atención*\n9:00 am a 20:30 pm de *lunes a viernes*\n9:00 am a 19:30 pm *sábados*\n10:00 am a 19:30 pm *domingos*";
    case texto.toLowerCase().includes("horarios de atencion"):
      return "*Horarios de atención*\n9:00 am a 20:30 pm de *lunes a viernes*\n9:00 am a 19:30 pm *sábados*\n10:00 am a 19:30 pm *domingos*";
    case texto.toLowerCase().includes("direccion"):
      return "// DIRECCIÓN EL ALTO // \nDirección en plena Ceja  de El Alto *PLAZA LUSTRABOTAS* calle 1 entre Franco Valle *Galería Virgen del Rosario oficina 2*📱";
    default:
      return "";
  }
}