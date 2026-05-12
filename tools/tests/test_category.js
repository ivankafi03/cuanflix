const cheerio = require('cheerio');

async function testCategory(categoryId, page) {
  // Test both URL formats
  const url1 = `https://nontonasik.my.id/jav-domain/categories/${categoryId}`;
  const url2 = `https://nontonasik.my.id/jav-domain/categories/${categoryId}?pg=${page}`;
  
  for (const url of [url1, url2]) {
    console.log('\nFetching:', url);
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);
    const scriptText = $('[id="__NUXT_DATA__"]').html();
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
      console.log('Keys:', keys.join(', '));
      for (const key of keys) {
        const val = dataObj[key];
        if (val?.list) {
          console.log(`  list.length=${val.list.length}, page=${val.page}, pagecount=${val.pagecount}, total=${val.total}`);
          const first = val.list[0];
          console.log(`  First video: "${first?.name}" | id=${first?.id} | type=${first?.type_name}`);
        }
      }
    }
  }
}

testCategory(6, 2);
