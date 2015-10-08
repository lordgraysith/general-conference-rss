
var generateData = function(dateIn){
	var data = [], today = dateIn || new Date();
	$('.sessions tr:has(span.talk)').each(function(i,el){
		var title, author, link, description, $el = $(el), date;
		title = $el.find('span.talk a').text() || $el.find('span.talk').text();
		author = $el.find('span.speaker').text();
		link = $el.find('.audio-mp3').attr('href').split('?')[0];
		if(title === 'The Sustaining of Church Officers' ||
			title.indexOf('Church Auditing Department') > -1 ||
			title.indexOf('Statistical Report') > -1 ||
			author.indexOf('The Church of Jesus Christ of Latter-day Saints') > -1){
			return;
		}
		description = author;
		today.setDate(today.getDate()+1);
		date = new Date(today);
		data.push({
			title: title || author,
			author: author,
			description: description,
			url: link,
			guid: link,
			date: date
		});
	});

	console.log(JSON.stringify(data));
};