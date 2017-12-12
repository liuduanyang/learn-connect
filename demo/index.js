var connect=require("connect");
var http=require("http");
var fs=require("fs");

process.on('uncaughtException',function(err){
    console.log(err.message);
});

var app=connect();

app.use(function(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync(req.url.slice(1)+'.html').toString());
    res.end();
})

app.use('one',start);
app.use('two',follow);
app.use('three',end);
app.use('four',thanks);

function start(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync(req.url.slice(1)+'.html').toString());
    res.end();
}

function follow(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync(req.url.slice(1)+'.html').toString());
    res.end();
}

function end(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync(req.url.slice(1)+'.html').toString());
    res.end();
}

function thanks(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync(req.url.slice(1)+'.html').toString());
    res.end();
}


http.createServer(app).listen(8080,function(){console.log("服务已启动...")});