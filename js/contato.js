/**
 * [GITPAGES] js/contato.js
 * Lógica do formulário de lead (validação e envio).
 */
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('formContato');
  const selNeg = document.getElementById('selectNegociacao');
  const sec = document.getElementById('opcoesNegociacaoSecundarias');
  function atualizarOpcoes() {
    const val = selNeg.value;
    sec.innerHTML = '';
    const label = document.createElement('label');
    label.textContent = 'Opções:';
    const sel = document.createElement('select');
    sel.name = 'opcoes_secundarias';
    if (val === 'Aluga') {
      sel.innerHTML = '<option>Com Fiador</option><option>Sem Fiador</option>';
    } else {
      sel.innerHTML = '<option>À Vista</option><option>Financiamento</option><option>Permuta</option>';
    }
    sec.appendChild(label);
    sec.appendChild(sel);
  }
  selNeg.addEventListener('change', atualizarOpcoes);
  atualizarOpcoes();

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const fd = new FormData(form);
    const obj = {};
    fd.forEach((v,k) => obj[k]=v);
    // opcional: coletar recaptcha token se implementado
    // obj.recaptchaToken = grecaptcha.getResponse();

    // Proteção simples: limitar requisições por IP é responsabilidade do backend
    const status = document.getElementById('status');
    status.textContent = 'Enviando...';
    const resp = await apiPost('salvarLead', obj);
    if (resp.sucesso) {
      status.textContent = 'Obrigado! Recebemos seu contato.';
      form.reset();
      atualizarOpcoes();
    } else {
      status.textContent = 'Erro: ' + (resp.erro || JSON.stringify(resp));
    }
  });
});
