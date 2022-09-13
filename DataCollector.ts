import {RxHR} from "@akanass/rx-http-request";
import {combineLatest, Subject} from "rxjs";
import {DataBase} from "./DataBase";
import { map } from 'rxjs/operators';

const LK_BASE_URL = "https://my.lk.nu/"

export class DataCollector {

    public cookie // Store cookie for auth
    private db: DataBase

    constructor(dataBase: DataBase) {
        this.db = dataBase
        console.warn("DataCollector initialized")
        this.login()
    }

    login() {
        const options = {
            form: {
                email: process.env.LK_USERNAME,
                password: process.env.LK_PASSWORD
            },
            headers: {
                'User-Agent': 'lksystems-monitor-test'
            },
            json: true
        };
        const login$ = RxHR.post(LK_BASE_URL + "login", options);

        return login$.subscribe(next => {
            const headers = next.response.headers
            this.cookie = headers["set-cookie"]
            console.log("Got cookie after login:", this.cookie)
        })
    }


    hexToAscii(hexInString: String){
        var hex = hexInString.toString();
        var str = '';
        for (let n = 0; n < hex.length; n += 2) {
            str += String.fromCharCode(parseInt(hex.substring(n, n+2), 16));
        }
        return str;
    }

    public collectAndStoreThermostatData() {

        let thermostats = [];

        return combineLatest([
            this.getThermostatInfo(1),
            this.getThermostatInfo(2),
            this.getThermostatInfo(3),
            this.getThermostatInfo(4),
            this.getThermostatInfo(5),
        ]).subscribe((res) => {
            res.forEach( (res) => {
                thermostats.push(res)
            })
            console.info("Store thermostats", thermostats)
            if (this.db.dbConnection) {
                this.db.storeDataToDb(thermostats);
            }
        })
    }

    private getThermostatInfo(i) {

        let url = LK_BASE_URL + "thermostat.json?tid=" + i;
        let res = <any>{};

        return RxHR.get(url, {
            headers: {
                "content-type": "application/json",
                "cookie": this.cookie
            }
        }).pipe(
            map(response => {
                const body = response.body

                var name = JSON.parse(body).name;
                var setRoomTemp = JSON.parse(body).set_room_deg;
                var actualRoomTemp = JSON.parse(body).get_room_deg;
                var heatingStatus = JSON.parse(body).heat_status;
                var setbackTemp = JSON.parse(body).setback_deg;

                res.names = this.hexToAscii(name);
                res.setRoomTemp = (setRoomTemp / 100).toFixed(1);
                res.actualRoomTemp = (actualRoomTemp / 100).toFixed(1);
                res.setBackTemp = (setbackTemp / 100).toFixed(1);
                res.heatingStatus = heatingStatus;

                return res

            })
        )
    }


}
