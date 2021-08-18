const webpush = require('web-push');

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
