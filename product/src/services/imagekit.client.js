const ImageKit = require('imagekit');

let uuidv4;
try {
  const uuid = require('uuid');
  uuidv4 = uuid.v4 || (uuid.default && uuid.default.v4);
} catch (err) {
  const { randomUUID } = require('crypto');
  uuidv4 = () => randomUUID();
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

exports.uploadFile = (fileBuffer, filename, folder = '/products') => {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: fileBuffer,
      fileName: (typeof uuidv4 === 'function') ? uuidv4() : String(uuidv4),
      folder
    }, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.url, fileId: result.fileId, thumbnail: result.thumbnail });
    });
  });
};
