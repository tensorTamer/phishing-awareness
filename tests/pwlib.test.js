// Run: node tests/pwlib.test.js
const assert=require('assert'),fs=require('fs'),path=require('path');
const PW=require('../assets/js/pwlib.js');
for(const p of ['P@ssw0rd!','Summer2024','Qwerty123','password','Dragon-77'])assert(PW.isCommon(p),p+' should be common');
for(const p of ['river-copper-lantern-maple-82','hotel-zebra-quilt-river-maple-oven-84'])assert(!PW.isCommon(p),p+' should not be common');
// a 3-word phrase must not be rated like a long random string
assert(PW.estBits('river-copper-lantern-7')<55,'3 words + digit is not strong');
assert(PW.estBits('river-copper-lantern-maple-82')>=55,'4 words + digits is strong');
assert(PW.estBits('Tr4ck!ng-x9Qz')>20);
// word list: no duplicates, 3-8 lowercase letters
global.window={};eval(fs.readFileSync(path.join(__dirname,'../assets/js/wordlist.js'),'utf8'));
const w=window.PHISH_WORDS;assert.strictEqual(new Set(w).size,w.length,'duplicate words');
w.forEach(x=>assert(/^[a-z]{3,8}$/.test(x),'bad word '+x));
// quiz answers must not all sit in the same slot
const src=fs.readFileSync(path.join(__dirname,'../assets/js/app.js'),'utf8');
const a=[...src.matchAll(/\ba:(\d)/g)].map(m=>m[1]);assert(new Set(a).size>=3,'correct answers too predictable');
console.log('all tests passed');
