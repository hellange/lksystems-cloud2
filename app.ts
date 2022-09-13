import express, {NextFunction, Request, Response} from 'express';
import {DataCollector} from "./DataCollector";
import {DataBase} from "./DataBase";
import {Thermostats} from "./routes/Thermostats";
import {Status} from "./routes/Status";

const app = express();
const port = 3000;
const router = express.Router();
app.set('view engine', 'pug');

router.get('/',function(req,res){
  res.json({'message' : 'Ping Successfull'});
});

const dataBase = new DataBase()
const dataCollector = new DataCollector(dataBase)

const thermostatsRoutes = new Thermostats(dataBase);
const statusRoutes = new Status();

const everyHour = 1000 * 60 * 60
const everyDay = everyHour * 24
const everyQuarter = 1000 * 60 * 15

const pollPeriod = everyQuarter;

// make sure you're authorized
setInterval( () => dataCollector.login(), everyDay);

// Delay until db is probably up'n running
// TODO: Better mechanism to handle db not started when trying to make connection
setTimeout( () => dataBase.createConnection(), 5000);

// Startup data fetch mechanism after an initial delay
setTimeout( () => getThermo(), 10000); // Delay the first data fetch
const getThermo = () => {
  dataCollector.collectAndStoreThermostatData()
  setTimeout( () => getThermo(), pollPeriod); // needed for LK webserver to be ready
}

app.use('/api',router);
router.get('/status', statusRoutes.router)
router.get('/data', thermostatsRoutes.router)

app.use('/dashboard', express.static('public'));

app.listen(port, () => {
  console.log(`lksystems monitor is running on port ${port}.`);
});
