const express = require('express');
const router = express.Router();
const worker = require('./worker');

router.get('/rooms',worker.rooms);
router.get('/consumption',worker.consumption);
router.post('/toggle',worker.toggle);

module.exports = router;
