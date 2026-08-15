const KEY_CLIENTES='SOS_MOTOS_REINICIO_CLIENTES_V1';

const toast=document.getElementById('toast');
let toastTimer=null;
let clientes=carregarClientes();

function carregarClientes(){
  try{
    const dados=JSON.parse(localStorage.getItem(KEY_CLIENTES)||'[]');
    return Array.isArray(dados)?dados:[];
  }catch(e){
    return [];
  }
}

function salvarBancoClientes(){
  localStorage.setItem(KEY_CLIENTES,JSON.stringify(clientes));
}

function showToast(text){
  clearTimeout(toastTimer);
  toast.textContent=text;
  toast.classList.add('show');
  toastTimer=setTimeout(()=>toast.classList.remove('show'),1800);
}

function future(name){
  showToast(name+' — será ativado na próxima etapa.');
}

function showView(id){
  document.querySelectorAll('.view').forEach(view=>{
    view.classList.toggle('active',view.id===id);
  });

  document.querySelectorAll('.navBtn').forEach(btn=>{
    const action=btn.dataset.action||'';
    btn.classList.toggle('active',
      (id==='inicio' && action==='Início') ||
      (id==='clientes' && action==='Clientes')
    );
  });

  if(id==='clientes'){
    renderClientes();
  }

  window.scrollTo({top:0,behavior:'smooth'});
}

function iniciais(nome){
  return String(nome||'?')
    .trim()
    .split(/\s+/)
    .slice(0,2)
    .map(p=>p.charAt(0))
    .join('')
    .toUpperCase();
}

function escapeHtml(texto){
  return String(texto??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[m]));
}

function abrirModalCliente(cliente=null){
  document.getElementById('clienteId').value=cliente?.id||'';
  document.getElementById('clienteNome').value=cliente?.nome||'';
  document.getElementById('clienteWhats').value=cliente?.whatsapp||'';
  document.getElementById('tituloCliente').textContent=cliente?'Editar cliente':'Novo cliente';
  document.getElementById('modalCliente').classList.add('open');

  setTimeout(()=>document.getElementById('clienteNome').focus(),50);
}

function fecharModalCliente(){
  document.getElementById('modalCliente').classList.remove('open');
}

function salvarCliente(){
  const id=Number(document.getElementById('clienteId').value||0);
  const nome=document.getElementById('clienteNome').value.trim();
  const whatsapp=document.getElementById('clienteWhats').value.trim();

  if(!nome){
    showToast('Informe o nome do cliente.');
    return;
  }

  if(id){
    const cliente=clientes.find(c=>c.id===id);
    if(cliente){
      cliente.nome=nome;
      cliente.whatsapp=whatsapp;
    }
    showToast('Cliente atualizado.');
  }else{
    clientes.push({
      id:Date.now(),
      nome,
      whatsapp,
      criadoEm:new Date().toISOString()
    });
    showToast('Cliente cadastrado.');
  }

  salvarBancoClientes();
  fecharModalCliente();
  renderClientes();
}

function editarCliente(id){
  const cliente=clientes.find(c=>c.id===id);
  if(cliente)abrirModalCliente(cliente);
}

function excluirCliente(id){
  const cliente=clientes.find(c=>c.id===id);
  if(!cliente)return;

  if(!confirm('Excluir '+cliente.nome+'?'))return;

  clientes=clientes.filter(c=>c.id!==id);
  salvarBancoClientes();
  renderClientes();
  showToast('Cliente excluído.');
}

function renderClientes(){
  const lista=document.getElementById('listaClientes');
  if(!lista)return;

  const termo=(document.getElementById('buscaCliente')?.value||'')
    .trim()
    .toLowerCase();

  const filtrados=clientes
    .slice()
    .sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'))
    .filter(c=>
      `${c.nome} ${c.whatsapp||''}`.toLowerCase().includes(termo)
    );

  if(!filtrados.length){
    lista.innerHTML='<div class="emptyList">'+
      (clientes.length?'Nenhum cliente encontrado.':'Nenhum cliente cadastrado ainda.')+
      '</div>';
    return;
  }

  lista.innerHTML=filtrados.map(c=>`
    <div class="clientCard">
      <div class="clientMain">
        <div class="clientAvatar">${escapeHtml(iniciais(c.nome))}</div>
        <div class="clientInfo">
          <b>${escapeHtml(c.nome)}</b>
          <small>${escapeHtml(c.whatsapp||'WhatsApp não informado')}</small>
        </div>
      </div>

      <div class="clientActions">
        <button onclick="editarCliente(${c.id})">Editar</button>
        <button class="dangerBtn" onclick="excluirCliente(${c.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

/* Navegação da Etapa 2 */
document.querySelectorAll('[data-action]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const action=btn.dataset.action;

    if(action==='Início'){
      showView('inicio');
      return;
    }

    if(action==='Clientes'){
      showView('clientes');
      return;
    }

    future(action);
  });
});

document.getElementById('menuBtn').addEventListener('click',()=>future('Menu'));
document.getElementById('bellBtn').addEventListener('click',()=>future('Notificações'));
document.getElementById('waHero').addEventListener('click',()=>future('WhatsApp'));
document.getElementById('verTodosBtn').addEventListener('click',()=>future('Ordens de Serviço'));
document.getElementById('fabBtn').addEventListener('click',()=>future('Nova OS'));

document.getElementById('novoClienteBtn').addEventListener('click',()=>abrirModalCliente());
document.getElementById('fecharClienteBtn').addEventListener('click',fecharModalCliente);
document.getElementById('cancelarClienteBtn').addEventListener('click',fecharModalCliente);
document.getElementById('salvarClienteBtn').addEventListener('click',salvarCliente);
document.getElementById('buscaCliente').addEventListener('input',renderClientes);

document.getElementById('modalCliente').addEventListener('click',e=>{
  if(e.target.id==='modalCliente'){
    fecharModalCliente();
  }
});

renderClientes();
