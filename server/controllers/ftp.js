var fs = require('fs')
var FTPClient = require('ftp')
var c = new FTPClient()
const Papa = require('papaparse')

// const PromiseFtp = require('promise-ftp')
// ftp = new PromiseFtp()
// const csv = require("csvtojson")


// var Client = require('ftp');
// // var csv = require('fast-csv');


// exports.READ_CSV_FILE3 = (req, res) => {
//     c.connect({
//         host: "192.168.114.23",
//         user: "beximco",
//         password: "beximco"
//     })

//     c.on('ready', function () {
//         c.get('/I_EVTSCAN.csv', function (err, stream) {
//             if (err) throw err
//             // stream.once('close', function () { c.end() })
//             var content = ''
//             stream
//                 .on('data', function (chunk) {
//                     console.log('called')
//                     content += chunk.toString()
//                 })
//                 .on('end', function () {
//                     Papa.parse(content, {
//                         complete: function (results) {
//                             // return res.json(results.data).end()
//                             res.write(results.data).end()
//                         }
//                     })
//                 }).on('close', function (err) {
//                     console.log("Stream has been destroyed and file has been closed")
//                 })

//             // csv.fromStream(stream, { headers: false })
//             //     .on("data", function (data) {
//             //         console.log(data);
//             //         return res.json(data).end()
//             //     })
//             //     .on("end", function () {
//             //         console.log("done");
//             //     });
//         })
//     })
// }

// exports.READ_CSV_FILE2 = (req, res) => {
//     var c = new Client();
//     c.connect({
//         host: "192.168.114.23",
//         user: "beximco",
//         password: "beximco"
//     })

//     c.on('ready', function () {
//         c.get('/I_EVTSCAN.csv', function (err, stream) {
//             if (err) throw err;
//             stream.once('close', function () { c.end(); });
//             csv.fromStream(stream, { headers: false })
//                 .on("data", function (data) {
//                     console.log(data);
//                 })
//                 .on("end", function () {
//                     console.log("done");
//                 });
//         });
//     });
// }





const PromiseFtp = require('promise-ftp'), ftp = new PromiseFtp()
const csv = require("csvtojson")


var csvFiles = [
    {
        file_name: 'I_STATUS',
        file_path: '/I_STATUS.csv'
    },
    {
        file_name: 'I_DOFFPRD',
        file_path: '/I_DOFFPRD.CSV',
    },
    {
        file_name: 'I_EVTSCAN',
        file_path: '/I_EVTSCAN.csv',
    }
]

const serverIP = [
    { ip: '192.168.114.24', server_name: 'machine1' },
    { ip: '192.168.114.24', server_name: 'machine2' }
]

var jsonArray = []
var jsonObject = {}

exports.READ_CSV_FILE = async (req, res) => {
    try {
        for (const server of serverIP) {
            for (const file of csvFiles) {
                await ftpSingleFileRead(file.file_path, file.file_name, server.ip, server.server_name)
            }
        }
        // for (const file of csvFiles) {
        //     await fptUpdate(file.file_path, file.name)
        //     // console.log(jsonArray.length)
        //     // jsonArray = []
        //     // console.log('Processed file: ' + file)
        // }
        return res.status(200).json(jsonObject)
    } catch (error) {
        console.log(error)
    }
}

var credentails = {
    host: "192.168.114.24",
    user: "beximco",
    password: "123456"
}

const ftpSingleFileRead = async (file_path, file_name, server_ip, server_name) => {
    await ftp.connect({ ...credentails, host: server_ip }).then(function () {
        return ftp.get(file_path)
    }).then(function (stream) {
        return new Promise(function (resolve, reject) {
            var csvData = []
            stream.pipe(csv({ noheader: true }))
                .on('data', (row) => { // Calls for every row fetching
                    /** Data calls for every row of csv file(As it is coming by stream concept)
                     * So we have to make an array from all rows
                     * convert row to string and string to json
                     * Then push it to an array(Here csvData)
                     */
                    const jsonFormatedRow = JSON.parse(row.toString('utf8')) // stream row -> string -> json
                    csvData.push(jsonFormatedRow) // Making array
                })
                .on('end', () => { // Calls after finishing all rows fetch
                    jsonObject = {
                        ...jsonObject,
                        [server_name]: {
                            server_ip,
                            ...jsonObject[server_name],
                            [file_name]: {
                                file_path: file_path,
                                file_name: file_name,
                                data: csvData
                            }
                        }
                    }
                    resolve()
                })
                .on('error', (err) => reject(err))
        })
    }).then(function () {
        return ftp.end()
    })
}


const fptUpdate = async (file_path, name) => {
    await ftp.connect(credentails).then(function () {
        return ftp.get(file_path)
    }).then(function (stream) {
        return new Promise(function (resolve, reject) {
            var csvData = []
            stream.pipe(csv({ noheader: true }))
                .on('data', (row) => { // Calls for every row fetching
                    /** Data calls for every row of csv file(As it is coming by stream concept)
                     * So we have to make an array from all rows
                     * convert row to string and string to json
                     * Then push it to an array(Here csvData)
                     */
                    const jsonFormatedRow = JSON.parse(row.toString('utf8')) // stream row -> string -> json
                    csvData.push(jsonFormatedRow) // Making array
                })
                .on('end', () => { // Calls after finishing all rows fetch
                    jsonArray.push({
                        file_path: file_path,
                        file_name: name,
                        [name]: csvData
                    })
                    resolve()
                })
            stream.on('error', (err) => reject(err))
        })
    }).then(function () {
        return ftp.end()
    })
}

