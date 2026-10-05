import { readFile,writeFile } from 'node:fs/promises';
const p='public/images/dishes/PHOTO-CREDITS.md'; let s=await readFile(p,'utf8');
const rows={
'Cheese Lovers':['cheese pizza with a simple cheese-forward topping','https://unsplash.com/photos/a-cheese-pizza-rests-on-a-wooden-board-PUGneTjeOqs'],
'Jaffa’z Special':['whole cheese pizza cut into slices','https://unsplash.com/photos/a-whole-cheese-pizza-cut-into-slices-5NYl1nkd75I'],
'Cheese Slice':['brie cheese wheel with a slice cut out','https://unsplash.com/photos/a-wheel-of-brie-cheese-with-a-slice-cut-out-Ju0amhFx2g0'],
'Grilled Burger':['finished burger with patty and cheese','https://unsplash.com/photos/burger-with-patty-and-cheese-Rk8dItzbiaw'],
'Loaded Fries':['loaded fries with chicken, coleslaw, and sauce','https://unsplash.com/photos/loaded-fries-with-chicken-coleslaw-and-sauce-_qgMA9qL150']};
s=s.split(/\r?\n/).map(line=>{for(const [name,[desc,url]] of Object.entries(rows)){if(line.startsWith(`| ${name} |`)) return `| ${name} | ${desc} | [Unsplash photo](${url}) |`;}return line;}).join('\n');
await writeFile(p,s);
