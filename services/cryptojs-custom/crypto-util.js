import CryptoJS from "./crypto-service";

function hash512(plainText) {
    return CryptoJS.SHA512(plainText).toString(CryptoJS.enc.Hex);
}

function encryptAes(encryptableValue, sessionKey) {
    const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000'); // 16 bytes of zeros
    const key = CryptoJS.enc.Hex.parse(sessionKey);
    
    const encrypted = CryptoJS.AES.encrypt(encryptableValue, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    // Combine IV and the ciphertext
    const combinedBuffer = CryptoJS.lib.WordArray.create(iv.words.concat(encrypted.ciphertext.words));
    // Convert to Base64 for the final result
    return CryptoJS.enc.Base64.stringify(combinedBuffer);
}

function decryptAes(encryptedValue, sessionKey) {

    const combinedBuffer = CryptoJS.enc.Base64.parse(encryptedValue);
    const iv = CryptoJS.lib.WordArray.create(combinedBuffer.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(combinedBuffer.words.slice(4), combinedBuffer.sigBytes - 16);
    
    const key = CryptoJS.enc.Hex.parse(sessionKey);

    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        key,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    return CryptoJS.enc.Utf8.stringify(decrypted);
}

export  {encryptAes,decryptAes,hash512};

