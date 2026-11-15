/* Password maths shared by app.js and tests/pwlib.test.js (pure functions, no DOM). */
(function(root){
  "use strict";
  var COMMON=["password","123456","123456789","qwerty","111111","password1","abc123","12345678","iloveyou",
    "admin","welcome","monkey","dragon","letmein","football","summer","winter","princess","sunshine","superman",
    "login","master","shadow","trustno","baseball","passw0rd","qwertyuiop","changeme"];
  var LEET={'@':'a','4':'a','0':'o','1':'l','3':'e','$':'s','5':'s','7':'t'};
  function pool(pw){var p=0;if(/[a-z]/.test(pw))p+=26;if(/[A-Z]/.test(pw))p+=26;if(/[0-9]/.test(pw))p+=10;if(/[^a-zA-Z0-9]/.test(pw))p+=33;return p||1;}
  function human(sec){if(sec<1)return"instantly";var names=["seconds","minutes","hours","days","years"],div=[60,60,24,365,1e9],v=sec,i=0;
    for(i=0;i<4;i++){if(v<div[i])break;v/=div[i];}
    if(i===4&&v>1e6)return"millions of years";if(i===4&&v>1000)return Math.round(v).toLocaleString()+" years";
    return(v<10?v.toFixed(1):Math.round(v))+" "+names[i];}
  /* catches plain, leet-speak (P@ssw0rd), and word+digits (Summer2024) versions of common passwords */
  function isCommon(pw){var l=pw.toLowerCase(),leet=l.replace(/[@40135$7]/g,function(c){return LEET[c];}),
      v=[l,leet,l.replace(/[^a-z]/g,''),leet.replace(/[^a-z]/g,'')];
    return COMMON.some(function(c){return v.indexOf(c)>-1;});}
  /* Bits of guessing effort. shortcut: a plain-word piece counts as 13 bits (an attacker who knows ~8,000 common words);
     upgrade to a real dictionary check (e.g. zxcvbn) if exact numbers ever matter. */
  function estBits(pw){var t=pw.split(/[-\s_.]+/).filter(Boolean);
    if(t.length<2)return pw.length*Math.log2(pool(pw));
    return t.reduce(function(b,w){return b+(/^[a-zA-Z]{3,}$/.test(w)?13:w.length*Math.log2(pool(w)));},0);}
  var api={pool:pool,human:human,isCommon:isCommon,estBits:estBits};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PW=api;
})(this);
