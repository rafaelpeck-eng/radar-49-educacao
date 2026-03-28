import FirecrawlApp from '@mendable/firecrawl-js';

export default async function handler(req, res) {
  // Configurar Firecrawl
  const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
  });

  // Portais de licitações para monitorar
  const portais = [
    {
      nome: 'ComprasNet',
      url: 'https://www.comprasnet.gov.br',
      keywords: ['educação', 'ensino', 'treinamento', 'curso', 'capacitação']
    },
    {
      nome: 'BEC SP',
      url: 'https://www.bec.sp.gov.br',
      keywords: ['educação', 'ensino', 'material didático']
    },
    {
      nome: 'Licitações-e',
      url: 'https://www.licitacoes-e.com.br',
      keywords: ['educação', 'ensino', 'consultoria']
    }
  ];

  const todasLicitacoes = [];

  // Varredura em cada portal
  for (const portal of portais) {
    try {
      const scrapeResult = await app.scrapeUrl(portal.url, {
        formats: ['markdown', 'html'],
        waitFor: 3000,
        timeout: 15000
      });

      if (scrapeResult.success) {
        // Extrair licitações do conteúdo
        const licitacoes = extrairLicitacoes(scrapeResult, portal);
        todasLicitacoes.push(...licitacoes);
      }
    } catch (error) {
      console.error(`Erro ao scrapear ${portal.nome}:`, error);
    }
  }

  // Retornar resultados
  res.status(200).json({ 
    success: true,
    count: todasLicitacoes.length,
    licitacoes: todasLicitacoes,
    timestamp: new Date().toISOString()
  });
}

function extrairLicitacoes(scrapeResult, portal) {
  const licitacoes = [];
  const conteudo = scrapeResult.markdown || scrapeResult.html;
  
  // Padrões para identificar licitações
  const padroes = [
    /pregão\s+(eletrônico|presencial)?\s*n[º.\s]+\s*\d+/gi,
    /concorrência\s*n[º.\s]+\s*\d+/gi,
    /dispensa\s+(de\s+licitação)?\s*n[º.\s]+\s*\d+/gi,
    /tomada\s+de\s+preços\s+n[º.\s]+\s*\d+/gi
  ];

  // Verificar se há palavras-chave de educação
  const temEducacao = portal.keywords.some(keyword => 
    conteudo.toLowerCase().includes(keyword.toLowerCase())
  );

  if (temEducacao) {
    // Extrair informações básicas
    const titulo = extrairTitulo(conteudo);
    const valor = extrairValor(conteudo);
    const prazo = extrairPrazo(conteudo);
    
    licitacoes.push({
      id: Date.now() + Math.random(),
      title: titulo || `Licitação - ${portal.nome}`,
      organo: portal.nome,
      value: valor || 'Não informado',
      deadline: prazo || 'Não informado',
      relevance: 'high',
      status: calcularStatus(prazo),
      url: portal.url,
      portal: portal.nome
    });
  }

  return licitacoes;
}

function extrairTitulo(conteudo) {
  const match = conteudo.match(/(?:pregão|concorrência|dispensa).*?(?:n[º.]\s*\d+)/i);
  return match ? match[0] : null;
}

function extrairValor(conteudo) {
  const match = conteudo.match(/R\$\s*[\d.]+,\d+/i);
  return match ? match[0] : null;
}

function extrairPrazo(conteudo) {
  const match = conteudo.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/i);
  return match ? match[0] : null;
}

function calcularStatus(prazo) {
  if (!prazo) return 'open';
  
  try {
    const [dia, mes, ano] = prazo.split('/');
    const dataPrazo = new Date(`${ano}-${mes}-${dia}`);
    const hoje = new Date();
    const diasRestantes = Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes <= 0) return 'closed';
    if (diasRestantes <= 7) return 'urgent';
    if (diasRestantes <= 15) return 'closing';
    return 'open';
  } catch {
    return 'open';
  }
}
