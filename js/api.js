/**
 * [GITPAGES] js/api.js
 * Funções de comunicação com o Google Apps Script (doPost).
 * Ajuste URL_DO_WEBAPP com o URL do deploy do Apps Script (web app).
 */
const URL_DO_WEBAPP = 'https://script.google.com/macros/s/AKfycbyZNvOz1Kg50pPF6fAfEg1_iK3tM6KgxJYOMmuFAWYhc5e04YuQyU7FFrwCaVzbld2c0A/exec'; // substituir

async function apiPost(acao, dados) {
  try {
    const payload = {
      acao: acao,
      dados: dados
    };
    const resp = await fetch(URL_DO_WEBAPP, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const json = await resp.json();
    if (json && json.sucesso) return { sucesso: true, resultado: json.resultado };
    return { sucesso: false, erro: json.erro || json };
  } catch (e) {
    return { sucesso: false, erro: e.toString() };
  }
}
