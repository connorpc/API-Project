// app.js
// require everything
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

// self explanatory code that checks if env var 'environment' is set to 'production' or not
const { environment } = require('./config');
const isProduction = environment === 'production';

// initialize express application
const app = express();

// connect morgan middleware for logging info about requests and responses
app.use(morgan('dev'));

// add cookie-parser middleware for parsing cookies
app.use(cookieParser());
// add express.json middleware for parsing json bodies of requests
app.use(express.json());

// security middleware
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// set the _csrf token and create req.csrfToken method
app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction && 'Lax',
            httpOnly: true
        }
    })
);

// connect all the mf routes
app.use(routes);

// Your code here


module.exports = app;
