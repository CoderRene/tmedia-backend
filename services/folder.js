const {models} = require('../db/db');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);
const ffprobePath = require('ffprobe-static').path;
ffmpeg.setFfprobePath(ffprobePath);

const getMedia = async (folder, offset, limit) => {
  let res = await models.imagepathfile.findAll({
    where: {
      folder: folder,
    },
    order: [
      ['date', 'DESC'],
      ['id', 'DESC'],
    ],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res = res.map((item) => {
    return {
      id: item.id,
      name: item.file,
      path: `${folder}/${item.file}`,
      date: item.date,
      isVideo: item.isVideo,
    }
  });

  return res;
}

const indexMedia = async (file, isVideo, date) => {

  const filename = file.originalname;
  const filedest = file.destination;

  const found = await models.imagepathfile.findOne({
    where: {
      file: filename,
      folder: filedest.split('/').pop(),
    }
  });

  if (found) {
    return found;
  }

  const media = {
    file: filename,
    folder: filedest.split('/').pop(),
    date: date,
    ...(isVideo && {isVideo: isVideo === "true" ? 1 : 0}),
  };

  const res = await models.imagepathfile.create(media);
  return res;
}

const deleteMedia = async (id, folder, isSelectAll) => {

  const query = isSelectAll ? {
    where: {
      folder: folder
    }
  } : {
    where: {
      id: id
    }
  }

  const res = await models.imagepathfile.destroy(query);

  return res;
}

const generateThumbnail = (isSingle, videoPath, fileName, outputPath, timestamp = '00:00:00') => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('Error getting metadata:', err);
        return reject(err);
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        return reject(new Error('No video stream found'));
      }

      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: fileName,
          folder: outputPath,
          size: isSingle ? `${videoStream.height}x${videoStream.width}` : `${videoStream.width}x${videoStream.height}`
        })
        .on('end', () => {
          console.log('Thumbnail generated successfully');
          resolve(true);
        })
        .on('error', (err) => {
          console.error('Error generating thumbnail:', err);
          reject(err);
        });
    });
  });
};


module.exports = {
  getMedia,
  indexMedia,
  deleteMedia,
  generateThumbnail,
}