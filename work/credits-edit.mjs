import {readFile,writeFile} from 'node:fs/promises';
const p='public/images/dishes/PHOTO-CREDITS.md';let s=await readFile(p,'utf8');
const replacements={
'Cheese Slice':'| Cheese Slice | Sliced smoked cheddar cheese on a serving board | [Unsplash photo](https://unsplash.com/photos/butter-and-tomatoes-are-ready-for-meal-prep-BIGk0HzEYCA) |',
'Cold Drink (345ml)':'| Cold Drink (345ml) | Chilled Pepsi soda can held in hand | [Unsplash photo](https://unsplash.com/photos/pepsi-can-vWVCvabydvw) |'
};s=s.split(/\r?\n/).map(line=>{for(const [name,repl] of Object.entries(replacements)){if(line.startsWith(`| ${name} |`))return repl;}return line;}).join('\n');await writeFile(p,s);
