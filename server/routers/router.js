const express = require('express')
const router = express.Router()

const {
    READ_CSV_FILE,
} = require('../controllers/ftp')

/**=================FTP================= */
router.get('/read-csv', READ_CSV_FILE)


module.exports = router