const express = require('express');
const router = express.Router();

const agencyRoutes = require('./agency.routes');
const exportRoutes = require('./export.routes');
const receiptRoutes = require('./receipt.routes');
const reportRoutes = require('./report.routes');
const ruleRoutes = require('./rule.routes');

router.use('/agencies', agencyRoutes);
router.use('/exports', exportRoutes);
router.use('/receipts', receiptRoutes);
router.use('/reports', reportRoutes);
router.use('/rules', ruleRoutes);

module.exports = router;
