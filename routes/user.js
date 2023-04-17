const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
    console.log('router user id')
    console.log(req.params, req.query);
    res.send('Hello, User Id');
});

router.get('/', (req, res) => {
    console.log('router user')
    res.send('Hello, User');
});

module.exports = router;
