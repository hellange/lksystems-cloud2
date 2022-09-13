import { Router} from 'express';

export class Status {
    router: Router

    constructor() {
        this.router = Router();

        this.router.get('/status', function (req, res) {
            res.json({'message' : 'Runnning'});
        });

    }

}
