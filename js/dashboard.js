/**
 * [GITPAGES] js/dashboard.js
 * Lógica do dashboard: carregar usuário, cadastrar imóvel e buscar leads.
 */
document.addEventListener('DOMContentLoaded', function(){
  const usuarioInfo = document.getElementById('usuarioInfo');
  const corretor = JSON.parse(localStorage.getItem('corretor') || 'null');
  if (!corretor) {
    alert('Usuário não autenticado.');
    location.href = 'login.html';
    return;
  }
  usuarioInfo.innerText = 'Logado como: ' + (corretor.nome_completo || corretor.username || '');

  // Form cadastrar imovel
  const formImovel = document.getElementById('formCadastroImovel');
  formImovel.addEventListener('submit', async function(e){
    e.preventDefault();
    const fd = new FormData(formImovel);
    const dados = {};
    for (const [k,v] of fd.entries()) {
      if (k === 'imagens') continue;
      dados[k] = v;
    }
    dados.id_corretor = corretor.id_corretor || '';
    // processar imagens
    const files = formImovel.querySelector('input[name="imagens"]').files;
    dados.imagens_base64 = [];
    for (let i=0;i<files.length;i++) {
      const b64 = await toBase64(files[i]);
      dados.imagens_base64.push(b64);
    }
    const status = document.getElementById('statusImovel');
    status.textContent = 'Enviando imóvel...';
    const resp = await apiPost('salvarImovel', dados);
    if (resp.sucesso) {
      status.textContent = 'Imóvel salvo com sucesso.';
      formImovel.reset();
    } else {
      status.textContent = 'Erro: ' + (resp.erro || JSON.stringify(resp));
    }
  });

  // Filtros relatório
  document.getElementById('btnPesquisar').addEventListener('click', async function(){
    const inicio = document.getElementById('dataInicio').value;
    const fim = document.getElementById('dataFim').value;
    const resp = await apiPost('pesquisarLeadsPeriodo', { data_inicio: inicio, data_fim: fim });
    const resultado = document.getElementById('resultadoPesquisa');
    if (resp.sucesso) {
      const arr = resp.resultado || [];
      resultado.innerHTML = '<p>Encontrados: ' + arr.length + '</p>';
      if (arr.length) {
        const tabela = document.createElement('table');
        tabela.innerHTML = '<tr><th>Nome</th><th>Telefone</th><th>Tipo</th><th>Mensagem</th></tr>';
        arr.forEach(l => {
          const tr = document.createElement('tr');
          tr.innerHTML = '<td>'+(l.nome||'')+'</td><td>'+(l.telefone||'')+'</td><td>'+(l.tipo_imovel||'')+'</td><td>'+(l.mensagem||'')+'</td>';
          tabela.appendChild(tr);
        });
        resultado.appendChild(tabela);
      }
    } else {
      resultado.textContent = 'Erro: ' + (resp.erro || JSON.stringify(resp));
    }
  });

  // carregar últimos leads do mês atual
  carregarLeadsMesAtual();

});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function carregarLeadsMesAtual() {
  const hoje = new Date();
  const mes = hoje.getMonth()+1;
  const ano = hoje.getFullYear();
  const resp = await apiPost('buscarLeadsMes', { mes: mes, ano: ano });
  const lista = document.getElementById('listaLeads');
  if (resp.sucesso) {
    const arr = resp.resultado || [];
    if (!arr.length) { lista.textContent = 'Nenhum lead este mês.'; return; }
    const tabela = document.createElement('table');
    tabela.innerHTML = '<tr><th>Selecionar</th><th>Nome</th><th>Telefone</th><th>Tipo</th><th>Mensagem</th><th>Acões</th></tr>';
    arr.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td><input type="checkbox" data-id="'+l.id_lead+'"></td><td>'+l.nome+'</td><td>'+l.telefone+'</td><td>'+l.tipo_imovel+'</td><td>'+l.mensagem+'</td><td><button data-tel="'+l.telefone+'" class="btnWhats">Whats</button></td>';
      tabela.appendChild(tr);
    });
    lista.innerHTML = '';
    lista.appendChild(tabela);
    // eventos de whatsapp
    tabela.querySelectorAll('.btnWhats').forEach(btn => {
      btn.addEventListener('click', async function(){
        const tel = this.getAttribute('data-tel');
        const mensagem = encodeURIComponent('Olá, vi seu contato e tenho imóveis que podem te interessar. Posso ajudar?');
        const resp = await apiPost('gerarLinkWhats', { telefone: tel, mensagem: mensagem });
        if (resp.sucesso) {
          window.open(resp.resultado.link, '_blank');
        } else alert('Erro: ' + (resp.erro || JSON.stringify(resp)));
      });
    });
  } else {
    lista.textContent = 'Erro ao carregar leads: ' + (resp.erro || JSON.stringify(resp));
  }
}
