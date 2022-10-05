const fs = require('fs');
const http = require('http');
const url = require('url');

const slugifdy = require('slugify');

const replaceTemplate = require('./moudules.js/replaceTemplate');

/* SERVER!!! */

// 因为在顶层代码中，读取文件操作只执行一次，因此可以使用同步的方式读取
const tempOverview = fs.readFileSync(
  `${__dirname}/template/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/template/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/template/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugifdy(el.productName, { lower: true }));
console.log(slugs);

// 不在回调中使用同步，因为每次请求都会执行一次
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);

    // NOT FOUND
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/html',
    });
    res.end(
      '<h1 style="height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center">Page not found!</h1>'
    );
  }
});

server.listen(8080, '127.0.0.1', () => {
  console.log('Listening to requests on port 8080!');
});
