const express = require('express')
require('dotenv').config()
const cors = require('cors')
const morgan = require('morgan')

const app = express()

app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.static('public'))
app.use(cors())
app.use(morgan('dev'))

const fs = require('fs')

// fs.readFile('test.CSV', 'utf8', function (err, data) {
//     console.log(data)
// })

const Papa = require('papaparse')

// Papa.parse('../public/test.CSV', {
//     worker: true,
//     complete: function (results) {
//         console.log(results)
//         console.log("Finished:", results.data);
//     }
// });

app.use('/home', (req, res) => res.send('working'))

app.use('/file', express.static('./public/test.CSV'))

app.use('/data', (req, res) => {
    const c = fs.readFileSync('./public/I_DOFFPRD.csv', 'utf8')
    Papa.parse(c, {
        // header: true,
        complete: function (results) {
            return res.send(results.data)
        }
    });
})

app.use('/ftp', require('./routers/router'))

process.env.ENVIORNMENT === 'PRODUCTION'
    ? app.listen(process.env.port)
    : app.listen(process.env.port, () => console.log('Server running on :' + process.env.port))