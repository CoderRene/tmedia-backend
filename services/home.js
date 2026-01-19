const fs = require('fs');
const { DIRECTORY } = require("../constants/dir");
const {models} = require('../db/db');
const { indexMedia } = require('./folder');

const getHomeFolders = async () => {
  const homeFolders = [];

  fs.readdirSync(DIRECTORY.ROOT).forEach(folder => {
    const stats = fs.statSync(`${DIRECTORY.ROOT}/${folder}`);
    if (stats.isFile()) return;

    let media = fs.readdirSync(`${DIRECTORY.ROOT}/${folder}`);
    media = media.filter(file => !file.includes('-thumbnail'));

    homeFolders.push({
      folder,
      thumbnailPath: `${folder}/${media[0]}`,
      fileCount: media.length,
    });
  });

  return homeFolders;
}

const indexAllMediaInFolder = async (folderName) => {
  const dir = `${DIRECTORY.ROOT}/${folderName}`;
  if (!fs.existsSync(dir)) return;

  const mediaFiles = fs.readdirSync(dir);

  for (const file of mediaFiles) {
    if (file.includes('-thumbnail')) continue;

    const fileExt = file.split('.').pop().toLowerCase();
    const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(fileExt) ? "true" : "false";

    await indexMedia(
      {
        originalname: file,
        destination: dir,
      },
      isVideo,
      fs.statSync(`${dir}/${file}`).birthtime
    );
  }
}

const createFolder = async (folderName) => {
  const dir = `${DIRECTORY.ROOT}/${folderName}`;
  if (fs.existsSync(dir)) return;
  fs.mkdirSync(dir);
}

const deleteFolder = async (folderName) => {
  const dir = `${DIRECTORY.ROOT}/${folderName}`;
  if (!fs.existsSync(dir)) return;

  fs.rmSync(dir, { recursive: true, force: true});

  await models.imagepathfile.destroy({ where: { folder: folderName } });
}

const editFolder = async (folderName, newFolderName) => {
  const dir = `${DIRECTORY.ROOT}/${folderName}`;
  if (!fs.existsSync(dir)) return;

  fs.renameSync(dir, `${DIRECTORY.ROOT}/${newFolderName}`);

  await models.imagepathfile.update(
    { folder: newFolderName },
    { where: { folder: folderName } }
  );
}

module.exports = {
  indexAllMediaInFolder,
  getHomeFolders,
  createFolder,
  deleteFolder,
  editFolder,
}