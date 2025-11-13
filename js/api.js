/**
 * [GITPAGES] js/api.js
 * Comunicação completa com o Google Apps Script para o CRM Imobiliário.
 * Inclui tratamento de erros, retry, reCAPTCHA e CORS.
 */

// Substitua pela URL /exec do seu Web App publicado no Apps Script
const URL_DO_WEBAPP = 'https://script.google.com/macros/s/AKfycbyZNvOz1Kg50pPF6fAfEg1_iK3tM6KgxJYOMmuFAWYhc5e04YuQyU7FFrwCaVzbld2c0A/exec';

// Número máximo de tentativas em caso de erro de rede
const MAX_RETRIES = 3;

/**
 * Função genérica para chamadas POST ao Apps Script
 * @param {string} acao - Nome da ação a ser executada no Apps Script
 * @param {object} dados - Objeto com os dados da ação
 * @param {string} recaptchaToken - (Opcional) token do reCAPTCHA
 */
async function apiPost(acao, dados = {}, recaptchaToken = '') {
  const payload = { acao, dados };

  // Se fornecido, adiciona token do reCAPTCHA
  if (recaptchaToken) payload.dados.recaptchaToken = recaptchaToken;

  for (let tentativa = 1; tentativa <= MAX_RETRIES; tentativa++) {
    try {
      const resp = await fetch(URL_DO_WEBAPP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors',      // habilita CORS
        cache: 'no-cache'  // evita cache do navegador
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json();
      if (json && json.sucesso) return { sucesso: true, resultado: json.resultado };
      return { sucesso: false, erro: json.erro || 'Erro desconhecido' };

    } catch (e) {
      console.warn(`Tentativa ${tentativa} falhou: ${e}`);
      if (tentativa === MAX_RETRIES) return { sucesso: false, erro: e.toString() };
      await new Promise(r => setTimeout(r, 500 * tentativa)); // delay incremental
    }
  }
}

/**
 * Função helper para executar reCAPTCHA v2/v3
 * @param {string} siteKey - sua site key do Google reCAPTCHA
 * @param {string} action - ação do reCAPTCHA (v3)
 */
async function executarRecaptcha(siteKey, action = 'submit') {
  if (!grecaptcha) return '';
  return new Promise((resolve) => {
    if (grecaptcha.execute) {
      grecaptcha.execute(siteKey, { action }).then(token => resolve(token));
    } else {
      console.warn('reCAPTCHA não carregado');
      resolve('');
    }
  });
}

/**
 * Exemplo de uso genérico
 */
async function salvarLeadExemplo() {
  try {
    const token = await executarRecaptcha('6LfSQg8sAAAAAFksr5X5sZ8MvxFbm-GUCwFNPp51', 'salvarLead'); //chave site recaptchaToken
    const dadosLead = { nome: "João", email: "joao@email.com", telefone: "999999999" };
    const res = await apiPost('salvarLead', dadosLead, token);
    if (res.sucesso) console.log("Lead salvo:", res.resultado);
    else console.error("Erro ao salvar lead:", res.erro);
  } catch (err) {
    console.error("Erro inesperado:", err);
  }
}
