var connect = require('connect');
var serveStatic = require('serve-static');
var childProcess = require('child_process');
var formidable = require('formidable');
var Promise = require("es6-promise").Promise

var app = connect();

function runCmd(cmd, args) {
  return new Promise(function(fullfill, reject){
    console.log("runCmd", cmd, args);
    var spawn = childProcess.spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { 
      console.log(buffer.toString());
      resp += buffer.toString();
    });
    
    child.stdout.on('end', function() { 
      fullfill(resp);
    });

    child.on('error', function (err) {
      console.log('error', cmd, err);
      reject(cmd + " " + args.join(" ") + " : " + err.code);
    });

    child.on('close', function(code){
      console.log('child process', cmd, code);
    });
  });
}

function parseForm(req, callback){
  return new Promise(function(fullfill, reject){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';  
    form.uploadDir = 'tmp';

    form.parse(req, function(err, fields, files) {
      if(err){
        reject(err);
      } else {
        if(files && files.file){
          fullfill(files.file.path);
        } else {
          reject('misssing file');
        }
      }
    });
  });
}

app.use('/upload', function(req, res){
  parseForm(req).then(function(file){
    console.log("file", file);
    var p = runCmd('mv', [file, file + '.org']);
    return Promise.all([file, p]);
  }).then(function(file){
    console.log("run", arguments);
    var args = ['-i', file[0] + '.org', '-acodec', 'pcm_s16le', '-ac', '1', '-ar', '16k', file[0] + '.wav'];
    var p = runCmd('ffmpeg', args);
    return Promise.all([file[0], p]);
  }).then(function(file){
    var p = runCmd('vid', ['-i', file[0] + '.wav', '-f', 'json']);
    return Promise.all([file[0], p]);
  }).then(function(file){
    return runCmd('cat', [file[0] + '.json']);
  }).then(function(out){
    out = out.replace(/\'/g, '"');
    res.end(out);
  }).catch(function(err){
    console.log("err", err);
    res.end(err);
  });
});

app.use(serveStatic(__dirname + '/public'));

app.listen(3000);
