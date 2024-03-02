## About
A webapp for:
- Collecting temperature data from my LK Systems (https://www.lksystems.no/) floor heating system though the LKSystems cloud server (https://my.lk.nu/)
- Storing historical data in a database and present them as graphs in dashboard.
- Optimized and tailored for my own LKSystem installation with 5 temperature sensors, but may serve as basis for other projects as well.

Implemented using typescript, node, mysql db.

Based on [lksystems](https://github.com/hellange/lksystems) that fetched data from local webserver (old LKSystems webserver)

## Tested on
Tested locally on MAC with node v11.15.0

## Preconditions
- Add your lk system credentials (cloud login credentials) in a lk_credentials.env file

```
LK_USERNAME=<your username in the lksystem cloud>
LK_PASSWORD=<your password in the lksystem cloud>
```
- If running locally (not docker) you need to have node/npm etc. installed (Tested on MAC with node v11.15.0)
- docker etc. installed

## Build and run everything in docker
You can build and run both db and application as docker containers simply by:
```
npm install
```
Build image self-containing image for the webapp:
```
docker build -f Dockerfile-webapp . -t lksystem-web-app
```
Build self containing image for mysql that includes creation of database if not exists from before:
```
docker build -f Dockerfile-sql . -t lksystem-sql
```
These commands are also in the script: 
```build_for_all_docker.sh```

Start up everything:
```
docker-compose up
```

## Build and run locally
You can run the application locally by
```
npm install
```
- start database locally (i.e by commenting out the app part in docker-compose and run docker-compose up)
- replace db with localhost in DataBase.ts:
```
   :
   this.dbConnection = mysql.createConnection({
   host: 'db', // use of running in docker
   //host: '127.0.0.1', // use if running locally (not docker) ?
   :
```

run npm run serve with environment variables. For example on MAC:

```
LK_USERNAME=<LK system username> LK_PASSWORD=<LK system password> npm run serve
```

(TODO: Add alternative environment variable methods in this README)

You can of course also edit the files, build containers and run docker-compose up, but it increases the development round-trip delay...

## Test it
Webapp should now be available at 
```localhost:3000/dashboard```

It uses the api at api/days, example:
```localhost:3000api/data?days=7```

## Synology
I've launched the application on my Synology NAS that supports docker (not all Synology NAS supports docker).
You need to 
- Add the two images to the NAS docker. 
- Copy the docker-compose.yml over to the NAS to a directory
- Add a file called lk_credentials.yml with your LKSystems credentials (ref preconditions) to the same directory

To avoid "hassle" with user/group/provileges etc. you can from that directory just run:
```
sudo docker-compose up
```
Note that from a security standpoint this is NOT RECOMMENDED. I'm sure it's possible to it the "proper" way but I've not spent time on it.


## Some references
Code based on previous working code using older infrastructure:
  https://github.com/hellange/lksystems

Initial setup of project based on:
  Build an API with Node.js, Express, and TypeScript (https://www.split.io/blog/node-js-typescript-express-tutorial/)
Initial RxJs/RxHR setup info found here:
  Asynchronous JavaScript: Using RxJS Observables with REST APIs in Node.js (https://www.twilio.com/blog/async-js-rxjs-observables-rest-api-nodejs)
++
