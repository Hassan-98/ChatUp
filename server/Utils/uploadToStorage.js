/* eslint-disable */
const Multer = require('multer');
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = {
  "type": process.env.SA_type,
  "project_id": process.env.SA_project_id,
  "private_key_id": process.env.SA_private_key_id,
  "private_key": process.env.SA_private_key,
  "client_email": process.env.SA_client_email,
  "client_id": process.env.SW_client_id,
  "auth_uri": process.env.SA_auth_uri,
  "token_uri": process.env.SA_token_uri,
  "auth_provider_x509_cert_url": process.env.SA_auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url
}

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${process.env.STORAGE_BUCKET}.appspot.com`
});

const bucket = getStorage().bucket();
  
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Upload Function
const uploadToStorage = file => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject("No image file");
      }
      let newFileName = `${file.originalname}_${Date.now()}`;
  
      let fileUpload = bucket.file(newFileName);
  
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
  
      blobStream.on("error", error => {
        reject(error);
      });
  
      blobStream.on("finish", () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(fileUpload.name)}?alt=media`;
        resolve(publicUrl);
      });
  
      blobStream.end(file.buffer);
    });
};
  
function extractName(url) {
    var splitedURL = url.split("/");
    return splitedURL[splitedURL.length - 1].split("?")[0];
}

const deleteFile = async (oldFileName) => {
  try {
    await bucket.file(oldFileName).delete();
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
    uploadToStorage,
    extractName,
    deleteFile,
    multer
}