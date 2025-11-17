/**
 * [GITPAGES] build.js
 * Script Node.js para gerar páginas estáticas de imóveis e sitemap a partir do JSON exportado pelo Apps Script.
 *
 * Uso:
 * 1) Obter o JSON via endpoint do Apps Script: apiPost('exportarImoveisJSON') (pelo endpoint do WebApp).
 * 2) Salvar como imoveis.json localmente.
 * 3) node build.js
 *
 * NOTA: Este é um script de exemplo. Ajuste caminhos e templates conforme necessário.
 */

const fs = require('fs');
const path = require('path');

const IMOVEIS_JSON = './imoveis.json'; // salvar o resultado de Imoveis_exportarJSON aqui
const OUT_DIR = './dist'; // pasta onde ficam as páginas geradas
const TEMPLATE = (imovel) => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${imovel.tipo_imovel} - ${imovel.quartos} quartos - ${imovel.endereco_bairro} - ${imovel.endereco_cidade}</title>
  <meta name="description" content="${(imovel.descricao||'') .replace(/<[^>]+>/g,'').slice(0,160)}">
  <link rel="stylesheet" href="../css/imovel_detalhe.css" />
</head>
<body>
  <div class="imovel-detalhe">
    <h1>${imovel.tipo_imovel} - ${imovel.quartos} quartos</h1>
    <p>${imovel.endereco_rua} - ${imovel.endereco_bairro} - ${imovel.endereco_cidade}</p>
    <p>Faixa de preço: ${imovel.faixa_preco}</p>
    <div class="galeria">
      ${ (imovel.urls_imagens || []).map(u=>`<img src="${u}" alt="${imovel.slug}" />`).join('\n') }
    </div>
    <article>${imovel.descricao || ''}</article>
  </div>
</body>
</html>`;


if (!fs.existsSync(IMOVEIS_JSON)) {
  console.error('Arquivo imoveis.json não encontrado. Gere via Imoveis_exportarJSON e salve localmente como imoveis.json');
  process.exit(1);
}

const imoveis = JSON.parse(fs.readFileSync(IMOVEIS_JSON, 'utf8'));
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const imovelDir = path.join(OUT_DIR, 'imovel');
if (!fs.existsSync(imovelDir)) fs.mkdirSync(imovelDir, { recursive: true });

const sitemapUrls = [];
imoveis.forEach(imovel => {
  const nomeArquivo = imovel.slug + '.html';
  const conteudo = TEMPLATE(imovel);
  fs.writeFileSync(path.join(imovelDir, nomeArquivo), conteudo, 'utf8');
  sitemapUrls.push('/imovel/' + nomeArquivo);
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemap, 'utf8');

console.log('Build finalizado. Páginas geradas em', OUT_DIR);
