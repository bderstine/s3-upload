var fs = require('fs');
var formidable = require('formidable');
var http = require('http');
var util = require('util');
var AWS  = require('aws-sdk');
var config = require('config');
var s3 = new AWS.S3({
    accessKeyId: config.get('S3_ACCESS_KEY'),
    secretAccessKey: config.get('S3_SECRET_KEY'),
    apiVersion: '2006-03-01'
});

var myBucket = 'bizzar-s3-upload';

http.createServer(function(req, res) {

    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {

        var form = new formidable.IncomingForm();

        form.on('progress', function(bytesReceived, bytesExpected) {
            //console.log('onprogress', parseInt( 100 * bytesReceived / bytesExpected ), '%');
        });

        form.on('error', function(err) {
            console.log('err',err);
        });

        form.on('end', function() {
            //console.log('ended!!!!', arguments);
        });

        form.on('aborted', function() {
            console.log('aborted', arguments);
        });

        form.parse(req, function(err, fields, files) {

            var fileContents = fs.readFileSync(files.upload.path);
            s3.createBucket(function() {
              var params = {Bucket: myBucket, Key: files.upload.name, Body: fileContents};
              s3.upload(params, function(err, data) {
                if (err) {
                  console.log("Error uploading data: ", err);
                } else {
                  console.log("Successfully uploaded data to "+myBucket+"/"+files.upload.name);
                }
              });
            });

            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });
        return;
    }

    // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
}).listen(8080);
