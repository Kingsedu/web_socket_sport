import express from "express";
import {configEnv} from "./config/config";

const app = express();
console.log('connected to server')
app.get('/health', (req, res) => {
    res.json({message: 'Health server running'});
})
app.listen(configEnv.PORT, () => {
    console.log(`Server started on port: ${configEnv.PORT}`);
})
 