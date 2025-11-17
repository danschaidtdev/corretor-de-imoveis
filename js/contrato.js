/**
 * [GITPAGES] js/contrato.js
 * Lógica de geração de contratos via Dashboard.
 * Exemplo de chamada:
 * apiPost('gerarContratoPDF', { tipo: 'locacao', campos: {...}, id_corretor: 'ID_Corretor_xxx' })
 */
async function gerarContrato(tipo, campos) {
  const resp = await apiPost('gerarContratoPDF', { tipo, campos, id_corretor: campos.id_corretor });
  if (resp.sucesso) {
    return resp.resultado.url_pdf;
  } else {
    throw new Error(resp.erro || 'Erro desconhecido');
  }
}
