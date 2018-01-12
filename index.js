require('dotenv').config();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var Tasks = require('./app/Tasks');
var AWS = require('./app/AWS');
var json2xls = require('json2xls');
var uploader = require('express-fileupload');
var xlsx = require('xlsx');

app.use(bodyParser.json());
app.use(json2xls.middleware);
app.use(uploader());

/** API path that will upload the files */
app.post('/upload', function (req, res) {
    AWS.upload(req.files.file, (err, data) => {
        AWS.fetch(null, (err, data) => {
            try {
                let workbook = xlsx.read(data.Body, {
                    type: 'buffer'
                });
                
                const sheet_name_list = workbook.SheetNames;
                let sheet1 = workbook.Sheets[sheet_name_list[0]];
                let tasks = xlsx.utils.sheet_to_json(sheet1);
    
                Tasks.sync().then(() => {
                    let failed = 0;
    
                    tasks.forEach(task => {
                        // format boolean properly
                        if (task.Completed.toLowerCase() == 'true' ||
                            task.Completed.toLowerCase() == 'yes' ||
                            task.Completed.toLowerCase() == 1) {
                            task.Completed = true;
                        }
                        else {
                            task.Completed = false;
                        }
    
                        // create the task
                        let data = {
                            description: task.Description,
                            completed: task.Completed
                        };
                        
                        if (!Tasks.create(data)) {
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
            } catch (e) {
                console.log(e.message);
                res.redirect('/?error=Upload failed');
            }
            AWS.delete();
        });
    });
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get('/download/template', function (req, res) {
    res.sendFile(__dirname + '/tasks.xlsx');
});
app.get('/download/tasks', function (req, res) {
    Tasks.findAll().then(tasks => {
        let data = tasks.map(task => task.dataValues);
        res.xls('tasks_data.xlsx', data);
        res.end();
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('running on 3000...');
});