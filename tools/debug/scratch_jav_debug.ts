import * as cheerio from 'cheerio';

const SOURCE_URL = "https://nontonasik.my.id/jav-domain/";

async function fetchWithTimeout(url: string, options: any = {}) {
    const { timeout = 30000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                ...options.headers
            }
        });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.text();
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

function resolveNuxtData(data: any[]): any {
    if (!data || !data.length) return null;
    const cache = new Map();

    function walk(idx: any): any {
        if (idx === null || typeof idx !== 'number') return idx;
        if (cache.has(idx)) return cache.get(idx);

        const val = data[idx];
        if (Array.isArray(val)) {
            const res: any[] = [];
            cache.set(idx, res);
            for (const item of val) res.push(walk(item));
            return res;
        }
        if (val && typeof val === 'object') {
            const res: any = {};
            cache.set(idx, res);
            for (const key in val) res[key] = walk(val[key]);
            return res;
        }
        return val;
    }

    return walk(0);
}

async function test() {
    console.log("Fetching", SOURCE_URL);
    const html = await fetchWithTimeout(SOURCE_URL);
    console.log("HTML length:", html.length);
    
    const $ = cheerio.load(html);
    const scriptText = $('#__NUXT_DATA__').html();
    console.log("__NUXT_DATA__ length:", scriptText ? scriptText.length : "NOT FOUND");
    
    if (scriptText) {
        try {
            const raw = JSON.parse(scriptText);
            const resolved = resolveNuxtData(raw);
            console.log("Resolved object structure:", JSON.stringify(resolved, null, 2).substring(0, 500));
            
            // Try to find list
            const rootObject = Array.isArray(resolved) && resolved[0] === 'ShallowReactive' ? resolved[1] : resolved;
            const dataObj: any = Array.isArray(rootObject?.data) && rootObject.data[0] === 'ShallowReactive' ? rootObject.data[1] : rootObject?.data;
            
            console.log("Data keys:", Object.keys(dataObj || {}));
            
            const list = dataObj?.['explore-1']?.list || 
                         dataObj?.['explore-0']?.list || 
                         dataObj?.['latest']?.list ||
                         (Object.values(dataObj || {}).find((v: any) => v && v.list) as any)?.list ||
                         [];
                         
            console.log("Found list length:", (list as any[]).length);
        } catch (e: any) {
            console.error("JSON parse error:", e.message);
            console.log("Start of scriptText:", scriptText.substring(0, 100));
        }
    } else {
        // Find other script tags
        console.log("Looking for other scripts with data...");
        $('script').each((i, el) => {
            const id = $(el).attr('id');
            const type = $(el).attr('type');
            if (id || type === 'application/json') {
                console.log(`Script ${i}: id=${id}, type=${type}, length=${$(el).html()?.length}`);
            }
        });
    }
}

test().catch(console.error);
