const express = require("express");

const errorMiddleware = require("./middleware/errorMiddleware");


const app = express();

app.use(express.json());

app.get('/', (req, res)=>{
    res.send('SERVER IS RUNNING');
})

app.use(errorMiddleware);

module.exports = app;