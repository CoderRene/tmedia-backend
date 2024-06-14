const {models} = require('../db/db');

const getMedia = async (folder, offset, limit) => {

  console.log(folder, offset, limit);

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

module.exports = {
  getMedia,
  indexMedia,
  deleteMedia,
}