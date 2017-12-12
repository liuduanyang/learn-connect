# Connect

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

  Connect 是一个基于Node.js的可使用中间件来进行扩展的http服务框架。

	var connect = require('connect');
	var http = require('http');

	var app = connect();

	// 压缩响应代码
	var compression = require('compression');
	app.use(compression());

	// 存储信息到浏览器的cookie
	var cookieSession = require('cookie-session');
	app.use(cookieSession({
    	keys: ['secret1', 'secret2']
	}));

	// 消息体解析中间件，解析后存放于req.body中
	var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({extended: false}));

	// 响应请求
	app.use(function(req, res){
  		res.end('Hello from Connect!\n');
	});

	//创建nodejs的http服务以及监听端口
	http.createServer(app).listen(3000);

## 起步

Connect是一个简单的框架，作用是依赖于各种各样的中间件组合体去处理请求。

### 安装 Connect

```sh
$ npm install connect
```

### 创建一个 app

"app"是Connect的最主要的部分，它将用来存储所有被添加的中间件，而它本身是一个函数(确切的说是函数对象)。

	var app = connect();

### 处理中间件

The core of Connect is "using" middleware. Middleware are added as a "stack"
where incoming requests will execute each middleware one-by-one until a middleware
does not call `next()` within it.

Connect的核心是处理中间件，中间件被添加到"stack"变量(一个数组，用来存放中间件)中，请求将会依次对"stack"中存放的每一个中间件进行匹配，直到某一个中间件函数不再调用`next()`。


	app.use(function middleware1(req, res, next) {
  	  // middleware 1
  	  next();
	});
	app.use(function middleware2(req, res, next) {
  	  // middleware 2
  	  next();
	});

### 挂载中间件

`.use()`方法允许添加可选的字符串路径作为参数，当url请求到来时与其进行匹配，允许添加根路径。

	app.use('/foo', function fooMiddleware(req, res, next) {
  	  // req.url starts with "/foo"
  	  next();
	});
	app.use('/bar', function barMiddleware(req, res, next) {
  	  // req.url starts with "/bar"
  	  next();
	});

### Error 中间件

这是特殊的一个中间件，用来进行错误处理。这个中间件允许带有四个参数，当一个携带者error对象的中间通过next传递于此时，app 将会查找处理错误的中间件，这个处理错误的中间件将会被告知，然后把携带错误对象的中间件放在没有错误的中间件的后面。

	// 正常的中间件
	app.use(function (req, res, next) {
  	  // i had an error
      next(new Error('boom!'));
	});

	// 出现错误的中间件
	app.use(function onerror(err, req, res, next) {
  	  // an error occurred!
	});


### 创建一个基于app的http服务

最后一步就是使用connect的实例，即app函数对象创建一个服务。`.listen()`方法就是用于很方便的起一个http服务，它和用node.js创建一个服务是相同的。

	var server = app.listen(port);

app本身就是一个带有三个参数的函数对象，所以他能够被传入node.js中的`.createServer()`方法。

	var server = http.createServer(app);

## Middleware 中间件

以下中间件是被 Connect/Express团队官方支持的:

  - [body-parser](https://www.npmjs.com/package/body-parser) - previous `bodyParser`, `json`, and `urlencoded`. You may also be interested in:
    - [body](https://www.npmjs.com/package/body)
    - [co-body](https://www.npmjs.com/package/co-body)
    - [raw-body](https://www.npmjs.com/package/raw-body)
  - [compression](https://www.npmjs.com/package/compression) - previously `compress`
  - [connect-timeout](https://www.npmjs.com/package/connect-timeout) - previously `timeout`
  - [cookie-parser](https://www.npmjs.com/package/cookie-parser) - previously `cookieParser`
  - [cookie-session](https://www.npmjs.com/package/cookie-session) - previously `cookieSession`
  - [csurf](https://www.npmjs.com/package/csurf) - previously `csrf`
  - [errorhandler](https://www.npmjs.com/package/errorhandler) - previously `error-handler`
  - [express-session](https://www.npmjs.com/package/express-session) - previously `session`
  - [method-override](https://www.npmjs.com/package/method-override) - previously `method-override`
  - [morgan](https://www.npmjs.com/package/morgan) - previously `logger`
  - [response-time](https://www.npmjs.com/package/response-time) - previously `response-time`
  - [serve-favicon](https://www.npmjs.com/package/serve-favicon) - previously `favicon`
  - [serve-index](https://www.npmjs.com/package/serve-index) - previously `directory`
  - [serve-static](https://www.npmjs.com/package/serve-static) - previously `static`
  - [vhost](https://www.npmjs.com/package/vhost) - previously `vhost`

Most of these are exact ports of their Connect 2.x equivalents. The primary exception is `cookie-session`.

Some middleware previously included with Connect are no longer supported by the Connect/Express team, are replaced by an alternative module, or should be superseded by a better module. Use one of these alternatives instead:

  - `cookieParser`
    - [cookies](https://www.npmjs.com/package/cookies) and [keygrip](https://www.npmjs.com/package/keygrip)
  - `limit`
    - [raw-body](https://www.npmjs.com/package/raw-body)
  - `multipart`
    - [connect-multiparty](https://www.npmjs.com/package/connect-multiparty)
    - [connect-busboy](https://www.npmjs.com/package/connect-busboy)
  - `query`
    - [qs](https://www.npmjs.com/package/qs)
  - `staticCache`
    - [st](https://www.npmjs.com/package/st)
    - [connect-static](https://www.npmjs.com/package/connect-static)

Checkout [http-framework](https://github.com/Raynos/http-framework/wiki/Modules) for many other compatible middleware!

## API

Connect API是非常精简的，足够创建一个app和一组中间件了。

当`connect`模块被声明时，会返回一个函数，当这个函数被调用时将会创建一个新的app对象。

	// require module
	var connect = require('connect')

	// create app
	var app = connect()

### app(req, res[, next])

`app` 本身就是一个函数， 它仅仅是 `app.handle`函数的别名。

### app.handle(req, res[, out])

这个函数将会操作存放于 stack 的中间件，接收http server的req,res对象作为参数，有一个可选的参数:函数对象`out`，用于调用下一个中间价。

### app.listen([...])

使得app开始监听请求，这个方法本质上会创建一个node.js的http服务并调用它的`.listen()`方法。

它是 node.js的`server.listen()` 方法的别名,所以它适用于在Node.js中的各种用法， 最普遍的用法就是 [`app.listen(port)`](https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_server_listen_port_hostname_backlog_callback).

### app.use(fn)

use是app上的一个方法，默认路由为'/'。它允许一个函数作为参数，这个函数就是一个中间件。中间件将会有序的被`app.use`调用，这个中间件函数允许接收三个参数:

	app.use(function (req, res, next) {
  	  // req is the Node.js http request object
  	  // res is the Node.js http response object
  	  // next is a function to call to invoke the next middleware
	})

作为参数的函数也可以是一个http服务，也可以是另一个app。

### app.use(route, fn)

use是app上的一个方法，他接收一个路径字符串作为参数，它允许一个函数作为参数，这个作为参数的函数可以接收三个参数。有序的被'app.use'调用。

	app.use('/foo', function (req, res, next) {
	  // req is the Node.js http request object
	  // res is the Node.js http response object
	  // next is a function to call to invoke the next middleware
	})

## Running Tests

```bash
npm install
npm test
```

## People

The Connect project would not be the same without all the people involved.

The original author of Connect is [TJ Holowaychuk](https://github.com/tj) [![TJ's Gratipay][gratipay-image-visionmedia]][gratipay-url-visionmedia]

The current lead maintainer is [Douglas Christopher Wilson](https://github.com/dougwilson) [![Doug's Gratipay][gratipay-image-dougwilson]][gratipay-url-dougwilson]

[List of all contributors](https://github.comsenchalabs/connect/graphs/contributors) 

## Node Compatibility

  - Connect `< 1.x` - node `0.2`
  - Connect `1.x` - node `0.4`
  - Connect `< 2.8` - node `0.6`
  - Connect `>= 2.8 < 3` - node `0.8`
  - Connect `>= 3` - node `0.10`, `0.12`, `4.x`, `5.x`, `6.x`, `7.x`, `8.x`; io.js `1.x`, `2.x`, `3.x`

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/connect.svg
[npm-url]: https://npmjs.org/package/connect
[travis-image]: https://img.shields.io/travis/senchalabs/connect/master.svg
[travis-url]: https://travis-ci.org/senchalabs/connect
[coveralls-image]: https://img.shields.io/coveralls/senchalabs/connect/master.svg
[coveralls-url]: https://coveralls.io/r/senchalabs/connect
[downloads-image]: https://img.shields.io/npm/dm/connect.svg
[downloads-url]: https://npmjs.org/package/connect
[gratipay-image-dougwilson]: https://img.shields.io/gratipay/dougwilson.svg
[gratipay-url-dougwilson]: https://www.gratipay.com/dougwilson/
[gratipay-image-visionmedia]: https://img.shields.io/gratipay/visionmedia.svg
[gratipay-url-visionmedia]: https://www.gratipay.com/visionmedia/
