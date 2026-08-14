function enviarWhatsApp() {
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;
  const modelo = document.getElementById('modelo').value;
  const placa = document.getElementById('placa').value;
  const oleo = document.getElementById('oleo').checked ? 'OK' : 'Atenção';
  const freios = document.getElementById('freios').checked ? 'OK' : 'Atenção';
  const obs = document.getElementById('obs').value;
  
  const vPecas = parseFloat(document.getElementById('vPecas').value || 0);
  const vMaoObra = parseFloat(document.getElementById('vMaoObra').value || 0);
  const total = vPecas + vMaoObra;

  const mensagem = `🛠️ *S.O.S MOTOS - ORÇAMENTO*\n\n` +
    `Olá, *${nome}*!\nRelatório da sua *${modelo}* (${placa}):\n\n` +
    `📋 *Checklist:*\n• Óleo: ${oleo}\n• Freios: ${freios}\n⚠️ Obs: ${obs}\n\n` +
    `💵 *Total: R$ ${total.toFixed(2)}*\n\nPodemos aprovar o serviço?`;

  const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}
