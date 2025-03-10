import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { BlobServiceClient } from '@azure/storage-blob';

const attachmentRouter = express.Router();
dotenv.config();
const upload = multer(); // For handling multipart/form-data

// Load and validate environment variables
const AZURE_STORAGE_CONNECTION_STRING = process.env.AzureBlobConnectionString;
const containerName = process.env.AzureBlobContainerName;

if (!AZURE_STORAGE_CONNECTION_STRING || !containerName) {
  throw new Error("Missing Azure Blob Storage configuration in environment variables.");
}

// File MIME type validation function
const isFileTypeValid = (file) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  return allowedMimeTypes.includes(file.mimetype);
};

// Generate a unique file name based on the current date and time
const generateUniqueFileName = (originalName) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const extension = originalName.split('.').pop();
  return `${timestamp}.${extension}`;
};

// Upload endpoint
attachmentRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded.');
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    if (!isFileTypeValid(req.file)) {
      console.log('Invalid file type. Only JPEG, PNG, and PDF files are allowed for upload.');
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' });
    }

    const uniqueFileName = generateUniqueFileName(req.file.originalname);
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobClient = containerClient.getBlockBlobClient(uniqueFileName);
    await blobClient.uploadData(req.file.buffer);
    res.status(200).json({ message: 'File uploaded successfully!', fileName: uniqueFileName });
  } catch (error) {
    console.log('Uploading file:4');
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file.', error: error.message });
  }
});

// Download endpoint
attachmentRouter.get('/download/:fileName', async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobClient = containerClient.getBlockBlobClient(req.params.fileName);
    const downloadBlockBlobResponse = await blobClient.download();
    const downloadedFile = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

    res.setHeader('Content-Type', downloadBlockBlobResponse.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.fileName}`);
    res.send(downloadedFile);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file.', error: error.message });
  }
});

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (chunk) => {
      chunks.push(chunk);
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
};

export default attachmentRouter;
