const fs = require('fs');
const { DIRECTORY } = require("../constants/dir");
const {models} = require('../db/db');

const getHomeFolders = async () => {
  const homeFolders = [];

  fs.readdirSync(DIRECTORY.ROOT).forEach(folder => {
    const stats = fs.statSync(`${DIRECTORY.ROOT}/${folder}`);
    if (stats.isFile()) return;

    const media = fs.readdirSync(`${DIRECTORY.ROOT}/${folder}`);

    homeFolders.push({
      folder,
      thumbnailPath: `${folder}/${media[0]}`,
    });
  });

  return homeFolders;
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
  getHomeFolders,
  createFolder,
  deleteFolder,
  editFolder,
}