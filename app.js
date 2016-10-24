//http://stackoverflow.com/questions/17309559/stream-uploading-file-to-s3-on-node-js-using-formidable-and-knox-or-aws-sdk
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


http.createServer(function(req, res) {

    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {

        var form = new formidable.IncomingForm();

        form.on('progress', function(bytesReceived, bytesExpected) {
            console.log('onprogress', parseInt( 100 * bytesReceived / bytesExpected ), '%');
        });

        form.on('error', function(err) {
            console.log('err',err);
        });

        form.on('end', function() {
            console.log('ended!!!!', arguments);
        });

        form.on('aborted', function() {
            console.log('aborted', arguments);
        });

	form.on('file', function(name, file, arguments){
            console.log(arguments);
            //var a = arguments;
            //console.log(a[1]['name']);
            //console.log(a[1]['path']);
        });

        //var s3 = new AWS.S3();
        //var params = {Bucket: 'bizzar-s3-upload', Key: 'myImageFile.jpg'};
        //var file = require('fs').createWriteStream('/path/to/file.jpg');
        //s3.getObject(params).createReadStream().pipe(file);

        form.parse(req, function(err, fields, files) {
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
