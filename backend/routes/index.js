// backend/routes/index.js
const express = require('express');
const router = express.Router();

router.get('/api/csrf/restore', (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);
    res.status(200).json({
        'XSRF-TOKEN': csrfToken
    });
});

module.exports = router;
