function renderStages(){stageFlow.innerHTML=data.stages.map(s=>`<div class="stage ${s.status}"><div class="stageDot">${s.status==='observed'?'✓':'·'}</div><div class="stageValue">${s.value}</div><div class="stageLabel">${s.label}</div></div>`).join(''); unknownStrip.innerHTML=data.stages.filter(s=>s.status!=='observed').map(s=>`<span class="unknown">${s.label}: ${s.value}</span>`).join(''); gateList.innerHTML=data.gate.map(g=>`<div class="gateItem"><span class="gateDot"></span><span>${g}</span><span class="gateStatus">not evidenced here</span></div>`).join('')}
let reachIndex=0; function renderReach(){const s=data.reachScenarios[reachIndex]; scenarioCpa.textContent=usd(s.cpa); scenarioOptions.innerHTML=data.reachScenarios.map((x,i)=>`<button class="scenarioBtn ${i===reachIndex?'active':''}" data-reach="${i}">${x.leads}/8</button>`).join(''); scenarioRead.innerHTML=`<b>${s.leads} reachable lead${s.leads===1?'':'s'}</b><br>${s.read}. Effective CPA = ${usd(data.overall.spend)} observed spend ÷ ${s.leads} reachable leads.`; document.querySelectorAll('[data-reach]').forEach(b=>b.addEventListener('click',()=>{reachIndex=Number(b.dataset.reach);renderReach()}))}
let budgetLeads=20; function renderBudget(){const options=[10,15,20,25];budgetButtons.innerHTML=options.map(n=>`<button class="budgetBtn ${n===budgetLeads?'active':''}" data-budget="${n}">${n}</button>`).join(''); oneArm.textContent='$'+Math.round(budgetLeads*data.overall.crmDeliveredCpa).toLocaleString(); twoArm.textContent='$'+Math.round(budgetLeads*data.overall.crmDeliveredCpa*2).toLocaleString(); document.querySelectorAll('[data-budget]').forEach(b=>b.addEventListener('click',()=>{budgetLeads=Number(b.dataset.budget);renderBudget()}))}
function bindControls(){document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{placementFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderPlacements()}));document.querySelectorAll('[data-sort]').forEach(b=>b.addEventListener('click',()=>{placementSort=b.dataset.sort;document.querySelectorAll('[data-sort]').forEach(x=>x.classList.toggle('active',x===b));renderPlacements()}));document.getElementById('exportPlacement').addEventListener('click',exportPlacement);drawerClose.addEventListener('click',closeDrawer);drawerBackdrop.addEventListener('click',closeDrawer);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
  const links=[...document.querySelectorAll('.rail a')],sections=links.map(a=>document.querySelector(a.getAttribute('href')));const io=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio).slice(0,1).forEach(e=>{links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))})},{rootMargin:'-20% 0px -65% 0px',threshold:[0,.1,.25,.5]});sections.forEach(s=>io.observe(s));
}
async function initDashboard(){
  try{
    const response=await fetch('/data/first-access.json',{cache:'no-store'});
    if(!response.ok) throw new Error(`Snapshot request failed: ${response.status}`);
    data=await response.json();
    const syncChip=document.getElementById('syncChip');
    if(syncChip) syncChip.textContent=`Sheets snapshot · ${data.sourceMeta?.syncedOn||'synced'}`;
    renderAcquisition();renderTrend();renderPlacementSummary();renderPlacements();renderStages();renderReach();renderBudget();bindControls();
  }catch(error){
    const syncChip=document.getElementById('syncChip');
    if(syncChip) syncChip.textContent='Snapshot unavaile';
    document.querySelector('main').innerHTML=`<section class="section"><div class="card" style="padding:28px"><h2 style="margin-top:0">Measurement snapshot unavailable</h2><p style="color:var(--muted);line-height:1.55">The dashboard shell loaded, but its governed data snapshot did not. No fallback values were substituted.</p></div></section>`;
    console.error(error);
  }
}
initDashboard();
