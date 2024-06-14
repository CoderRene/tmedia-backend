const { DIRECTORY } = require("../constants/dir");
const { initFolder } = require("./folder");
const { initHome } = require("./home");
const express = require("express");
const router = express.Router();

const initRoutes = (app) => {

    router.use('/home', initHome());
    router.use('/folder', initFolder());

    app.use("/api", router);
    app.use("/api/media/", express.static(DIRECTORY.ROOT));
}
module.exports = {
    initRoutes
}