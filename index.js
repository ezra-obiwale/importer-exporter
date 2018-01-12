require('dotenv').config();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var Tasks = require('./app/Tasks');
var Utils = require('./app/Utils');
var json2xls = require('json2xls');

app.use(bodyParser.json());
app.use(json2xls.middleware);

/** API path that will upload the files */
app.post('/upload', function (req, res) {
    Utils.upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No excel file uploaded" });
            return;
        }

        let excelToJson = Utils.excel(req.file);
        try {
            excelToJson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function (err, tasks) {
                if (err) {
                    return res.json({ error_code: 1, err_desc: err, data: null });
                }

                Tasks.sync().then(() => {
                    let failed = 0;

                    tasks.forEach(task => {
                        // format boolean properly
                        if (task.completed.toLowerCase() == 'true' ||
                            task.completed.toLowerCase() == 'yes') {
                            task.completed = true;
                        }
                        else {
                            task.completed = false;
                        }

                        // create the task
                        let created = Tasks.create(task);
                        if (!created) {
                            failed++;
                        }
                    });

                    let status = 'success=Upload was successful';
                    if (failed) {
                        status = 'error=' + failed + ' lines could not be uploaded';
                    }
                    
                    // redirect as successful
                    res.redirect('/?' + status);
                });

            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Excel file is corrupt" });
        }

        // delete file
        try {
            fs.unlinkSync(req.file.path);
        }
        catch (e) {
            // file not deleted
        }
    });
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get('/download/template', function(req, res) {
    res.sendFile(__dirname + '/tasks.xlsx');
});
app.get('/download/tasks', function(req, res) {
    Tasks.findAll().then(tasks => {
        let data = tasks.map(task => task.dataValues);
        res.xls('tasks_data.xlsx', data);
        res.end();
    });
});

app.listen('80', function () {
    console.log('running on 3000...');
});