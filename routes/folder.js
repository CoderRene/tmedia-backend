const router = require("express").Router();
const multer = require("multer");
const { getMedia, indexMedia, deleteMedia, generateThumbnail } = require("../services/folder");
const config = require(`../config/config.${process.env.NODE_ENV || 'prod'}.json`);
const fs = require('fs');
const { DIRECTORY } = require("../constants/dir");

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

  router.get("/media/download", (req, res) => {
    const { path } = req.query;
    const filePath = `${DIRECTORY}/${path}`;

    try {
      if (fs.existsSync(filePath)) {
        // Set headers for download and progress
        res.setHeader('Content-Disposition', `attachment; filename="${path.split('/').pop()}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', fs.statSync(filePath).size); // Required for progress
        res.sendFile(filePath);
      } else {
        res.status(404).json({ status: 'Error', code: 404, payload: 'File not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'Error', code: 500, payload: 'Internal Server Error' });
    }
  });

  router.post("/media/upload", upload.single('file'), async (req, res) => {
    const { creationDate, isVideo } = req.query;

    try {
      const date = new Date(creationDate);

      if (!req.file) {
        console.log('No file uploaded', req.file);
        return res.status(400).json({status: 'Error', code: 400, payload: 'No file uploaded'});
      }

      if (isVideo === "true") {
        await generateThumbnail(
          true,
          req.file.path,
          `${req.file.originalname.split('.')[0]}-thumbnail.jpg`,
          req.file.destination
        );
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

        if (isVideoValues[i] === "true") {
          await generateThumbnail(
            false,
            file.path,
            `${file.originalname.split('.')[0]}-thumbnail.jpg`,
            file.destination
          );
        }

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
    const filePathThumbnail = `${config.path}/${path.split('.')[0]}-thumbnail.jpg`;
    const folder = path.split('/')[0];

    try {
      if (isSelectAll === "true") {
        const files = fs.readdirSync(`${config.path}/${folder}`);
        files.forEach(file => {
          fs.unlinkSync(`${config.path}/${path.split('/')[0]}/${file}`);
        });
      } else {
        fs.unlinkSync(filePath);
        
        if (fs.existsSync(filePathThumbnail))
          fs.unlinkSync(filePathThumbnail);
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