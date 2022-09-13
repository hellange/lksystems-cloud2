import {Observable} from "rxjs";
import {FieldInfo, MysqlError} from 'mysql';
import { map } from 'rxjs/operators';
//const mysql = require('promise-mysql');
const mysql = require('mysql');
export class DataBase {

    public dbConnection

    constructor() {
        console.warn("DataBase initialized")
        //this.createConnection();
    }

    public createConnection() {
        console.log("Connecting to DB...");
        try {
            this.dbConnection = mysql.createConnection({
                host: 'db', // use of running with docker-compose
                //host: '127.0.0.1', // use if running locally ?
                port: 3306,
                user: 'root',
                password: 'secret2',
                database: 'helge99'
            });

            this.dbConnection.connect(function(error){
                if(!!error){
                    console.log(error);
                }else{
                    console.log('Connected!:)');
                }
            });

        } catch (ex) {
            console.error("Unable to connect to database:", ex);

        }

    }

    public getDataFromDb(days) {
        var q = 'SELECT * from helge99.samples99 ';
        if (days > 0) {
            q += 'WHERE creation_time > NOW() - INTERVAL ' + days + ' DAY';
        }
        q += ' order by creation_time desc';
        console.log("getData query:", q);

        return this.rxQuery(q).pipe(
            map( (res) => {
                let thermostats = [];
                res.results.forEach((r: any) => {
                    thermostats.push({
                        creation_time: r.creation_time,
                        thermostats: JSON.parse(r.thermostats),
                    });
                });
                let result = {
                    entries: res.results.length,
                    thermostats: thermostats,
                };
                return result
            })
        )

    }

    public storeDataToDb(res) {

        var allData = [];
        res.forEach((r) => {
            allData.push([
                r.names,
                r.setRoomTemp,
                r.actualRoomTemp,
                r.setbackTemp,
                r.heatingStatus
            ]);
        });

        console.log("TRYING TO STORE ", res);
        console.log("date ", Date.now());

        allData = <any>JSON.stringify(res);

        var values = [
            [allData]
        ];

        // Implementing poor mans fifo by removing entries older that x days...
        // TODO: Use subscription or use async/await and promise-mysql ?
        //       Handle response/errors
        this.dbConnection.query("DELETE FROM helge99.samples99 WHERE creation_time < NOW() - INTERVAL 100 DAY")
        // return this.dbConnection.query("DELETE FROM samples WHERE creation_time < NOW() - INTERVAL 100 DAY")
        //     .then( (result) => {
        //         console.log("# rows removed:", result.affectedRows);
        //     })
        //     .then((result) => {
        //         this.dbConnection.query("INSERT INTO samples (thermostats) VALUES ?", [values])
        //             .then( (result) => {
        //                 console.log("storeDataToDb result ready");
        //                 return result;
        //             });
        //     });

        // TODO: Use subscription or use async/await and promise-mysql ?
        //       Handle response/errors
        this.dbConnection.query("INSERT INTO helge99.samples99 (thermostats) VALUES ?", [values])
            // .then( (result) => {
            //     console.log("# rows removed:", result.affectedRows);
            // })
            // .then((result) => {
            //     this.dbConnection.query("INSERT INTO samples (thermostats) VALUES ?", [values])
            //         .then( (result) => {
            //             console.log("storeDataToDb result ready");
            //             return result;
            //         });
            // });
    }

    // observable wrapper around sql query
    // TODO: Check for newer libraries that does this automatically ?
    //       ...use async/await and promise-mysql instead ?
    rxQuery(queryString: string, values?: string[]): Observable<{results?: Object[], fields?: FieldInfo[]}> {
        return new Observable(observer => {
            this.dbConnection.query(queryString, values, (err: MysqlError, results?: Object[], fields?: FieldInfo[]) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next({ results, fields });
                }
                observer.complete();
            });
        });
    }

}
