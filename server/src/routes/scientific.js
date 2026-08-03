const express = require('express');
const router = express.Router();
const { getAllScientificWorks, getScientificWorkById, createScientificWork, updateScientificWork, deleteScientificWork } = require('../controllers/scientificController');
const authMiddleware = require('../middlewares/auth');
const { uploadScientific } = require('../middlewares/upload');

router.get('/', getAllScientificWorks);
router.get('/:id', getScientificWorkById);
router.post('/', authMiddleware, uploadScientific, createScientificWork);
router.put('/:id', authMiddleware, uploadScientific, updateScientificWork);
router.delete('/:id', authMiddleware, deleteScientificWork);

module.exports = router;
