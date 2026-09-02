const state = {
  garden: JSON.parse(localStorage.getItem("flowerGarden") || "[]"),
  coins: Number(localStorage.getItem("flowerCoins") || 30),
  xp: Number(localStorage.getItem("flowerXP") || 0),
  planted: Number(localStorage.getItem("flowerPlanted") || 0),
  watered: Number(localStorage.getItem("flowerWatered") || 0),
  sound: localStorage.getItem("flowerSound") !== "off",
  selected: "rose"
};

let config = null;
const $ = s => document.querySelector(s);

async function loadConfig(){
  try {
    const res = await fetch("data.json");
    config = await res.json();
  } catch {
    config = {flowers:[
      {id:"rose",name:"Rose",emoji:"🌹",price:5,growth:20},
      {id:"tulip",name:"Tulip",emoji:"🌷",price:4,growth:25},
      {id:"sunflower",name:"Sunflower",emoji:"🌻",price:7,growth:18},
      {id:"cherry",name:"Cherry",emoji:"🌸",price:6,growth:22},
      {id:"daisy",name:"Daisy",emoji:"🌼",price:3,growth:30}
    ], maxPlots:15};
  }
  renderShop(); render();
}
function save(){
  localStorage.setItem("flowerGarden",JSON.stringify(state.garden));
  localStorage.setItem("flowerCoins",state.coins);
  localStorage.setItem("flowerXP",state.xp);
  localStorage.setItem("flowerPlanted",state.planted);
  localStorage.setItem("flowerWatered",state.watered);
  localStorage.setItem("flowerSound",state.sound?"on":"off");
}
function flower(id){return config.flowers.find(x=>x.id===id)}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
function beep(){
  if(!state.sound)return;
  try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=620;g.gain.value=.025;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.08)}catch{}
}
function addXP(n){state.xp+=n;if(state.xp>=100){state.xp-=100;state.coins+=15;toast("🎉 Level up! +15 coins")}save()}
function plant(index){
  if(state.garden[index]){water(index);return}
  const f=flower(state.selected);
  if(state.coins<f.price){toast("🪙 Coin kamu belum cukup");return}
  state.coins-=f.price; state.garden[index]={id:f.id,growth:0,last:Date.now()};
  state.planted++;addXP(15);beep();save();render();
  toast(`🌱 ${f.name} ditanam!`);
}
function water(index){
  const p=state.garden[index];if(!p)return;
  p.growth=Math.min(100,p.growth+20);p.last=Date.now();state.watered++;addXP(5);beep();save();render();
  toast(p.growth>=100?"🌸 Bunganya mekar sempurna!":"💧 Disiram +20%");
}
function renderShop(){
  $("#seedList").innerHTML=config.flowers.map(f=>`<button class="seed ${f.id===state.selected?"active":""}" data-id="${f.id}">
    <span class="semoji">${f.emoji}</span><b>${f.name}</b><small>🪙 ${f.price}</small></button>`).join("");
  document.querySelectorAll(".seed").forEach(b=>b.onclick=()=>{state.selected=b.dataset.id;renderShop();toast(`Benih ${flower(state.selected).name} dipilih`)});
}
function render(){
  const max=config.maxPlots||15;
  $("#flowerCount").textContent=state.garden.filter(Boolean).length;
  $("#coinCount").textContent=state.coins;
  $("#levelText").textContent=`Lv. ${Math.floor(state.xp/100)+1}`;
  $("#xpText").textContent=`${state.xp} / 100 XP`;
  $("#xpBar").style.width=state.xp+"%";
  $("#questPlant").textContent=Math.min(state.planted,3)+"/3";
  $("#questWater").textContent=Math.min(state.watered,5)+"/5";
  $("#questTypes").textContent=new Set(state.garden.filter(Boolean).map(p=>p.id)).size+"/5";
  $("#soundToggle").textContent=state.sound?"🔊":"🔇";
  $("#gardenHint").textContent=state.garden.filter(Boolean).length?`${state.garden.filter(Boolean).length} bunga tumbuh di tamanmu ✨`:"Tanam bunga pertama kamu ✨";
  $("#emptyState").style.display=state.garden.filter(Boolean).length?"none":"block";
  const garden=$("#garden");
  garden.querySelectorAll(".plot").forEach(x=>x.remove());
  for(let i=0;i<max;i++){
    const p=state.garden[i], el=document.createElement("div");el.className="plot";
    if(p){
      const f=flower(p.id);el.innerHTML=`<div class="plant"><span class="emoji">${p.growth>=100?f.emoji:"🌱"}</span><small>${p.growth>=100?"Bloom!":f.name}</small></div><span class="drop">💧</span><div class="growth"><span style="width:${p.growth}%"></span></div>`;
    } else el.innerHTML="<span style='font-size:22px;opacity:.25'>＋</span>";
    el.onclick=()=>plant(i);garden.appendChild(el);
  }
}
$("#plantRandom").onclick=()=>{const f=config.flowers[Math.floor(Math.random()*config.flowers.length)];state.selected=f.id;renderShop();const empty=state.garden.findIndex(x=>!x);if(empty>=0)plant(empty);else toast("🌷 Semua petak sudah terisi!")};
$("#waterAll").onclick=()=>{let count=0;state.garden.forEach(p=>{if(p&&p.growth<100){p.growth=Math.min(100,p.growth+20);count++;state.watered++}});if(count){addXP(count*3);save();render();beep();toast(`💧 ${count} bunga disiram!`)}else toast("🌸 Semua bunga sudah mekar!")};
$("#soundToggle").onclick=()=>{state.sound=!state.sound;save();render()};
$("#clearGarden").onclick=()=>{if(confirm("Reset taman? Progress taman akan dihapus.")){state.garden=[];save();render();toast("Taman direset 🌱")}};
loadConfig();
