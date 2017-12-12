var connect=require("connect");
var http=require("http");
var fs=require("fs");

process.on('uncaughtException',function(err){
    console.log(err.message);
});

var app=connect();

app.use('//',function(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync('index.html').toString());
    res.end();  
});

app.use('/one',function(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync('one.html').toString());
    res.end();
});

app.use('/two',function(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync('two.html').toString());
    res.end();
});
app.use('/three',function(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync('three.html').toString());
    res.end();
});

app.use('/four',function four(req,res,next){
    res.setHeader('Content-Type','text/html');
    res.write(fs.readFileSync('four.html').toString());
    res.end();
});

http.createServer(app).listen(8080,function(){console.log("服务已启动...")});