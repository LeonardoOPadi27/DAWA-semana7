import userService from '../services/UserService.js';

class UserController {

    async getAll(req, res, next) {
        try {
            const users = await userService.getAll();
            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    async getMe(req, res, next) {
        try {
            const user = await userService.getById(req.userId);
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    async updateMe(req, res, next) {
    try {
        const user = await userService.update(req.userId, req.body);
        res.json(user);
    } catch (err) {
        next(err);
    }
}
}

export default new UserController();