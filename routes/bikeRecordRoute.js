const express = require('express');
const {
  createBikeRecord,
  getBikeRecords,
  updateBikeRecord,
  getAllBikeRecords,
  isAdmin,
} = require('../controllers/bikeRecordsController');

const router = express.Router();

router.get('/bikeRecords', getBikeRecords);
router.get('/allBikeRecords', isAdmin, getAllBikeRecords);
router.post('/bikeRecords', createBikeRecord);
router.patch('/bikeRecords', updateBikeRecord);

module.exports = router;
