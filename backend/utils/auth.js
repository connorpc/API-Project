// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// user auth middlewares

// first middleware function is setting JWT cookie after a user is logged in or
// signed up. it takes in a response and the session user and generates a JWT
// using the imported secret. it is set to expire in however many seconds you set
// on the JWT_EXPIRES_IN key in the .env file. The payload of the JWT will be the
// return of the instance method .toSafeObject that you added previously to the
// User model. after the JWT is created, it's set to an HTTP-only cookie on the
// response as a token cookie
//
// sends a jwt cookie
const setTokenCookie = (res, user) => {
    // create the token
    const token = jwt.sign(
        { data: user.toSafeObject() },
        secret,
        { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && 'Lax'
    });

    return token;
}

// restoreUser will restore the session user based on the contents of the JWT
// cookie.
// middleware function will verify and parse JWT's payload and search the
// database for a User with the ID in the payload (this query should use the
// currentUser scope since the hashedPassword is not needed for this operation).
// if there is a User found, then save the user to a key of user onto the request,
// req.user. if there is an error verifying the JWT or a User cannor be found with
// the id, then clear the token cookie from the response and set req.user to null.
const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            return next();
        }

        try {
            const { id } = jwtPayload.data;
            req.user = await User.scope('currentUser').findByPk(id);
        } catch (e) {
            res.clearCookie('token');
            return next();
        }

        if (!req.user) res.clearCookie('token');

        return next(); // move to next middleware (requireAuth)
    });
}

// requireAuth middle ware is for requiring a session user to be authenticated
// before accessing a route
// define thie middleware as an array with the restoreUser middleware above as the
// first element in the array. this will ensure that if a valid JWT cookie exists
// the session user will be loaded into the req.user attribute. the second middleware
// will check req.user and will go to the next middleware if there is a session user
// present there. if there is no session user, then an error will be created and
// passed along to the error-handling middlewares
//
// if there is no current user, return an error
const requireAuth = (req, _res, next) => {
    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = ['Authentication required'];
    err.status = 401;
    return next(err);
}

module.exports = { setTokenCookie, restoreUser, requireAuth };
