/**
 * [GITPAGES] js/cadastro_corretor.js
 * Transforma imagens em base64 e envia dados para o Apps Script.
 */
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('formCadastroCorretor');
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const fd = new FormData(form);
    const dados = {};
    for (const [k,v] of fd.entries()) {
      if (v instanceof File) continue;
      dados[k] = v;
    }
    // processar arquivos
    const fileCreci = form.querySelector('input[name="imagem_creci"]').files[0];
    const filePerfil = form.querySelector('input[name="foto_perfil"]').files[0];
    if (fileCreci) dados.imagem_creci_blobBase64 = await toBase64(fileCreci);
    if (filePerfil) dados.foto_perfil_blobBase64 = await toBase64(filePerfil);

    const status = document.getElementById('status');
    status.textContent = 'Enviando...';
    const resp = await apiPost('cadastrarCorretor', dados);
    if (resp.sucesso) {
      status.textContent = 'Cadastro realizado com sucesso.';
      form.reset();
    } else {
      status.textContent = 'Erro: ' + (resp.erro || JSON.stringify(resp));
    }
  });
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
