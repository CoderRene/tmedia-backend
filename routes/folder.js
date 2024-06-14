const router = require("express").Router();
const multer = require("multer");
const { getMedia, indexMedia, deleteMedia } = require("../services/folder");
const config = require(`../config/config.${process.env.NODE_ENV || 'prod'}.json`);
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.path + '/' + req.query.folder)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage, limits: { fieldSize: 500 *1024 *1024 } });

const initFolder = () => {

  router.get("/media", async (req, res) => {
    const { folder, offset, limit } = req.query;

    try {
      const response = await getMedia(folder, offset, limit);
      res.status(200).json({status: 'Success', code: 200, payload: response});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  });

  router.post("/media/upload", upload.single('file'), async (req, res) => {
    const { creationDate, isVideo } = req.query;

    console.log(creationDate);
    try {
      const date = new Date();

      if (!req.file) {
        console.log('No file uploaded', req.file);
        return res.status(400).json({status: 'Error', code: 400, payload: 'No file uploaded'});
      }

      fs.utimesSync(req.file.path, date, date);
      await indexMedia(req.file, isVideo, date);
      res.status(200).json({status: 'Success', code: 200, payload: 'Media uploaded successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  });

  router.post("/media/multiple_upload", upload.array('files'), async (req, res) => {
    const { creationDates, isVideoValues } = req.body;

    try {

      if (!req.files) {
        console.log('No files uploaded', req.files);
        return res.status(400).json({status: 'Error', code: 400, payload: 'No files uploaded'});
      }

      let i = 0;
      for (const file of req.files) {
        const d = new Date(creationDates[i]);
        fs.utimesSync(file.path, d, d);
        await indexMedia(file, isVideoValues[i], d);
        i++;
      }

      res.status(200).json({status: 'Success', code: 200, payload: 'Media uploaded successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  
  });

  router.delete("/media", async (req, res) => {
    const { id, path, isSelectAll } = req.query
    const filePath = `${config.path}/${path}`;
    const folder = path.split('/')[0];

    try {
      if (isSelectAll === "true") {
        const files = fs.readdirSync(`${config.path}/${folder}`);
        files.forEach(file => {
          fs.unlinkSync(`${config.path}/${path.split('/')[0]}/${file}`);
        });
      } else {
        fs.unlinkSync(filePath);
      }

      await deleteMedia(id, folder, isSelectAll === "true");
      res.status(200).json({status: 'Success', code: 200, payload: 'Media deleted successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  });
  
  return router;
}

module.exports = {initFolder};