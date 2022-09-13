import {NextFunction, Request, Response, Router} from 'express';

export class Thermostats {
    public router: Router

    constructor(dataBase) {
        this.router = Router();

        this.router.get('/data', (req: Request, res: Response, next: NextFunction) => {
            console.log(" - - - query params", req.query);
            let days = req.query.days;
            console.log(" - - - days", days);
            dataBase.getDataFromDb(days).subscribe((data) => {
                res.send(data)
            })
        });

    }

}

