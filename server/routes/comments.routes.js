const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');
const verifyToken = require('../middleware/auth');

router.put('/:id', verifyToken, commentsController.updateComment);
router.delete('/:id', verifyToken, commentsController.deleteComment);

module.exports = router;
