const cheerio = require('cheerio');

async function testSearch(query, page) {
  const url = `https://nontonasik.my.id/jav-domain/search?q=${encodeURIComponent(query)}${page > 1 ? `&pg=${page}` : ''}`;
  console.log('Fetching:', url);
  const html = await fetch(url).then(r => r.text());
  
  const $ = cheerio.load(html);
  const scriptText = $('[id="__NUXT_DATA__"]').html();
  if (!scriptText) { console.log('No Nuxt data'); return; }
  
  const raw = JSON.parse(scriptText);
  
  function walk(idx) {
    if (typeof idx !== 'number') return idx;
    const val = raw[idx];
    if (Array.isArray(val)) return val.map(i => walk(i));
    if (val && typeof val === 'object') {
      const r = {};
      for (const k in val) r[k] = walk(val[k]);
      return r;
    }
    return val;
  }
  
  const resolved = walk(0);
  const rootObj = Array.isArray(resolved) && resolved[0] === 'ShallowReactive' ? resolved[1] : resolved;
  const dataObj = Array.isArray(rootObj?.data) && rootObj.data[0] === 'ShallowReactive' ? rootObj.data[1] : rootObj?.data;
  
  if (dataObj) {
    const keys = Object.keys(dataObj);
    console.log('Data keys:', keys.join(', '));
    for (const key of keys) {
      const val = dataObj[key];
      if (val?.list) {
        console.log(`\nKey "${key}": list length = ${val.list.length}, page = ${val.page}, pagecount = ${val.pagecount}, total = ${val.total}`);
        if (val.list[0]) console.log('  Sample:', JSON.stringify(val.list[0]).substring(0, 200));
      }
    }
  }
}

testSearch('Blonde', 1);
