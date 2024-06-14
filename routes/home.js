const { getHomeFolders, createFolder, deleteFolder, editFolder } = require("../services/home");

const router = require("express").Router();

const initHome = () => {

  router.get("/folders", async (req, res) => {
    try {
      const homeFolders = await getHomeFolders();
      res.status(200).json({status: 'Success', code: 200, payload: homeFolders}); 
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  });

  router.delete("/folders", async (req, res) => {
    const { name } = req.query;

    try {
      await deleteFolder(name);
      res.status(200).json({status: 'Success', code: 200, payload: 'Folder deleted successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  });

  router.put("/folders", async (req, res) => {
    const { name, newName } = req.query;

    try {
      await editFolder(name, newName);
      res.status(200).json({status: 'Success', code: 200, payload: 'Folder edited successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  });

  router.post("/folders", async (req, res) => {
    const { name } = req.query;

    try {
      await createFolder(name);
      res.status(200).json({status: 'Success', code: 200, payload: 'Folder created successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: 'Error', code: 500, payload: 'Internal Server Error'});
    }
  });

  return router;
}

module.exports = {
  initHome
}