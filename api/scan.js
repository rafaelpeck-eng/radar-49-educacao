import FirecrawlApp from '@mendable/firecrawl-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, portais, keywords, texto, empresa } = req.body;

  // MODO 1: PESQUISA WEB
  if (mode === 'search') {
    return await realizarPesquisa(portais, keywords, res);
  }

  // MODO 2: PARSE PARA JSON
  if (mode === 'parse') {
    return await estruturarJSON(texto, empresa, res);
  }

  return res.status(400).json({ error: 'Invalid mode' });
}

async function realizarPesquisa(portais, keywords, res) {
  const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
  });

  const queries = gerarQueries(keywords);
  let resultados = [];

  for (const portal of portais) {
    try {
      const searchQuery = queries[0] + ` site:${portal.url}`;
      
      const result = await app.scrapeUrl(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
        formats: ['markdown'],
        waitFor: 3000
      });

      if (result.success) {
        resultados.push({
          portal: portal.nome,
          conteudo: result.markdown
        });
      }
    } catch (error) {
      console.error(`Erro ao buscar ${portal.nome}:`, error.message);
    }
  }

  const textoCompleto = resultados.map(r => 
    `=== PORTAL: ${r.portal} ===\n${r.conteudo}\n`
  ).join('\n\n');

  res.status(200).send(textoCompleto);
}

async function estruturarJSON(texto, empresa, res) {
  const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
  });

  const prompt = `
Você é um especialista em análise de licitações públicas brasileiras.

CONTEXTO DA EMPRESA:
- Nome: ${empresa.nome} (${empresa.apelido})
- Serviços: ${empresa.servicos.join(', ')}
- Diferenciais: ${empresa.diferenciais.join(', ')}
- Sede: ${empresa.sede}

Sua tarefa é extrair do texto abaixo todas as licitações atualmente ABERTAS (com prazo de submissão no futuro) e estruturá-las em JSON puro.

TEXTO PARA ANÁLISE:
${texto.substring(0, 50000)}

REGRA DE OURO:
- Apenas licitações com prazo de submissão FUTURO (>= hoje)
-
