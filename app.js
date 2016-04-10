var http = require('http'),
	fs = require('fs'),
	RSS = require('rss'),
	data = require('./data');

var server = http.createServer(function(req,res){
	var path = req.url;
	if(path == '/rss'){
		generateRss(res);
	} else if (path == '/image'){
		var img = fs.readFileSync('./conference.png');
		res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');
	} else {
		res.statusCode = 302;
		res.setHeader('Location', 'https://www.lds.org/general-conference?lang=eng');
		res.end();
	}
});

var generateRss = function(res){
	var now = new Date();
	console.log(now + ': Generating RSS');
	fs.readFile(__dirname + '/data.json', function(err, data){
		if(err)
			throw err;
		var dataArray = JSON.parse(data), currentItem;
		dataArray = dataArray.select(function(item){
			item.date = new Date(item.date);
			return item;
		});
		dataArray = dataArray.where(function(item){
			return now > item.date;
		});
		dataArray.sort(function(a,b){
			if(a.date > b.date){
				return -1;
			}
			return 1;
		});
		var rss = new RSS({
			title: 'Daily Conference Talks',
			feed_url: 'http://general-conference-rss.herokuapp.com/rss',
			site_url: 'http://general-conference-rss.herokuapp.com/',
			image_url: 'http://general-conference-rss.herokuapp.com/image',
	    custom_namespaces: {
	      'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
	    },
	    custom_elements: [
	      {'itunes:subtitle': 'Conference Talks'},
	      {'itunes:summary': 'Each day a new General Conference talk is published'},
	      {'itunes:owner': [
	        {'itunes:name': 'Michael Graybeal'},
	        {'itunes:email': 'mjgyesme@gmail.com'}
	      ]},
	      {'itunes:image': {
	        _attr: {
	          href: 'http://general-conference-rss.herokuapp.com/image'
	        }
	      }},
	      {'itunes:category': [
	        {_attr: {
	          text: 'Spirituality'
	        }}
	      ]}
	    ]
		});
		for(var i = 0; i < 14 && i < dataArray.length; i++){
			currentItem = dataArray[i];
			currentItem.enclosure = {url: currentItem.url, type:'audio/mpeg'};
			rss.item(currentItem);
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
