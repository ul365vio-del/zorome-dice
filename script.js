// 🎲 ゾロ目ダイス ∞ - CodePen版
// セーブ読み込みを修正：window[key]ではなくstateオブジェクトから各変数へ復元します。

let p=0,d=2,subLv=1,autoLv=0,soul=0,maxStage=0,galaxyCrystal=0,dimensionKey=0,timeCrystal=0;
let darkMatter=0,blackHoleLv=0,multiverseEnergy=0,godPoint=0,critLv=0,combo=0,totalRolls=0,totalPrestiges=0;
let research=[0,0,0,0],rageLv=0,rageUntil=0,relics=[],unlockedAchievements=[];
let autoTimer=null;

const SAVE_KEY="zoromeUltimateSave";
const achievements=[
 ["初めての一歩","ダイス10個",()=>d>=10],["ダイス職人","ダイス100個",()=>d>=100],
 ["大量生産","ダイス1,000個",()=>d>=1000],["限界突破","ダイス10,000個",()=>d>=10000],
 ["無限の可能性","ダイス100,000個",()=>d>=100000],["転生初心者","転生1回",()=>totalPrestiges>=1],
 ["転生マスター","転生10回",()=>totalPrestiges>=10],["臨界突破","臨界Lv.5",()=>critLv>=5],
 ["宇宙の支配者","結晶10個",()=>galaxyCrystal>=10],["時間の支配者","時間結晶10個",()=>timeCrystal>=10],
 ["次元の旅人","鍵5個",()=>dimensionKey>=5],["暗黒の始まり","ダークマター1個",()=>darkMatter>=1],
 ["ブラックホール","ブラックホールLv.10",()=>blackHoleLv>=10],["多元宇宙","エネルギー100個",()=>multiverseEnergy>=100],
 ["神の領域","神格ポイント10個",()=>godPoint>=10],["遺物収集家","遺物5個",()=>relics.length>=5],
 ["暴走","暴走Lv.5",()=>rageLv>=5],["研究者","全研究Lv.5",()=>research.every(x=>x>=5)]
];
const relicTypes=[
 {name:"始まりの石",rarity:"通常",chance:60,mul:1.5},
 {name:"星の欠片",rarity:"レア",chance:25,mul:3},
 {name:"時空結晶",rarity:"神話",chance:12,mul:10},
 {name:"神の心臓",rarity:"超越",chance:3,mul:50}
];
const $=id=>document.getElementById(id);
const fmt=n=>!Number.isFinite(n)?"∞":n<1e6?Math.floor(n).toLocaleString("ja-JP"):n.toExponential(2);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function maxDice(){return [100,1000,10000,100000,999999999][maxStage]||999999999}
function startDice(){return 2+dimensionKey*50}
function getCritChance(){return clamp(.05+critLv*.02+research[2]*.01,0,.95)}
function getCritMultiplier(){return 3+critLv*.5+research[2]*.5}
function getPointMultiplier(){
 let x=(1+soul)*(1+timeCrystal*.25)*(1+darkMatter*.5)*Math.pow(2,blackHoleLv);
 x*=Math.pow(1+multiverseEnergy,2)*Math.pow(1.1,godPoint)*Math.pow(2,research[0]);
 x*=1+relics.reduce((a,r)=>a+(Number(r.mul)||0),0);
 x*=1+unlockedAchievements.length*.1;
 if(Date.now()<rageUntil)x*=Math.pow(100,1+rageLv*.5);
 return Number.isFinite(x)?x:Number.MAX_VALUE;
}
function getAutoInterval(){
 let ms=5000-Math.pow(autoLv,1.3)*120;
 ms=Math.max(100,ms)/(1+galaxyCrystal*.5)/(1+timeCrystal*.1);
 return Math.max(30,ms);
}
function alertMsg(msg){$("alert-msg").textContent=msg;setTimeout(()=>{$("alert-msg").textContent=""},1800)}
function criticalMsg(){$("crit-msg").textContent="💥 CRITICAL!! ×"+getCritMultiplier().toFixed(1);setTimeout(()=>{$("crit-msg").textContent=""},800)}
function shakeDices(){
 const currentMax=maxDice(),mult=getPointMultiplier();
 for(let c=0;c<subLv;c++){
  totalRolls++;
  let match=false;
  if(d<=10){let face=Math.floor(Math.random()*6)+1;match=true;for(let i=1;i<d;i++)if(Math.floor(Math.random()*6)+1!==face){match=false;break}}
  else match=Math.random()<1/6;
  if(!match&&Math.random()<research[1]*.02)match=true;
  const growChance=.02+dimensionKey*.05+research[3]*.02;
  if(Math.random()<Math.min(growChance,.95))match=true;
  const critical=Math.random()<getCritChance();
  const bonus=critical?getCritMultiplier():1;
  const comboBonus=1+Math.min(combo,100)*.02;
  p+=d*mult*bonus*comboBonus;
  if(critical)criticalMsg();
  if(match){combo++;if(d<currentMax){let old=d;d=Math.min(currentMax,d+1+Math.floor(dimensionKey*.5));if(String(old).length<String(d).length)alertMsg("✨ ダイス "+fmt(d)+" 個突破！")}}
  else combo=0;
 }
 renderDice();checkAchievements();updateUI();
}
function renderDice(){
 const area=$("box-area");area.innerHTML="";
 for(let i=0;i<Math.min(d,60);i++){const die=document.createElement("div");die.className="die";die.textContent=Math.floor(Math.random()*6)+1;area.appendChild(die)}
 if(d>60){const more=document.createElement("div");more.textContent="他 "+fmt(d-60)+" 個...";more.style.color="#aaa";area.appendChild(more)}
}
function buySub(){let cost=Math.floor(10*Math.pow(3,subLv-1));if(p<cost)return;p-=cost;subLv++;updateUI()}
function buyAuto(){let cost=Math.floor(50*Math.pow(2.2,autoLv));if(p<cost)return;p-=cost;autoLv++;startAutoTimer();updateUI()}
function startAutoTimer(){clearInterval(autoTimer);autoTimer=null;if(autoLv>0)autoTimer=setInterval(shakeDices,getAutoInterval())}
function buyCrit(){let cost=Math.floor(100*Math.pow(3,critLv));if(p<cost||critLv>=35)return;p-=cost;critLv++;alertMsg("💥 臨界突破 Lv."+critLv);checkAchievements();updateUI()}
function buyLimit(){let costs=[1,3,10,50];if(maxStage>=4||soul<costs[maxStage])return;soul-=costs[maxStage];maxStage++;updateUI()}
function resetBasic(){p=0;d=startDice();subLv=1;autoLv=0;critLv=0;combo=0;clearInterval(autoTimer);autoTimer=null;renderDice()}
function doPrestige(){let req=Math.max(50,Math.floor(maxDice()*.5));if(d<req){alert("ダイス "+fmt(req)+" 個必要です！");return}let gain=Math.max(1,Math.floor(Math.pow(d/100,1.5)));if(!confirm("ソウル +"+fmt(gain)+" を獲得しますか？"))return;soul+=gain;totalPrestiges++;resetBasic();checkAchievements();updateUI();alertMsg("🌀 SOUL +"+fmt(gain))}
function doGalaxy(){if(d<500){alert("ダイス500個以上必要です！");return}let gain=Math.floor(d/500);if(!confirm("ギャラクシー結晶 +"+fmt(gain)+" を獲得しますか？"))return;galaxyCrystal+=gain;totalPrestiges++;resetBasic();soul=0;maxStage=0;checkAchievements();updateUI()}
function doDimension(){let req=200+dimensionKey*50;if(d<req){alert("ダイス "+fmt(req)+" 個必要です！");return}if(!confirm("次元の鍵を1個獲得しますか？"))return;dimensionKey++;totalPrestiges++;resetBasic();soul=0;galaxyCrystal=0;maxStage=0;checkAchievements();updateUI()}
function doTime(){if(d<1000){alert("ダイス1,000個以上必要です！");return}let gain=Math.max(1,Math.floor(Math.sqrt(d/1000)));if(!confirm("時間結晶 +"+fmt(gain)+" を獲得しますか？"))return;timeCrystal+=gain;totalPrestiges++;resetBasic();soul=0;galaxyCrystal=0;maxStage=0;checkAchievements();updateUI()}
function doDark(){if(d<100000){alert("ダイス100,000個以上必要です！");return}let gain=Math.max(1,Math.floor(Math.pow(d/100000,1.5)*(1+timeCrystal*.1)));if(!confirm("🌑 ダークマター +"+fmt(gain)+" を獲得しますか？\n下位の進行状況がリセットされます。"))return;darkMatter+=gain;totalPrestiges++;resetBasic();soul=0;galaxyCrystal=0;timeCrystal=0;maxStage=0;checkAchievements();updateUI()}
function buyBlackHole(){let cost=Math.floor(5*Math.pow(3,blackHoleLv));if(darkMatter<cost)return;darkMatter-=cost;blackHoleLv++;updateUI();alertMsg("🕳️ BLACK HOLE Lv."+blackHoleLv)}
function doMulti(){if(darkMatter<1000){alert("ダークマター1,000個以上必要です！");return}let gain=Math.max(1,Math.floor(Math.pow(darkMatter/1000,1.2)));if(!confirm("多元宇宙エネルギー +"+fmt(gain)+" を獲得しますか？"))return;multiverseEnergy+=gain;darkMatter=0;blackHoleLv=0;resetBasic();soul=0;galaxyCrystal=0;timeCrystal=0;maxStage=0;checkAchievements();updateUI()}
function doGod(){if(multiverseEnergy<100){alert("多元宇宙エネルギー100個以上必要です！");return}let gain=Math.max(1,Math.floor(Math.pow(multiverseEnergy/100,1.2)));if(!confirm("👑 神格ポイント +"+fmt(gain)+" を獲得しますか？"))return;godPoint+=gain;multiverseEnergy=0;darkMatter=0;blackHoleLv=0;resetBasic();soul=0;galaxyCrystal=0;timeCrystal=0;maxStage=0;checkAchievements();updateUI()}
function researchCost(i){return Math.floor(10*Math.pow(3,research[i]))}
function buyResearch(i){let limits=[50,20,20,20],cost=researchCost(i);if(research[i]>=limits[i]||darkMatter<cost)return;darkMatter-=cost;research[i]++;checkAchievements();updateUI();alertMsg("🔬 研究完了！ Lv."+research[i])}
function activateRage(){if(Date.now()<rageUntil){alert("まだ暴走中です！");return}rageUntil=Date.now()+30000;updateUI();alertMsg("🔥 暴走モード発動！！")}
function upgradeRage(){let cost=Math.floor(100*Math.pow(3,rageLv));if(p<cost||rageLv>=20)return;p-=cost;rageLv++;checkAchievements();updateUI()}
function updateRage(){
 const active=Date.now()<rageUntil;
 $("rage-time").textContent=active?Math.ceil((rageUntil-Date.now())/1000)+"秒":"待機中";
 $("rage-mul").textContent=fmt(Math.pow(100,1+rageLv*.5));$("rage-lv").textContent=rageLv;
 const cost=Math.floor(100*Math.pow(3,rageLv));$("btn-rage-up").textContent="暴走強化 ("+fmt(cost)+" P)";
 $("btn-rage-up").disabled=p<cost||rageLv>=20;$("btn-rage").disabled=active;
}
function exploreRelic(){
 if(p<1000){alert("1,000P必要です！");return}p-=1000;
 let roll=Math.random()*100,total=0,selected=relicTypes[0];
 for(const r of relicTypes){total+=r.chance;if(roll<total){selected=r;break}}
 relics.push({name:selected.name,rarity:selected.rarity,mul:selected.mul});
 checkAchievements();updateUI();alertMsg("💎 "+selected.rarity+"："+selected.name);
}
function checkAchievements(){achievements.forEach((a,i)=>{if(!unlockedAchievements.includes(i)&&a[2]()){unlockedAchievements.push(i);alertMsg("🏆 実績解除："+a[0])}})}
function renderAchievements(){const area=$("achievement-list");area.innerHTML="";achievements.forEach((a,i)=>{let ok=unlockedAchievements.includes(i),item=document.createElement("div");item.className="achievement-item"+(ok?" unlocked":"");item.innerHTML="<strong>"+(ok?"🏆 ":"🔒 ")+a[0]+"</strong><div>"+a[1]+(ok?" / ポイント+10%":"")+"</div>";area.appendChild(item)})}
function renderRelics(){const area=$("relic-list");area.innerHTML="";relics.forEach(r=>{let item=document.createElement("div");item.className="relic-item";item.innerHTML="<strong>💎 "+r.name+" ["+r.rarity+"]</strong><div>+"+r.mul+" 倍相当のボーナス</div>";area.appendChild(item)})}
function updateUI(){
 const set=(id,v)=>$(id).textContent=v;
 set("p-text",fmt(p));set("d-text",fmt(d));set("max-text",fmt(maxDice()));set("mul-text",fmt(getPointMultiplier()));
 set("limit-current",fmt(maxDice()));set("next-max",maxStage>=4?"完了":fmt([1000,10000,100000,999999999][maxStage]));
 set("combo-msg","⚡ COMBO ×"+combo+" (+"+Math.min(combo,100)*2+"%)");
 set("sub-lv",subLv);set("auto-lv",autoLv);
 let sc=Math.floor(10*Math.pow(3,subLv-1)),ac=Math.floor(50*Math.pow(2.2,autoLv));
 $("btn-sub").textContent=fmt(sc)+" P";$("btn-sub").disabled=p<sc;
 $("btn-auto").textContent=fmt(ac)+" P";$("btn-auto").disabled=p<ac;
 set("auto-val",autoLv>0?(getAutoInterval()/1000).toFixed(2)+"秒":"未開放");
 set("crit-chance",(getCritChance()*100).toFixed(1)+"%");set("crit-mul",getCritMultiplier().toFixed(1));set("crit-lv",critLv);
 let cc=Math.floor(100*Math.pow(3,critLv));$("btn-crit").textContent=critLv>=35?"MAX":"強化 ("+fmt(cc)+" P)";$("btn-crit").disabled=p<cc||critLv>=35;
 let lc=[1,3,10,50];$("btn-limit").textContent=maxStage>=4?"MAX":fmt(lc[maxStage])+" ソウル";$("btn-limit").disabled=maxStage>=4||soul<lc[maxStage];
 set("soul-text",fmt(soul));set("soul-mul",fmt(1+soul));let sg=Math.max(1,Math.floor(Math.pow(d/100,1.5)));set("soul-gain",fmt(sg));
 $("btn-prestige").textContent="ソウル +"+fmt(sg)+" で転生";$("btn-prestige").disabled=d<Math.max(50,Math.floor(maxDice()*.5));
 set("galaxy-text",fmt(galaxyCrystal));set("galaxy-speed",fmt(1+galaxyCrystal*.5));let gg=Math.floor(d/500);set("galaxy-gain",fmt(gg));$("btn-galaxy").textContent="結晶 +"+fmt(gg)+" で宇宙転生";$("btn-galaxy").disabled=d<500;
 set("dimension-text",fmt(dimensionKey));set("dimension-start",fmt(startDice()));let dr=200+dimensionKey*50;set("dimension-required",fmt(dr));$("btn-dimension").textContent="次元超越 (必要 "+fmt(dr)+")";$("btn-dimension").disabled=d<dr;
 set("time-text",fmt(timeCrystal));set("time-mul",fmt(1+timeCrystal*.25));let tg=Math.max(1,Math.floor(Math.sqrt(d/1000)));set("time-gain",d>=1000?fmt(tg):"未解放");$("btn-time").textContent=d>=1000?"時間結晶 +"+fmt(tg)+" で超越":"ダイス1,000個で解放";$("btn-time").disabled=d<1000;
 set("dark-text",fmt(darkMatter));set("dark-mul",fmt(1+darkMatter*.5));let dg=Math.max(1,Math.floor(Math.pow(d/100000,1.5)*(1+timeCrystal*.1)));set("dark-gain",d>=100000?fmt(dg):"未解放");$("btn-dark").textContent=d>=100000?"🌑 DM +"+fmt(dg)+" で転生":"ダイス100,000個で解放";$("btn-dark").disabled=d<100000;
 set("black-lv",blackHoleLv);set("black-mul",fmt(Math.pow(2,blackHoleLv)));let bc=Math.floor(5*Math.pow(3,blackHoleLv));set("black-cost",fmt(bc));$("btn-black").textContent="強化 ("+fmt(bc)+" DM)";$("btn-black").disabled=darkMatter<bc;
 set("multi-text",fmt(multiverseEnergy));set("multi-mul",fmt(Math.pow(1+multiverseEnergy,2)));let mg=Math.max(1,Math.floor(Math.pow(darkMatter/1000,1.2)));set("multi-gain",darkMatter>=1000?fmt(mg):"未解放");$("btn-multi").textContent="転生して +"+fmt(mg);$("btn-multi").disabled=darkMatter<1000;
 set("god-text",fmt(godPoint));set("god-mul",fmt(Math.pow(1.1,godPoint)));let godg=Math.max(1,Math.floor(Math.pow(multiverseEnergy/100,1.2)));set("god-gain",multiverseEnergy>=100?fmt(godg):"未解放");$("btn-god").textContent="👑 神格化 +"+fmt(godg);$("btn-god").disabled=multiverseEnergy<100;
 for(let i=0;i<4;i++){set("res"+(i+1)+"-lv",research[i]);let cost=researchCost(i),limits=[50,20,20,20];$("btn-res"+(i+1)).textContent="研究 ("+fmt(cost)+" DM)";$("btn-res"+(i+1)).disabled=darkMatter<cost||research[i]>=limits[i]}
 updateRage();set("relic-count",relics.length);set("relic-mul",fmt(1+relics.reduce((a,r)=>a+r.mul,0)));
 renderRelics();renderAchievements();saveGame(false);
}
function currentState(){return {p,d,subLv,autoLv,soul,maxStage,galaxyCrystal,dimensionKey,timeCrystal,darkMatter,blackHoleLv,multiverseEnergy,godPoint,critLv,combo,totalRolls,totalPrestiges,research,rageLv,relics,unlockedAchievements}}
function saveGame(showMessage=true){
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(currentState()));$("save-status").textContent="💾 セーブ済み "+new Date().toLocaleTimeString();if(showMessage)alertMsg("💾 セーブしました！")}
 catch(e){$("save-status").textContent="⚠ セーブできません（容量・設定を確認）"}
}
function loadGame(){
 try{
  const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;
  const data=JSON.parse(raw);const defaults=currentState();
  for(const key of Object.keys(defaults)){
   if(key==="research"||key==="relics"||key==="unlockedAchievements")continue;
   if(Number.isFinite(data[key])){if(key==="d")d=Math.max(2,data[key]);else if(key==="subLv")subLv=Math.max(1,data[key]);else if(key==="maxStage")maxStage=clamp(Math.floor(data[key]),0,4);else windowStateAssign(key,data[key])}
  }
  if(Array.isArray(data.research)&&data.research.length===4)research=data.research.map(v=>Math.max(0,Number(v)||0));
  if(Array.isArray(data.relics))relics=data.relics.filter(r=>r&&typeof r.name==="string"&&Number.isFinite(Number(r.mul))).map(r=>({...r,mul:Number(r.mul)}));
  if(Array.isArray(data.unlockedAchievements))unlockedAchievements=data.unlockedAchievements.filter(i=>Number.isInteger(i)&&i>=0&&i<achievements.length);
  alertMsg("💾 セーブデータを読み込みました！");return true;
 }catch(e){alert("セーブデータの読み込みに失敗しました。");return false}
}
function windowStateAssign(key,value){
 const setters={p:v=>p=v,autoLv:v=>autoLv=v,soul:v=>soul=v,galaxyCrystal:v=>galaxyCrystal=v,dimensionKey:v=>dimensionKey=v,timeCrystal:v=>timeCrystal=v,darkMatter:v=>darkMatter=v,blackHoleLv:v=>blackHoleLv=v,multiverseEnergy:v=>multiverseEnergy=v,godPoint:v=>godPoint=v,critLv:v=>critLv=v,combo:v=>combo=v,totalRolls:v=>totalRolls=v,totalPrestiges:v=>totalPrestiges=v,rageLv:v=>rageLv=v};
 if(setters[key])setters[key](Math.max(0,value));
}
function resetAll(){if(!confirm("本当にすべてのデータを消去しますか？\nこの操作は取り消せません！"))return;localStorage.removeItem(SAVE_KEY);location.reload()}
$("roll-button").onclick=shakeDices;$("btn-sub").onclick=buySub;$("btn-auto").onclick=buyAuto;$("btn-crit").onclick=buyCrit;$("btn-limit").onclick=buyLimit;
$("btn-prestige").onclick=doPrestige;$("btn-galaxy").onclick=doGalaxy;$("btn-dimension").onclick=doDimension;$("btn-time").onclick=doTime;$("btn-dark").onclick=doDark;
$("btn-black").onclick=buyBlackHole;$("btn-multi").onclick=doMulti;$("btn-god").onclick=doGod;
for(let i=0;i<4;i++)$("btn-res"+(i+1)).onclick=()=>buyResearch(i);
$("btn-rage").onclick=activateRage;$("btn-rage-up").onclick=upgradeRage;$("btn-relic").onclick=exploreRelic;
$("btn-save").onclick=()=>saveGame(true);$("btn-reset").onclick=resetAll;
loadGame();renderDice();checkAchievements();updateUI();startAutoTimer();
setInterval(()=>{updateRage();if(autoLv>0&& !autoTimer)startAutoTimer()},1000);
setInterval(()=>saveGame(false),5000);
window.addEventListener("beforeunload",()=>saveGame(false));
