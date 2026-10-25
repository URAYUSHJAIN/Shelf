import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
// Run against npm run dev. Reuse an installed Puppeteer/Chromium; this adds no
// project dependency. Set SHELF_PUPPETEER_MODULE and SHELF_CHROME to local paths.
const { default: puppeteer } = await import(process.env.SHELF_PUPPETEER_MODULE ? pathToFileURL(process.env.SHELF_PUPPETEER_MODULE).href : 'puppeteer-core');
const browser = await puppeteer.launch({executablePath:process.env.SHELF_CHROME,headless:true});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const delay = ms => new Promise(r=>setTimeout(r,ms));
const open = id => page.waitForFunction(id => { const p=document.querySelector(`#panel-${id}`); return p.dataset.phase==='open' && !p.hidden && !p.querySelector('.panel__sheet').inert; }, {}, id);
const closed = () => page.waitForFunction(()=>!document.querySelector('.is-mounted') && location.pathname==='/');
const active = () => page.evaluate(()=>document.activeElement.id);
const rect = selector => page.$eval(selector, el=>el.getBoundingClientRect().toJSON());
async function bounds(label) {
 const result = await page.evaluate(()=>{
  const panel=document.querySelector('.is-mounted');
  const front=panel.querySelector('.drawer').getBoundingClientRect();
  const sheet=panel.querySelector('.panel__sheet').getBoundingClientRect();
  const close=panel.querySelector('.panel__close').getBoundingClientRect();
  return {front:front.toJSON(),sheet:sheet.toJSON(),close:close.toJSON(),width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 assert(!result.overflow,`${label}: horizontal page overflow`);
 for(const name of ['front','sheet','close']) {
  const r=result[name];
  assert(r.left>=-1 && r.right<=result.width+1 && r.top>=0 && r.bottom<=result.height,`${label}: ${name} out of viewport ${JSON.stringify(result)}`);
 }
}
try {
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
 await page.setViewport({width:1440,height:1000});
 await page.goto('http://127.0.0.1:4321/',{waitUntil:'networkidle0'});
 const projectCount=await page.$$eval('.folders li',els=>els.length);
 const original=await rect('#drawer-projects');
 // Assert travel itself, not only its end state (the host may prefer reduced motion).
 const travel=await page.evaluate(()=>{
  const front=document.querySelector('#drawer-projects');
  const before=front.getBoundingClientRect().toJSON();
  front.click();
  const panel=document.querySelector('#panel-projects');
  const assembly=panel.querySelector('.drawer-assembly');
  const motion=assembly.getAnimations()[0];
  const clip=panel.getAnimations()[0];
  motion.pause(); clip.pause(); motion.currentTime=0; clip.currentTime=0;
  const start=front.getBoundingClientRect().toJSON();
  motion.currentTime=230; clip.currentTime=230;
  const middle=front.getBoundingClientRect().toJSON();
  motion.play(); clip.play();
  return {before,start,middle,duration:motion.effect.getTiming().duration};
 });
 assert.equal(travel.duration,460);
 assert(Math.abs(travel.before.y-travel.start.y)<12,'pull starts at original slot');
 assert(travel.middle.y>travel.start.y+80,'whole assembly moves forward/down');
 await open('projects'); await page.keyboard.press('Escape'); await closed();
 await page.focus('#drawer-projects');
 await page.keyboard.press('Space');
 await open('projects');
 assert.equal(await active(),'panel-projects-title');
 await bounds('desktop');
 assert.equal(await page.$$eval('.drawer-slot.is-vacant',els=>els.length),1);
 assert.equal(await page.$eval('#panel-projects .panel__meta',el=>el.textContent),`${projectCount} folders`);
 await page.click('.filter[data-group="web3"]');
 assert(await page.$$eval('.folders li:not([hidden])',els=>els.length>0 && els.every(el=>el.dataset.group==='web3')));
 await page.click('.filter[data-group="all"]');
 await page.click('[data-focus-search]');
 await page.type('[data-project-search]','GenShakti');
 assert.equal(await page.$$eval('.folders li:not([hidden])',els=>els.length),1);
 await page.click('.folders li:not([hidden]) .folder');
 await page.waitForFunction(()=>location.pathname.includes('/projects/genshakti/'));
 assert((await page.url()).includes('q=GenShakti'));
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>location.pathname==='/projects/');
 assert.equal(await page.$$eval('.folders li:not([hidden])',els=>els.length),1);
 assert(await page.evaluate(()=>document.activeElement.matches('.folder')));
 await page.click('[data-focus-search]');
 await page.keyboard.press('Escape');
 await closed();
 assert.equal(await active(),'drawer-projects');
 const restored=await rect('#drawer-projects');
 for(const key of ['x','y','width','height']) assert(Math.abs(original[key]-restored[key])<1,'front returns exactly to slot');
 console.log('PASS keyboard open, search, record, Escape, query preservation, focus restoration, geometry');

 await page.click('#drawer-projects'); await open('projects');
 await page.click('#drawer-patents'); await open('patents');
 assert.equal(await page.$$eval('.is-mounted',els=>els.length),1);
 await page.goBack(); await open('projects');
 await page.goForward(); await open('patents');
 await page.click('#panel-patents .panel__close'); await closed();
 for(const id of ['about','projects','patents','experience','education','achievements','toolbox','certifications']) {
  await page.click(`#drawer-${id}`); await open(id); await bounds(id);
  await page.click(`#panel-${id} .panel__close`); await closed();
 }
 console.log('PASS all eight drawers, switching, browser history, back buttons');

 await page.evaluate(()=>{
  document.querySelector('#drawer-projects').click();
  setTimeout(()=>document.querySelector('#drawer-patents').click(),70);
  setTimeout(()=>document.querySelector('#drawer-education').click(),110);
 });
 await open('education');
 assert.equal(await page.$$eval('.is-mounted',els=>els.length),1);
 await page.keyboard.press('Escape'); await closed();
 await page.evaluate(()=>{document.querySelector('#drawer-projects').click();setTimeout(()=>document.querySelector('#drawer-projects').click(),100);});
 await closed();
 assert.equal(await page.$$eval('.drawer-slot > .drawer',els=>els.length),8);
 console.log('PASS interrupted opening, rapid switching, same-front reversal');

 for(const [width,height] of [[1280,720],[1024,768],[768,1024],[390,844],[320,568],[667,375]]) {
  await page.setViewport({width,height,isMobile:width<1000,hasTouch:width<1000});
  await page.goto('http://127.0.0.1:4321/projects/',{waitUntil:'networkidle0'});
  await open('projects'); await bounds(`${width}x${height}`);
  await page.screenshot({path:`.astro/drawer-${width}x${height}.png`});
  if(width<1000) {
   assert.equal(await page.$eval('#panel-projects',el=>el.getAttribute('aria-modal')),'true');
   assert(await page.$eval('[data-scene]',el=>el.inert));
   await page.focus('#drawer-projects'); await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.className),'panel__close');
   await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift'); assert.equal(await active(),'drawer-projects');
   await page.$eval('#panel-projects .panel__body',el=>el.scrollTo(0,el.scrollHeight));
   assert(await page.$eval('#panel-projects .panel__body',el=>el.scrollTop>0));
  }
  await page.keyboard.press('Escape'); await closed();
  assert.equal(await page.$eval('[data-scene]',el=>el.inert),false);
 }
 console.log('PASS six viewport sizes, narrow/landscape bounds, modal focus containment and scroll unlock');

 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:4321/',{waitUntil:'networkidle0'});
 await page.$eval('#drawer-projects',el=>el.scrollIntoView({block:'center'}));
 await page.tap('#drawer-projects'); await open('projects');
 await page.tap('[data-focus-search]'); await page.type('[data-project-search]','arogya');
 assert(await page.$$eval('.folders li:not([hidden])',els=>els.length>0));
 await page.setViewport({width:844,height:390,isMobile:true,hasTouch:true});
 await delay(200); await bounds('orientation');
 assert(await page.evaluate(()=>document.activeElement.matches('[data-project-search]')));
 await page.keyboard.press('Escape'); await closed();
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.$eval('#drawer-projects',el=>el.click()); await open('projects');
 assert.equal(await page.$eval('.drawer-assembly',el=>el.getAnimations().length),0);
 await page.keyboard.press('Escape'); await closed();
 console.log('PASS touch, orientation preserves search focus, reduced motion');

 await page.setJavaScriptEnabled(false);
 await page.goto('http://127.0.0.1:4321/projects/',{waitUntil:'networkidle0'});
 assert.equal(await page.$eval('#panel-projects',el=>el.hidden),false);
 assert.equal(await page.$$eval('.folders .folder',els=>els.length),projectCount);
 console.log('PASS no-JavaScript content and links');
 assert.deepEqual(errors,[]);
 console.log('PASS no browser runtime errors');
} finally { await browser.close(); }
