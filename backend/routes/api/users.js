// backend/routes/api/users.js
// this file will hold the resources for the route paths beginning with
// /api/users
const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth.js');
const { User } = require('../../db/models');

const router = express.Router();

// post /api/users route
// inside the (async) route handler will be a call to the User static method
// signup(). if a new user is successfully created, call setTokenCookie and return
// a json response with the user information (scope?). if creation is unsuccessful,
// then a sequelize validation error will be passed onto the next err handling mware
router.post('/', async (req, res) => {
      const { email, password, username } = req.body;
      const user = await User.signup({ username, email, password });

      await setTokenCookie(res, user);

      return res.json({
        user: user
      });
    }
  );

module.exports = router;
