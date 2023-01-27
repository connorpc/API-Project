// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const { restoreUser } = require('../../utils/auth.js');

// connect restoreUser middleware to the API router
//     if current user session is valid, set req.user to the user in the database
//     if current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
});

module.exports = router;

// -------------------------- USER AUTH MIDDLEWARE TESTS --------------------------
//
// // get /api/set-token-cookie
// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');
// router.get('/set-token-cookie', async (_req, res) => {
//     const user = await User.findOne({
//         where: {
//             username: 'connorgav'
//         }
//     });
//     setTokenCookie(res, user);
//     return res.json({ user: user });
// });

// // get /api/restore-user


// router.get('/restore-user', (req, res) => {
//     return res.json(req.user);
// });

// // test requireAuth middleware. if no session user, route will return error.
// // otherwise, route will return session user's information
// //
// // get /api/require-auth
// const { requireAuth } = require('../../utils/auth.js');
// router.get('/require-auth', requireAuth, (req, res) => {
//     return res.json(req.user);
// });
