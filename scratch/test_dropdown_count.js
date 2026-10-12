fetch('http://localhost:3000')
  .then(res => res.text())
  .then(html => {
    const matches = html.match(/card-nav-dropdown/g);
    console.log('Count of card-nav-dropdown:', matches ? matches.length : 0);

    const navs = html.match(/<nav[^>]*>/g);
    console.log('Nav tags:', navs);

    const headers = html.match(/<header[^>]*>/g);
    console.log('Header tags:', headers);
  });
