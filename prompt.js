import { Bard } from "googlebard";


let cookies = `__Secure-1PSID=YggCthktbd3LShw8G59qcujRgq58yESIj1uMbKbtumXR15LoUZn7teM0EGWX56QdtGCtlQ.`;
let bot = new Bard(cookies);

let response = await bot.ask(
    `i am a software engineer
    i have experience in react and node.js
    i worked at telecom united what are the 
    five ways ive improved the company: start or
    include with 'I' or any other first person pronoun `);
console.log(response);

