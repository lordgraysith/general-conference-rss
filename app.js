var http = require('http'),
	fs = require('fs'),
	RSS = require('rss'),
	data = require('./data');

var server = http.createServer(function(req,res){
	var path = req.url;
	if(path == '/rss'){
		generateRss(res);
	} else{
		res.statusCode = 302;
		res.setHeader('Location', 'https://www.lds.org/general-conference?lang=eng');
		res.end();
	}
});

var generateRss = function(res){
	var now = new Date();
	fs.readFile(__dirname + '/data.json', function(err, data){
		if(err)
			throw err;
		var dataArray = JSON.parse(data);
		dataArray = dataArray.select(function(item){
			item.date = new Date(item.date);
			return item;
		});
		dataArray = dataArray.where(function(item){
			return now > item.date;
		});
		var rss = new RSS({
			title: 'Daily Conference Talks',
			feed_url: 'http://general-conference-rss.herokuapp.com/rss',
			site_url: 'http://general-conference-rss.herokuapp.com/'
		});
		for(var i = 0; i < dataArray.length; i++){
			rss.item(dataArray[i]);
		}
		res.writeHead(200, {"Content-Type": "rss/xml"});
		res.write(rss.xml());
		res.end();
	});
}

server.listen(process.env.PORT || 8081);
console.log('waiting');

Array.prototype.select = function(callback){
	var result = [];
	for (var i = 0; i < this.length; i++) {
		result.push(callback(this[i]));
	};
	return result;
};

Array.prototype.where = function(callback){
	var result = [];
	for (var i = 0; i < this.length; i++) {
		if(callback(this[i]))
			result.push(this[i]);
	};
	return result;
};