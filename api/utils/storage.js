const azure = require('azure-storage');
const { Readable } = require("stream")

const config = require("../config");

const blobService = azure.createBlobService(config.STORAGE_ACCOUNT_CONNECTION);

const fileUpload = (container, blobPath, buffer, length, callback) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return blobService.createBlockBlobFromStream(container, blobPath, stream, length, callback);
};

const downloadFileUrl = (container, blobPath) => {
  const startDate = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 100);
  startDate.setMinutes(startDate.getMinutes() - 100);

  const sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
      Start: startDate,
      Expiry: expiryDate
    }
  };

  const token = blobService.generateSharedAccessSignature(container, blobPath, sharedAccessPolicy);
  const sasUrl = blobService.getUrl(container, blobPath, token);

  return sasUrl;
}

module.exports = {
  fileUpload,
  downloadFileUrl,
}
