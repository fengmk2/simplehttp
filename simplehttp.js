// A very simple http server
// serves files from the current directory and below, directly mapping the directory structure to HTTP requests.
// just like python SimpleHttpServer: http://docs.python.org/library/simplehttpserver.html

var fs = require('fs')
    , http = require('http');

var current_dir = process.cwd();

function show_dirs(path, req, res) {
    fs.readdir(path, function(err, files) {
        var dir = req.url;
        var buf = ['<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">\n<html>'];
        buf.push('<head><title>Directory listing for ' + dir + ' </title></head><body>');
        buf.push('<h2>Directory listing for ' + dir + ' </h2><hr /><ul>');
        if(req.url !== '/') {
		    files.unshift('..');
        }
		for(var i = 0, len = files.length; i < len; i++) {
            var name = files[i];
            if(name.indexOf('.') <= 0) {
                name += '/';
            }
            buf.push('<li><a href="' + dir + name + '">' + name + '</a></li>');
        }
        buf.push('</ul><hr /></body></html>');
        res.end(buf.join(''));
    });
};

var server = http.createServer(function(req, res) {
    console.log('[' + new Date() + ']', req.client.remoteAddress, req.url);
    var path = current_dir + decodeURIComponent(req.url);
    console.log(path)
    if(path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1);
    }
    fs.stat(path, function(err, stats) {
        if(!stats) {
            res.statusCode = 404;
            res.end('No such file or directory ' + req.url);
            return;
        }
        if(stats.isDirectory()) {
            show_dirs(path, req, res);
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
            fs.readFile(path, function(err, data) {
                res.end(data);
            });
        }
    });
});

server.listen(8000);
console.log('Serving HTTP on http://' + require('os').hostname() + ':8000');
