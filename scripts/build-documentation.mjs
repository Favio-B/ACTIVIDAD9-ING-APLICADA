import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {marked} from 'marked';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
let html=marked.parse(read('docs/documentacion.md'));
html=html.replace(/<h1[^>]*>.*?<\/h1>/s,'');
// Relative source/report links open the in-app reading views, never raw Markdown/JSON.
html=html.replace(/href="([^"#]*\.(?:md|json))(?:#[^"]*)?"/g,(_,href)=>`href="#${/documentacion/.test(href)?'documentation':'evidence'}" data-open-view="${/documentacion/.test(href)?'documentation':'evidence'}"`);
html=html.replace(/<table>/g,'<div class="table-responsive"><table class="table">').replace(/<\/table>/g,'</table></div>');
const parts=html.split(/<h2[^>]*>(.*?)<\/h2>/s);
let documentHtml=`<div class="document-intro">${parts[0]}</div>`;
for(let i=1;i<parts.length;i+=2)documentHtml+=`<details class="reading-topic"${i===1?' open':''}><summary>${parts[i]}</summary><div class="reading-topic-body">${parts[i+1]||''}</div></details>`;
const reports=Object.fromEntries(['model','browser','published'].map(name=>[name,JSON.parse(read('docs/'+(name==='published'?'published-tests':name+'-tests')+'.json'))]));
const data={documentHtml,reports,deployment:JSON.parse(read('docs/deployment.json'))};
mkdirSync(new URL('../assets/',import.meta.url),{recursive:true});
writeFileSync(new URL('../assets/documentation-data.js',import.meta.url),'/* Generated from the versioned documentation and test reports. */\nwindow.MenuShieldReadingData = '+JSON.stringify(data).replace(/</g,'\\u003c')+';\n');
console.log('Built in-app documentation and evidence from recorded reports.');
