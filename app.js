const KEY='SOS_MOTOS_CLEAN_V1';
let db=loadDB();
let clienteAtual=null,motoAtual=null;
let fotosOS={},fotoOSAlvo=null,pecasOS=[],pecasOrc=[],fotoMoto='';

function loadDB(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d)return {clientes:d.clientes||[],motos:d.motos||[],os:d.os||[],orcamentos:d.orcamentos||[]}}catch(e){}return {clientes:[],motos:[],os:[],orcamentos:[]}}
function saveDB(){localStorage.setItem(KEY,JSON.stringify(db));renderAll()}
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function num(v){return Number(String(v||'0').replace(/\./g,'').replace(',','.'))||0}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function initials(n){return String(n||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}
function cliente(id){return db.clientes.find(x=>String(x.id)===String(id))}
function moto(id){return db.motos.find(x=>String(x.id)===String(id))}
function statusClass(s){const t=String(s||'').toLowerCase();if(t.includes('aguard'))return'yellow';if(t.includes('concl')||t.includes('pronta')||t.includes('aprovado'))return'green';if(t.includes('não'))return'red';return'blue'}
function badge(s){return `<span class="badge ${statusClass(s)}">${esc(s||'Sem status')}</span>`}
function totalOS(o){return (o.pecas||[]).reduce((s,p)=>s+Number(p.valor||0),0)+Number(o.mao||0)}
function totalOrc(o){return (o.pecas||[]).reduce((s,p)=>s+Number(p.valor||0),0)+Number(o.mao||0)}
function dataBR(iso){if(!iso)return'';const d=new Date(iso);return isNaN(d)?String(iso):d.toLocaleDateString('pt-BR')}

function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.navBtn[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='clientes')renderClientes();
  if(id==='motos')renderMotos();
  if(id==='os')renderOS();
  if(id==='orcamentos')renderOrcamentos();
  if(id==='whatsapp')renderWhatsApp();
}
function toggleMenu(){showView('mais')}
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}

function renderAll(){renderHome();renderClientes();renderMotos();renderOS();renderOrcamentos();renderWhatsApp()}
function renderHome(){
  const emServico=db.os.filter(o=>['Em diagnóstico','Aprovado','Em serviço'].includes(o.status)).length;
  const aguard=db.os.filter(o=>o.status==='Aguardando aprovação').length;
  const concl=db.os.filter(o=>o.status==='Concluído').length;
  statServico.textContent=emServico;statAprovacao.textContent=aguard;statConcluidos.textContent=concl;
  document.querySelector('.bell i').textContent=aguard;
  const itens=db.os.filter(o=>!['Concluído','Não aprovado'].includes(o.status)).slice().reverse().slice(0,4);
  homeOS.innerHTML=itens.length?itens.map(o=>{const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{};return `<button class="card" onclick="editarOS(${o.id})"><div class="cardRow"><div class="avatar">🏍</div><div class="grow"><h3>${esc(m.modelo||'Moto')}</h3><p>${esc(c.nome||'Cliente')} • ${esc(o.servico||'')}</p><p>${money(totalOS(o))}</p></div>${badge(o.status)}</div></button>`}).join(''):'<div class="card"><p>Nenhum serviço em andamento.</p></div>';
}

function novoCliente(){clienteId.value='';clienteNome.value='';clienteTel.value='';clienteModalTitulo.textContent='Novo cliente';openModal('modalCliente')}
function editarCliente(id){const c=cliente(id);if(!c)return;clienteId.value=c.id;clienteNome.value=c.nome;clienteTel.value=c.tel||'';clienteModalTitulo.textContent='Editar cliente';openModal('modalCliente')}
function salvarCliente(){const nome=clienteNome.value.trim();if(!nome)return alert('Informe o nome.');const id=Number(clienteId.value||0),dados={nome,tel:clienteTel.value.trim()};if(id){Object.assign(cliente(id),dados)}else db.clientes.push({id:Date.now(),...dados});saveDB();closeModal('modalCliente')}
function excluirCliente(id){if(db.motos.some(m=>m.clienteId===id))return alert('Exclua primeiro as motos deste cliente.');if(confirm('Excluir cliente?')){db.clientes=db.clientes.filter(c=>c.id!==id);saveDB()}}
function renderClientes(){
  if(!window.listaClientes)return;
  const t=(buscaCliente.value||'').toLowerCase();
  const itens=db.clientes.filter(c=>`${c.nome} ${c.tel}`.toLowerCase().includes(t));
  listaClientes.innerHTML=itens.length?itens.map(c=>{const ms=db.motos.filter(m=>m.clienteId===c.id);const osn=db.os.filter(o=>ms.some(m=>m.id===o.motoId)).length;return `<div class="card"><button class="cardRow clearBtn" onclick="abrirCliente(${c.id})"><div class="avatar">${initials(c.nome)}</div><div class="grow"><h3>${esc(c.nome)}</h3><p>${esc(c.tel||'Sem WhatsApp')}</p><p>${ms.length} moto(s) • ${osn} serviço(s)</p></div><span>›</span></button><div class="miniActions"><button onclick="editarCliente(${c.id})">Editar</button><button onclick="excluirCliente(${c.id})">Excluir</button></div></div>`}).join(''):'<div class="card"><p>Nenhum cliente cadastrado.</p></div>';
}
function abrirCliente(id){clienteAtual=id;const ms=db.motos.filter(m=>m.clienteId===id);motoAtual=ms[0]?.id||null;clientesLista.classList.add('hidden');clienteDetalhe.classList.remove('hidden');renderClienteFicha()}
function voltarClientes(){clienteDetalhe.classList.add('hidden');clientesLista.classList.remove('hidden')}
function whatsClienteAtual(){const c=cliente(clienteAtual);if(c)abrirWhats(c.tel,`Olá ${c.nome}!`)}
function selecionarMotoCliente(id){motoAtual=id;renderClienteFicha()}
function renderClienteFicha(){
  const c=cliente(clienteAtual);if(!c)return;
  const ms=db.motos.filter(m=>m.clienteId===c.id);const m=moto(motoAtual)||ms[0];if(m)motoAtual=m.id;
  const oss=m?db.os.filter(o=>o.motoId===m.id).slice().sort((a,b)=>new Date(b.criadoEm)-new Date(a.criadoEm)):[];
  clienteFicha.innerHTML=`<div class="clientProfile"><div class="clientProfileTop"><div class="avatar">${initials(c.nome)}</div><div><h2>${esc(c.nome)}</h2><p>${esc(c.tel||'Sem WhatsApp')}</p><p>${ms.length} moto(s) cadastrada(s)</p></div></div></div>
  <h3 class="profileTitle">MOTOS DO CLIENTE</h3><div class="list">${ms.length?ms.map(x=>`<button class="bikeCard ${m&&m.id===x.id?'active':''}" onclick="selecionarMotoCliente(${x.id})">${x.foto?`<img class="bikePhoto" src="${x.foto}">`:`<div class="bikePhoto" style="display:grid;place-items:center">🏍</div>`}<div class="bikeInfo"><b>${esc(x.modelo)}</b><small>${esc(x.placa||'Sem placa')} • ${esc(x.km||'0')} km</small></div><span>›</span></button>`).join(''):'<div class="card"><p>Nenhuma moto cadastrada.</p></div>'}</div>
  ${m?`<h3 class="profileTitle">HISTÓRICO DE MANUTENÇÃO</h3><div class="timeline">${oss.length?oss.map(o=>`<div class="timeItem"><button class="timeCard" onclick="editarOS(${o.id})"><h4>OS #${o.id} • ${dataBR(o.criadoEm)}</h4><p>${esc(o.servico)}</p><p>${esc(o.status)}</p><div class="timeValue">${money(totalOS(o))}</div></button></div>`).join(''):'<div class="card"><p>Esta moto ainda não possui histórico.</p></div>'}</div>`:''}`;
}

function preencherClientesSelect(sel){sel.innerHTML=db.clientes.length?db.clientes.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join(''):'<option value="">Cadastre um cliente primeiro</option>'}
function novaMoto(){if(!db.clientes.length){alert('Cadastre um cliente primeiro.');return showView('clientes')}motoId.value='';motoModelo.value='';motoPlaca.value='';motoAno.value='';motoKm.value='';motoCor.value='';fotoMoto='';motoFotoPreview.src='';preencherClientesSelect(motoCliente);motoModalTitulo.textContent='Nova moto';openModal('modalMoto')}
function editarMoto(id){const m=moto(id);if(!m)return;preencherClientesSelect(motoCliente);motoId.value=m.id;motoCliente.value=m.clienteId;motoModelo.value=m.modelo;motoPlaca.value=m.placa||'';motoAno.value=m.ano||'';motoKm.value=m.km||'';motoCor.value=m.cor||'';fotoMoto=m.foto||'';motoFotoPreview.src=fotoMoto;motoModalTitulo.textContent='Editar moto';openModal('modalMoto')}
async function capturarFotoMoto(input){const f=input.files?.[0];if(!f)return;fotoMoto=await comprimirImagem(f,900,.72);motoFotoPreview.src=fotoMoto}
function salvarMoto(){if(!motoCliente.value)return alert('Selecione um cliente.');if(!motoModelo.value.trim())return alert('Informe o modelo.');const id=Number(motoId.value||0),dados={clienteId:Number(motoCliente.value),modelo:motoModelo.value.trim(),placa:motoPlaca.value.trim().toUpperCase(),ano:motoAno.value.trim(),km:motoKm.value.trim(),cor:motoCor.value.trim(),foto:fotoMoto};if(id)Object.assign(moto(id),dados);else db.motos.push({id:Date.now(),...dados});saveDB();closeModal('modalMoto')}
function excluirMoto(id){if(db.os.some(o=>o.motoId===id))return alert('Esta moto possui OS. Exclua as OS primeiro.');if(confirm('Excluir moto?')){db.motos=db.motos.filter(m=>m.id!==id);saveDB()}}
function renderMotos(){if(!window.listaMotos)return;const t=(buscaMoto.value||'').toLowerCase();const itens=db.motos.filter(m=>{const c=cliente(m.clienteId)||{};return `${m.modelo} ${m.placa} ${c.nome}`.toLowerCase().includes(t)});listaMotos.innerHTML=itens.length?itens.map(m=>{const c=cliente(m.clienteId)||{};return `<div class="card"><div class="cardRow">${m.foto?`<img class="bikePhoto" src="${m.foto}">`:`<div class="avatar">🏍</div>`}<div class="grow"><h3>${esc(m.modelo)}</h3><p>${esc(m.placa||'Sem placa')} • ${esc(c.nome||'Cliente')}</p><p>${esc(m.km||'0')} km</p></div></div><div class="miniActions"><button onclick="editarMoto(${m.id})">Editar</button><button onclick="excluirMoto(${m.id})">Excluir</button></div></div>`}).join(''):'<div class="card"><p>Nenhuma moto cadastrada.</p></div>'}

function preencherMotosOS(){osMoto.innerHTML=db.motos.length?db.motos.map(m=>{const c=cliente(m.clienteId)||{};return `<option value="${m.id}">${esc(c.nome)} — ${esc(m.modelo)} ${m.placa?'• '+esc(m.placa):''}</option>`}).join(''):'<option value="">Cadastre uma moto primeiro</option>'}
function novaOS(){if(!db.motos.length){alert('Cadastre cliente e moto primeiro.');return showView('clientes')}osId.value='';preencherMotosOS();osServico.value='';osStatus.value='Em diagnóstico';osChecklistObs.value='';osMao.value='';fotosOS={};pecasOS=[];renderFotosOS();renderPecasOS();atualizarTotalOS();osModalTitulo.textContent='Nova OS';openModal('modalOS')}
function editarOS(id){const o=db.os.find(x=>x.id===id);if(!o)return;preencherMotosOS();osId.value=o.id;osMoto.value=o.motoId;osServico.value=o.servico||'';osStatus.value=o.status||'Em diagnóstico';osChecklistObs.value=o.checklistObs||'';osMao.value=String(o.mao||'').replace('.',',');fotosOS={...(o.fotos||{})};pecasOS=(o.pecas||[]).map(p=>({...p}));renderFotosOS();renderPecasOS();atualizarTotalOS();osModalTitulo.textContent='Editar OS';openModal('modalOS')}
function abrirFotoOS(lado){fotoOSAlvo=lado;osFotoInput.click()}
async function capturarFotoOS(input){const f=input.files?.[0];if(!f)return;fotosOS[fotoOSAlvo]=await comprimirImagem(f,850,.65);renderFotosOS();input.value=''}
function renderFotosOS(){[['frente','fotoFrente'],['esq','fotoEsq'],['dir','fotoDir'],['tras','fotoTras']].forEach(([k,id])=>{document.getElementById(id).innerHTML=fotosOS[k]?`<img src="${fotosOS[k]}">`:'Sem foto'})}
function adicionarPecaOS(){pecasOS.push({nome:'',valor:0});renderPecasOS()}
function renderPecasOS(){osPecasLista.innerHTML=pecasOS.map((p,i)=>`<div class="pieceRow"><input placeholder="Nome da peça" value="${esc(p.nome)}" oninput="pecasOS[${i}].nome=this.value"><input inputmode="decimal" placeholder="R$" value="${Number(p.valor||0).toFixed(2).replace('.',',')}" oninput="pecasOS[${i}].valor=num(this.value);atualizarTotalOS()"><button onclick="pecasOS.splice(${i},1);renderPecasOS();atualizarTotalOS()">×</button></div>`).join('')}
function atualizarTotalOS(){osTotal.textContent=money(pecasOS.reduce((s,p)=>s+Number(p.valor||0),0)+num(osMao.value))}
function salvarOS(){if(!osMoto.value)return alert('Selecione uma moto.');if(!osServico.value.trim())return alert('Informe o serviço.');const id=Number(osId.value||0),dados={motoId:Number(osMoto.value),servico:osServico.value.trim(),status:osStatus.value,checklistObs:osChecklistObs.value.trim(),mao:num(osMao.value),pecas:pecasOS.filter(p=>p.nome||p.valor).map(p=>({nome:p.nome.trim(),valor:Number(p.valor||0)})),fotos:{...fotosOS},atualizadoEm:new Date().toISOString()};let o;if(id){o=db.os.find(x=>x.id===id);Object.assign(o,dados)}else{o={id:Date.now(),criadoEm:new Date().toISOString(),...dados};db.os.push(o);osId.value=o.id}saveDB();return o}
function excluirOS(id){if(confirm('Excluir esta OS?')){db.os=db.os.filter(o=>o.id!==id);saveDB()}}
function renderOS(){if(!window.listaOS)return;const t=(buscaOS.value||'').toLowerCase();const itens=db.os.slice().reverse().filter(o=>{const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{};return `${c.nome} ${m.modelo} ${m.placa} ${o.servico}`.toLowerCase().includes(t)});listaOS.innerHTML=itens.length?itens.map(o=>{const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{};return `<div class="card"><div class="cardRow"><div class="grow"><h3>${esc(c.nome||'Cliente')} — ${esc(m.modelo||'Moto')}</h3><p>${esc(m.placa||'Sem placa')} • ${esc(o.servico)}</p><p>${money(totalOS(o))}</p></div>${badge(o.status)}</div><div class="miniActions"><button onclick="editarOS(${o.id})">Abrir</button><button onclick="compartilharPdfOS(${o.id})">PDF</button><button onclick="enviarOSPorId(${o.id})">WhatsApp</button><button onclick="excluirOS(${o.id})">Excluir</button></div></div>`}).join(''):'<div class="card"><p>Nenhuma OS cadastrada.</p></div>'}

function novoOrcamento(){orcId.value='';orcCliente.value='';orcTel.value='';orcMoto.value='';orcMao.value='';pecasOrc=[{nome:'',valor:0}];const d=new Date();d.setDate(d.getDate()+7);orcValidade.value=d.toISOString().slice(0,10);renderPecasOrc();atualizarTotalOrc();orcModalTitulo.textContent='Novo orçamento';openModal('modalOrc')}
function editarOrcamento(id){const o=db.orcamentos.find(x=>x.id===id);if(!o)return;orcId.value=o.id;orcCliente.value=o.cliente;orcTel.value=o.tel||'';orcMoto.value=o.moto||'';orcMao.value=String(o.mao||'').replace('.',',');orcValidade.value=o.validade||'';pecasOrc=(o.pecas||[]).map(p=>({...p}));renderPecasOrc();atualizarTotalOrc();orcModalTitulo.textContent='Editar orçamento';openModal('modalOrc')}
function adicionarPecaOrc(){pecasOrc.push({nome:'',valor:0});renderPecasOrc()}
function renderPecasOrc(){orcPecasLista.innerHTML=pecasOrc.map((p,i)=>`<div class="pieceRow"><input placeholder="Nome da peça" value="${esc(p.nome)}" oninput="pecasOrc[${i}].nome=this.value"><input inputmode="decimal" placeholder="R$" value="${Number(p.valor||0).toFixed(2).replace('.',',')}" oninput="pecasOrc[${i}].valor=num(this.value);atualizarTotalOrc()"><button onclick="pecasOrc.splice(${i},1);renderPecasOrc();atualizarTotalOrc()">×</button></div>`).join('')}
function atualizarTotalOrc(){orcTotal.textContent=money(pecasOrc.reduce((s,p)=>s+Number(p.valor||0),0)+num(orcMao.value))}
function salvarOrcamento(){if(!orcCliente.value.trim())return alert('Informe o cliente.');const id=Number(orcId.value||0),dados={cliente:orcCliente.value.trim(),tel:orcTel.value.trim(),moto:orcMoto.value.trim(),pecas:pecasOrc.filter(p=>p.nome||p.valor).map(p=>({nome:p.nome.trim(),valor:Number(p.valor||0)})),mao:num(orcMao.value),validade:orcValidade.value,atualizadoEm:new Date().toISOString()};let o;if(id){o=db.orcamentos.find(x=>x.id===id);Object.assign(o,dados)}else{o={id:Date.now(),criadoEm:new Date().toISOString(),...dados};db.orcamentos.push(o);orcId.value=o.id}saveDB();return o}
function excluirOrcamento(id){if(confirm('Excluir orçamento?')){db.orcamentos=db.orcamentos.filter(o=>o.id!==id);saveDB()}}
function renderOrcamentos(){if(!window.listaOrcamentos)return;const t=(buscaOrc.value||'').toLowerCase();const itens=db.orcamentos.slice().reverse().filter(o=>`${o.cliente} ${o.moto}`.toLowerCase().includes(t));listaOrcamentos.innerHTML=itens.length?itens.map(o=>`<div class="card"><h3>${esc(o.cliente)}</h3><p>${esc(o.moto||'Moto não informada')}</p><p>Validade: ${o.validade?new Date(o.validade+'T12:00:00').toLocaleDateString('pt-BR'):'-'}</p><div class="timeValue">${money(totalOrc(o))}</div><div class="miniActions"><button onclick="editarOrcamento(${o.id})">Editar</button><button onclick="compartilharPdfOrc(${o.id})">PDF</button><button onclick="enviarOrcPorId(${o.id})">WhatsApp</button><button onclick="excluirOrcamento(${o.id})">Excluir</button></div></div>`).join(''):'<div class="card"><p>Nenhum orçamento cadastrado.</p></div>'}

function abrirWhats(tel,text){let n=String(tel||'').replace(/\D/g,'');if(n&&!n.startsWith('55'))n='55'+n;window.open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`,'_blank')}
function textoOS(o){const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{};return `S.O.S MOTOS\n\nCliente: ${c.nome||''}\nMoto: ${m.modelo||''}\nPlaca: ${m.placa||''}\nServiço: ${o.servico}\nStatus: ${o.status}\nPeças: ${money((o.pecas||[]).reduce((s,p)=>s+Number(p.valor||0),0))}\nMão de obra: ${money(o.mao)}\nTOTAL: ${money(totalOS(o))}\n\nPor favor responda:\n✅ APROVADO\nou\n❌ NÃO APROVADO`}
function enviarOSWhatsApp(){const o=salvarOS();if(!o)return;const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{};o.status='Aguardando aprovação';saveDB();abrirWhats(c.tel,textoOS(o))}
function enviarOSPorId(id){const o=db.os.find(x=>x.id===id);if(!o)return;const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{};abrirWhats(c.tel,textoOS(o))}
function textoOrc(o){return `S.O.S MOTOS - ORÇAMENTO\n\nCliente: ${o.cliente}\nMoto: ${o.moto||''}\n\n${(o.pecas||[]).map((p,i)=>`${i+1}. ${p.nome} — ${money(p.valor)}`).join('\n')}\n\nMão de obra: ${money(o.mao)}\nTOTAL: ${money(totalOrc(o))}\nValidade: ${o.validade?new Date(o.validade+'T12:00:00').toLocaleDateString('pt-BR'):'7 dias'}`}
function enviarOrcWhatsApp(){const o=salvarOrcamento();if(o)abrirWhats(o.tel,textoOrc(o))}
function enviarOrcPorId(id){const o=db.orcamentos.find(x=>x.id===id);if(o)abrirWhats(o.tel,textoOrc(o))}
function renderWhatsApp(){if(!window.listaWhatsApp)return;const itens=db.os.filter(o=>['Aguardando aprovação','Pronta'].includes(o.status)).slice().reverse();listaWhatsApp.innerHTML=itens.length?itens.map(o=>{const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{};return `<div class="card"><h3>${esc(c.nome||'Cliente')} — ${esc(m.modelo||'Moto')}</h3><p>${esc(o.status)}</p><button class="waBtn full" onclick="enviarOSPorId(${o.id})">Abrir WhatsApp</button></div>`}).join(''):'<div class="card"><p>Nenhuma comunicação pendente.</p></div>'}

function pdfLib(){return window.jspdf?.jsPDF||null}
async function sharePdf(doc,nome){const blob=doc.output('blob'),f=new File([blob],nome,{type:'application/pdf'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[f]}))){try{return await navigator.share({files:[f],title:nome})}catch(e){if(e.name==='AbortError')return}}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nome;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function addHeader(doc,t){doc.setFont('helvetica','bold');doc.setFontSize(20);doc.text('S.O.S MOTOS',14,18);doc.setDrawColor(230,30,40);doc.line(14,24,196,24);doc.setFontSize(14);doc.text(t,14,34);return 43}
function line(doc,l,v,y){doc.setFontSize(10);doc.setFont('helvetica','bold');doc.text(l,14,y);doc.setFont('helvetica','normal');doc.text(doc.splitTextToSize(String(v||'-'),135),58,y);return y+7}
async function compartilharPdfOS(id){const o=db.os.find(x=>x.id===id);if(!o)return;const J=pdfLib();if(!J)return alert('PDF ainda não carregou.');const m=moto(o.motoId)||{},c=cliente(m.clienteId)||{},doc=new J({unit:'mm',format:'a4'});let y=addHeader(doc,'ORDEM DE SERVIÇO');y=line(doc,'Cliente:',c.nome,y);y=line(doc,'WhatsApp:',c.tel,y);y=line(doc,'Moto:',`${m.modelo||''} ${m.placa||''}`,y);y=line(doc,'Serviço:',o.servico,y);y=line(doc,'Status:',o.status,y);y=line(doc,'Checklist:',o.checklistObs||'Sem observações',y);y=line(doc,'Peças:',money((o.pecas||[]).reduce((s,p)=>s+Number(p.valor||0),0)),y);y=line(doc,'Mão de obra:',money(o.mao),y);y=line(doc,'TOTAL:',money(totalOS(o)),y);const lista=[['Frente',o.fotos?.frente],['Esquerda',o.fotos?.esq],['Direita',o.fotos?.dir],['Traseira',o.fotos?.tras]].filter(x=>x[1]);if(lista.length){doc.addPage();doc.setFont('helvetica','bold');doc.text('Checklist fotográfico',14,18);const pos=[[14,28],[106,28],[14,105],[106,105]];lista.forEach((it,i)=>{try{doc.text(it[0],pos[i][0],pos[i][1]);doc.addImage(it[1],'JPEG',pos[i][0],pos[i][1]+4,82,62)}catch(e){}})}await sharePdf(doc,`OS-${c.nome||'cliente'}.pdf`)}
function gerarPdfOSAtual(){const o=salvarOS();if(o)compartilharPdfOS(o.id)}
async function compartilharPdfOrc(id){const o=db.orcamentos.find(x=>x.id===id);if(!o)return;const J=pdfLib();if(!J)return alert('PDF ainda não carregou.');const doc=new J({unit:'mm',format:'a4'});let y=addHeader(doc,'ORÇAMENTO');y=line(doc,'Cliente:',o.cliente,y);y=line(doc,'WhatsApp:',o.tel,y);y=line(doc,'Moto:',o.moto,y);(o.pecas||[]).forEach((p,i)=>{y=line(doc,`${i+1}.`,`${p.nome} — ${money(p.valor)}`,y)});y=line(doc,'Mão de obra:',money(o.mao),y);y=line(doc,'TOTAL:',money(totalOrc(o)),y);y=line(doc,'Validade:',o.validade?new Date(o.validade+'T12:00:00').toLocaleDateString('pt-BR'):'7 dias',y);await sharePdf(doc,`Orcamento-${o.cliente}.pdf`)}
function gerarPdfOrcAtual(){const o=salvarOrcamento();if(o)compartilharPdfOrc(o.id)}

function comprimirImagem(file,max=900,q=.7){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',q))};im.onerror=reject;im.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}

function exportarBackup(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sos-motos-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importarBackup(input){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);db={clientes:d.clientes||[],motos:d.motos||[],os:d.os||[],orcamentos:d.orcamentos||[]};saveDB();alert('Backup importado.')}catch(e){alert('Arquivo inválido.')}};r.readAsText(f)}
function zerarDados(){if(confirm('Apagar TODOS os dados deste app?')){localStorage.removeItem(KEY);db=loadDB();renderAll();showView('inicio')}}

document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
renderAll();

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
