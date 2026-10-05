import { writeFile } from 'node:fs/promises';
const updates={
'cheese-slice.webp':'https://images.unsplash.com/photo-1741732666770-9e2eabb9255f',
'cold-drink-345.webp':'https://images.unsplash.com/photo-1554283180-2eb141938ee9'
};
for(const [name,url] of Object.entries(updates)){const res=await fetch(`${url}?auto=format&fit=crop&w=720&h=480&q=82&fm=webp`);if(!res.ok)throw Error(`${name}: ${res.status}`);const b=Buffer.from(await res.arrayBuffer());await writeFile(`public/images/dishes/${name}`,b);console.log(name,b.length)}
