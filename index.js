const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const { initRoutes } = require("./routes/route");
const readline = require('readline');
const config = require(`./config/config.${process.env.NODE_ENV || 'prod'}.json`);

process.on('uncaughtException', (err) => {
  console.log('Caught exception: ', err);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Press [Enter] to exit...', () => {
    rl.close();
    process.exit(1);
  });
});

process.stdin.resume();

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

const app = express();
const port = config.server_port || "8080";

app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));

async function init() {
    initRoutes(app);

    app.listen(port);
    console.log(`Running at ${port}`);
}

init();