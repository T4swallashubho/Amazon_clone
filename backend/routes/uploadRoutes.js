import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { isAuth, isSellerOrAdmin } from '../utils.js';
import streamifier from 'streamifier';
import expressAsyncHandler from 'express-async-handler';

const uploadRouter = express.Router();

const upload = multer();

// only a seller or an admin or one being both can upload an image.
uploadRouter.post(
  '/',
  isAuth,
  isSellerOrAdmin,
  upload.single('file'),
  expressAsyncHandler(async (req, res) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // configure Cloudinary to upload and multer
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        // returns a readable stream. Create readable stream from req.file.buffer and  pipe it as a writable stream to stream variable.
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    // upload to the cloudinary
    const result = await streamUpload(req);
    res.send(result);
  })
);

// uploadRouter.delete(
//   '/',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     cloudinary.config({
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//     });

//     // configure Cloudinary to upload and multer
//     const streamUpload = (req) => {
//       return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.destroy((error, result) => {
//           if (result) {
//             resolve(result);
//           } else {
//             reject(error);
//           }
//         });

//         // returns a readable stream. Create readable stream from req.file.buffer and  pipe it as a writable stream to stream variable.
//         streamifier.createReadStream(req.file.buffer).pipe(stream);
//       });
//     };

//     // upload to the cloudinary
//     const result = await streamUpload(req);
//     res.send(result);
//   })
// );

export default uploadRouter;
