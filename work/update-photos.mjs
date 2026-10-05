import { writeFile } from 'node:fs/promises';
const base='public/images/dishes/';
const entries={
'cheese-lovers.webp':['https://images.unsplash.com/photo-1772631547196-1aeeaa4c2f7f','Cheese pizza with a simple cheese-forward topping','https://unsplash.com/photos/a-cheese-pizza-rests-on-a-wooden-board-PUGneTjeOqs'],
'jaffaz-special-pizza.webp':['https://images.unsplash.com/photo-1773620496832-9b62e8912452','Whole cheese pizza cut into slices','https://unsplash.com/photos/a-whole-cheese-pizza-cut-into-slices-5NYl1nkd75I'],
'cheese-slice.webp':['https://images.unsplash.com/photo-1773431178270-7ec0483cb288','Brie cheese wheel with a slice cut out','https://unsplash.com/photos/a-wheel-of-brie-cheese-with-a-slice-cut-out-Ju0amhFx2g0'],
'grilled-burger.webp':['https://images.unsplash.com/photo-1608847570180-1df280af3b59','Finished burger with patty and cheese','https://unsplash.com/photos/burger-with-patty-and-cheese-Rk8dItzbiaw'],
'loaded-fries.webp':['https://images.unsplash.com/photo-1568483417501-19a2e26b971d','Loaded fries with chicken, coleslaw, and sauce','https://unsplash.com/photos/loaded-fries-with-chicken-coleslaw-and-sauce-_qgMA9qL150']
};
for (const [file,[src]] of Object.entries(entries)) { const r=await fetch(`${src}?auto=format&fit=crop&w=720&h=480&q=78&fm=webp`); if(!r.ok) throw Error(`${file}: ${r.status}`); const b=Buffer.from(await r.arrayBuffer()); await writeFile(base+file,b); console.log(file,b.length); }
