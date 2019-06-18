// mock
var jsonServer = require('json-server');
var server = jsonServer.create();
var router = jsonServer.router('./mock/test.json');
var middlewares = jsonServer.defaults();

server.use(middlewares);

server.post('/suc', function (req, res) {
    var db = router.db; // lowdb instance
    var result = db
        .get('suc')
        .value();

    res.jsonp(result)
});



server.use(router);
server.listen(9091, function () {
    console.log('web ------JSON Server:9091 is running')
});