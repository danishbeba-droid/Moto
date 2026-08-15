const toast=document.getElementById('toast');
let toastTimer=null;

function showToast(text){
  clearTimeout(toastTimer);
  toast.textContent=text;
  toast.classList.add('show');
  toastTimer=setTimeout(()=>toast.classList.remove('show'),1800);
}

function future(name){
  showToast(name+' — será ativado na próxima etapa.');
}

document.querySelectorAll('[data-action]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const action=btn.dataset.action;
    if(action==='Início'){
      showToast('Tela inicial funcionando.');
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
