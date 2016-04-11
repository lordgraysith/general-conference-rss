
var generateData = function(dateIn, month, year){
	var data = [], today = dateIn || new Date(), promises = [];
	$('section.section .lumen-tile').each(function(i,el){
		var title, author, link, description, $el = $(el), date, mp3;
		title = $el.find('.lumen-tile__title').text().trim();
		author = $el.find('.lumen-tile__content').text().trim();
		link = $el.find('a').attr('href');
		if(title === 'The Sustaining of Church Officers' ||
			title.indexOf('Church Auditing Department') > -1 ||
			title.indexOf('Statistical Report') > -1 ||
			author.indexOf('The Church of Jesus Christ of Latter-day Saints') > -1 ||
			author.indexOf('Video Presentation') > -1){
			return;
		}
		promises.push($.get(link).then(function(page){
			var $page = $(page);
			description = $page.find('.article-author__name').text()
				+ ' ' + $page.find('.article-author__title').text();
			mp3 = $page.find('a:contains("MP3")').attr('href').split('?')[0]
			today.setDate(today.getDate()+1);
			date = new Date(today);
			data.push({
				title: title || author,
				author: author,
				description: month + ' ' + year + ' ' + description,
				url: mp3,
				guid: mp3,
				date: date
			});
		}));
	});

	Promise.all(promises).then(function(){
		console.log(JSON.stringify(data));
	})
};
