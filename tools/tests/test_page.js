const cheerio = require('cheerio');

async function test() {
  const html = await fetch('https://nontonasik.my.id/jav-domain/videos?pg=39529').then(r => r.text());
  const $ = cheerio.load(html);
  const scriptText = $('#__NUXT_DATA__').html();
  if (!scriptText) {
    console.log("No Nuxt data found!");
    return;
  }
  const payload = JSON.parse(scriptText);
  console.log("Payload length:", payload.length);
  
  function resolve(index) {
      if (typeof index !== 'number') return index;
      const item = payload[index];
      if (Array.isArray(item)) return item.map(resolve);
      if (item && typeof item === 'object') {
          const resolved = {};
          for (const key in item) {
              resolved[key] = resolve(item[key]);
          }
          return resolved;
      }
      return item;
  }

  const data = resolve(payload[1].data);
  console.log("Data keys:", Object.keys(data));
  const explore = data['explore-1'] || data['explore-0'] || data['latest'];
  if (explore) {
    console.log("Found list length:", explore.list?.length);
    if (explore.list?.length > 0) {
      console.log("Sample title:", explore.list[0].name);
    }
  } else {
    console.log("Could not find explore or latest keys");
    console.log("Full data:", JSON.stringify(data).substring(0, 500));
  }
}

test();
