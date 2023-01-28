// backend/routes/api/session.js
// this file will hold the resources for the route paths beginning with
// /api/session
const express = require('express');

const { setTokenCookie, restoreUser } = require('../../utils/auth.js');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation.js');

const router = express.Router();

const validateLogin = [
    check('credential')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Please provide a valid email or username.'),
    check('password')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a password.'),
    handleValidationErrors
]

// login - post /api/session
router.post('/', validateLogin, async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.login({ credential, password });

    if (!user) {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = ['The provided credentials were invalid.'];
        return next(err);
    }

    await setTokenCookie(res, user);

    return res.json({
        user: user
    });
})

// logout route (fun to say)
router.delete('/', (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
})

// restore session user
router.get('/', restoreUser, (req, res) => {
    const { user } = req;
    if (user) {
        return res.json({
            user: user.toSafeObject()
        });
    } else return res.json({ user: null });
});

module.exports = router;
