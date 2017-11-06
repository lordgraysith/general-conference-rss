Array.prototype.select = function (callback) {
  var result = []
  for (var i = 0; i < this.length; i++) {
    result.push(callback(this[i]))
  }
  return result
}

Array.prototype.where = function (callback) {
  var result = []
  for (var i = 0; i < this.length; i++) {
    if (callback(this[i])) result.push(this[i])
  }
  return result
}

var get = url => {
  return new Promise((resolve, reject) => {
    var oReq = new XMLHttpRequest()
    oReq.addEventListener('load', function () {
      resolve(this.responseText)
    })
    oReq.addEventListener('error', function () {
      reject(this)
    })
    oReq.open('GET', url)
    oReq.send()
  })
}

var attr = (el, name) => {
  var attributes = Array.prototype.slice.apply(el.attributes)
  return attributes
    .where(attr => attr.name === name)
    .select(attr => attr.value)[0]
}

var parseHtml = html => {
  var oParser = new DOMParser()
  return oParser.parseFromString(html, 'text/html')
}

var generateData = function (dateIn) {
  var [month, year] = document
    .getElementsByClassName('title')[0]
    .innerText.split(' ')
  var data = [], today = dateIn || new Date(), promises = []
  var htmlCollection = document.getElementsByClassName('lumen-tile')
  var elementArray = Array.prototype.slice.apply(htmlCollection)
  elementArray.forEach(function (el) {
    try {
      var title, author, link, description, date, mp3
      title = el
        .getElementsByClassName('lumen-tile__title')[0]
        .textContent.trim()
      author = el
        .getElementsByClassName('lumen-tile__content')[0]
        .textContent.trim()
      var a = el.getElementsByTagName('a')[0]
      var link = attr(a, 'href')
      if (
        title === 'The Sustaining of Church Officers' ||
        title.indexOf('Church Auditing Department') > -1 ||
        title.indexOf('Statistical Report') > -1 ||
        author.indexOf('The Church of Jesus Christ of Latter-day Saints') >
          -1 ||
        author.indexOf('Video Presentation') > -1
      ) {
        return
      }
      today.setDate(today.getDate() + 1)
      date = new Date(today)
      promises.push(
        get(link).then(function (pageData) {
          var page = parseHtml(pageData)
          description = page
            .getElementsByClassName('article-author')[0]
            .textContent.trim()
            .replace(/\s+/g, ' ')
          mp3 = Array.prototype.slice
            .apply(page.getElementsByTagName('a'))
            .where(element => element.textContent.trim() === 'MP3')
            .select(element => attr(element, 'href').split('?')[0])[0]
          data.push({
            title: title || author,
            author: author,
            description: month + ' ' + year + ' ' + description,
            url: mp3,
            guid: mp3,
            date: date
          })
        })
      )
    } catch (exp) {
      console.log(exp)
    }
  })

  Promise.all(promises)
    .then(function () {
      data.sort(function (a, b) {
        if (a.date > b.date) {
          return 1
        }
        return -1
      })
      window.rssData = data
      console.log(JSON.stringify(data))
    })
    .catch(ex => {
      console.error(ex, ex.stack)
    })
}
