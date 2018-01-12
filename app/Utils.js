const multer = require('multer');
const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
const upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
        let file_ext = file.originalname.split('.')[file.originalname.split('.').length - 1];
        if (['xls', 'xlsx'].indexOf(file_ext) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');


const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");

const excel = file => {
    let ext = file.originalname.split('.')[file.originalname.split('.').length - 1];

    /** Check the extension of the incoming file and 
     *  use the appropriate module
     */
    if (ext === 'xlsx') {
        excelToJson = xlsxtojson;
    } else {
        excelToJson = xlstojson;
    }

    return excelToJson;
};

module.exports = {
    upload,
    excel
}