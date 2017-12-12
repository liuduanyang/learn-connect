# connect

***

### 导言:  
connect模块是由TJ大神所写，TJ的另一个杰作 express框架在connect模块的基础上构建。模块源码十分精简，只有二百多行。  

### 一、前期介绍(准备阶段)

#### 为什么 connect ?

http创建服务器接收请求时，所有的响应都要写在一个回调函数里面，对于不同的请求路径，所返回的响应信息都是通过if和else来区分，所有的逻辑都是在一个函数中，当逻辑复杂起来会有各种回调，极容易出现问题，故有了让问题简单起来的connect中间件的产生，connect把所有的请求信息都拆分开，形成多个中间件，http请求就相当于是水流一样流过中间件，当路径相同时，就会响应该请求，否则就继续往下流，直到结束。

#### 何为中间件？
中间件就是一个函数，该函数用来响应请求，可通过判断路径来决定是否执行。

#### connect 执行流程

	url请求---> 中间件A--->中间件B--->中间件C--->中间件D--->中间件E
			^
			|
		与中间件A配置的路由进行判断,相同则执行A函数，直至end函数被调用；
		如果不同则继续匹配下一个中间件B，重复执行，直至匹配完所有中间件

### 二、源码解读

connect源码可分为六部分  

* 1. 源码的准备阶段  

引入模块依赖

	var debug = require('debug')('connect:dispatcher');  //用于调试代码
	var EventEmitter = require('events').EventEmitter;   //用于触发响应事件
	var finalhandler = require('finalhandler');          //用于最后执行url请求
	var http = require('http');                          //用于创建http服务
	var merge = require('utils-merge');                  //用于继承(对象之间属性融合)
	var parseUrl = require('parseurl');                  //用于解析url

暴露模块接口

	module.exports = createServer;

判断当前环境 根据是development或production 而做出不同的配置处理  development为默认环境

	var env = process.env.NODE_ENV || 'development';

声明proto对象
	
	var proto = {};

使用istanbul代码覆盖率测试工具时 忽略这段代码

	var defer = typeof setImmediate === 'function'
  	? setImmediate
  	: function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

* 2. createServer用于创建一个 connect 实例(是一个函数对象)

-

	function createServer(){
  		//创建一个app函数 接收三个参数 函数体为执行app函数对象的handle方法
  		function app(req, res, next){ app.handle(req, res, next); }

  		//app函数对象继承proto对象
  		merge(app, proto);
  		
		//app函数对象继承EventEmitter.prototype对象
  		merge(app, EventEmitter.prototype);
  		
		//为app函数对象添加route属性 存放路径地址
  		app.route = '/';
  		
		//为app函数对象添加stack属性 存放中间件
  		app.stack = [];
  		
		return app;
	}

* 3. proto对象的use方法 用来添加中间件，在createServer函数中继承给了app函数对象

-

	proto.use = function use(route, fn) {
  		var handle = fn;
  		var path = route;

  	// 如果第一个参数不是字符串类型 则将第一个参数传给第二个参数(中间件函数)  并设置路径默认为'/'
  	if (typeof route !== 'string') {
    	handle = route;
    	path = '/';
  	}

  	//对fn可能的几种特殊情况进行判断
  	// 如果fn也为一个中间件时，那么堆栈中存储的handle为这个子中间件的fn.handle()方法
  	if (typeof handle.handle === 'function'){
    	var server = handle;
   		server.route = path;
    	handle = function (req, res, next) {
      		server.handle(req, res, next);
    	};
  	}

  	// 如果fn是http.Server类的实例时，那么handle为该httpServer的request事件的第一个监听者
  		if (handle instanceof http.Server) {
    		handle = handle.listeners('request')[0];
  		}

  	// 删除req.url末尾多余的'/'
  		if (path[path.length - 1] === '/') {
    		path = path.slice(0, -1);
  		}

  	// 添加这个中间件
  		debug('use %s %s', path || '/', handle.name || 'anonymous');
  
  	//将中间件函数和路径包裹成一个对象，并将其添加到用于存储中间件的stack数组(栈)中
  		this.stack.push({ route: path, handle: handle });

  	//this指该方法(use)的调用者
  		return this;
	};

* 4. proto对象的handle方法 用来操作发送给服务器的请求，让他们匹配stack栈中中间件

-

	proto.handle = function handle(req, res, out) {
  		var index = 0;
  		var protohost = getProtohost(req.url) || '';
  		var removed = '';
  		var slashAdded = false;
  		var stack = this.stack;

  	// 设置最后一个响应request请求
  		var done = out || finalhandler(req, res, {
    		env: env,
    		onerror: logerror
  		});

  	// 存储初始url地址
  		req.originalUrl = req.originalUrl || req.url;

  	/*
  	next函数用来做流控制，即用来触发下一个中间件的回调函数，调用next()后，
  	程序会继续从app.stack堆栈中调用下一个中间件的回调函数
  	*/

  		function next(err) {
    		if (slashAdded) {
      			req.url = req.url.substr(1);
      			slashAdded = false;
    		}

    		if (removed.length !== 0) {
      			req.url = protohost + removed + req.url.substr(protohost.length);
      			removed = '';
    		}

    // 访问下一个中间件对象
    		var layer = stack[index++];

    // 错误处理
    		if (!layer) {
      			defer(done, err);
      			return;
    		}

    // 分别获取中间件的路由以及请求的资源地址
    	var path = parseUrl(req).pathname || '/';
    	var route = layer.route;

    // 如果二者不匹配 则调用下一个中间件
    	if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) {
      		return next(err);
    	}

    // url处理
    	var c = path.length > route.length && path[route.length];
    	if (c && c !== '/' && c !== '.') {
      		return next(err);
    	}

    	if (route.length !== 0 && route !== '/') {
      		removed = route;
      		req.url = protohost + req.url.substr(protohost.length + removed.length);

      	if (!protohost && req.url[0] !== '/') {
        	req.url = '/' + req.url;
        	slashAdded = true;
      	}
    	}

    // 匹配成功则调用中间件
    	call(layer.handle, route, err, req, res, next);
  	}

  	next();
	};

* 5. proto对象的listen方法调用了http模块(也支持https模块)的createServer()和listen()方法

-

	proto.listen = function listen() {
  		var server = http.createServer(this);
  		return server.listen.apply(server, arguments);
	};

* 6. call函数在handle方法中被调用


当发生错误且传递了4个参数时就会调用handle(err,req, res, next)这个函数，当没有发生错误且传递的参数小于4个时就会调用handle(req, res, next)，这里的handle函数是传进来的一个函数

	function call(handle, route, err, req, res, next) {
  		var arity = handle.length;
  		var error = err;
  		var hasError = Boolean(err);

  		debug('%s %s : %s', handle.name || '<anonymous>', route, req.originalUrl);

  		try {
    		if (hasError && arity === 4) {
      		// 调用带有错误对象的handle方法
      			handle(err, req, res, next);
      			return;
    		} else if (!hasError && arity < 4) {
      		// 正常调用handle方法
      			handle(req, res, next);
      			return;
    		}
  		} catch (e) {
    		// 将错误对象赋值给error
    		error = e;
  		}

  		// 调用next方法 并把error(e)错误对象传入
  		next(error);
	}

* 7. 打印错误日志

-

	function logerror(err) {
  		if (env !== 'test') console.error(err.stack || err.toString());
	}

* 8. 获取主机

-

	function getProtohost(url) {
  		if (url.length === 0 || url[0] === '/') {
    		return undefined;
  		}

  	//如果req.url中有'?'则将'?'所在的下标作为长度 否则将url.req的长度作为长度
  		var searchIndex = url.indexOf('?');
  		var pathLength = searchIndex !== -1
    		? searchIndex
    		: url.length;

  	//如果有'://'则从头开始截取一直到'://'之后出现'/'的位置
  		var fqdnIndex = url.substr(0, pathLength).indexOf('://');
  		return fqdnIndex !== -1
    		? url.substr(0, url.indexOf('/', 3 + fqdnIndex))
    		: undefined;
	}

