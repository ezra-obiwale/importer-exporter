const aws = require('aws-sdk');

module.exports = new class {
    constructor() {
        aws.config.region = process.env.AWS_S3_REGION;
        aws.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        aws.config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        
        this.s3 = new aws.S3({
            params: {
                Bucket: process.env.AWS_S3_BUCKET
            }
        });
    }

    upload(file, callback) {
        this.filename = Date.now() + '-' + file.name;
        this.s3.putObject(
            {
                Key: this.filename,
                Body: file.data
            },
            callback
        );
    }

    fetch(filename, callback) {
        this.s3.getObject({
            Key: filename || this.filename
        }, callback);
    }

    delete(filename, callback) {
        this.s3.deleteObjects({
            Delete: {
                Objects: [{
                    Key: filename || this.filename
                }]
            }
        }, callback);

    }
}