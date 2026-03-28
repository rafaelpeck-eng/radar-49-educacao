import FirecrawlApp from '@mendable/firecrawl-js';

export default async function handler(req, res) {
  // Configurar Firecrawl
  const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
  });

  const todasLicitacoes = [];

  // Lista de portais para buscar
  const portais = [
    {
      nome: 'ComprasNet',
      url: 'https://www.comprasnet.gov.br',
      searchUrl: 'https://www.comprasnet.gov.br/consulta/licitacoes'
    },
    {
      nome: 'Portal da Transparência',
      url: 'https://portaldatransparencia.gov.br',
      searchUrl: 'https://portaldatransparencia.gov.br/licitacoes'
    },
    {
      nome: 'BEC SP',
      url: 'https://www.bec.sp.gov.br',
      searchUrl: 'https://www.bec.sp.gov.br/WBEC/SapPortal/ConsultarLicitacao.aspx'
    }
  ];

  // Palavras-chave para filtrar (educação)
  const keywords = ['educação', 'ensino', 'treinamento', 'curso', 'capacitação', 'material didático', 'tecnologia educacional'];

  console.log('Iniciando varredura nos portais...');

  // Varredura em cada portal
  for (const portal of portais) {
    try {
      console.log(`Buscando no portal: ${portal.nome}`);
      
      const scrapeResult = await app.scrapeUrl(portal.searchUrl || portal.url, {
        formats: ['markdown', 'html'],
        waitFor: 5000,
        timeout: 30000
      });

      if (scrapeResult.success) {
        console.log(`Sucesso ao scrapear ${portal.nome}`);
        
        // Extrair licitações do conteúdo
        const licitacoes = extrairLicitacoesDoConteudo(
          scrapeResult.markdown || scrapeResult.html, 
          portal, 
          keywords
        );
        
        todasLicitacoes.push(...licitacoes);
        console.log(`Encontradas ${licitacoes.length} licitações em ${portal.nome}`);
      } else {
        console.error(`Erro ao scrapear ${portal.nome}:`, scrapeResult.error);
      }
    } catch (error) {
      console.error(`Erro ao processar ${portal.nome}:`, error.message);
    }
  }

  // Se não encontrou nada, tentar busca direta no dados.gov.br
  if (todasLicitacoes.length === 0) {
    console.log('Nenhuma licitação encontrada nos portais. Tentando dados.gov.br...');
    try {
      const dadosGovLicitacoes = await buscarDadosGovBR(keywords);
      todasLicitacoes.push(...dadosGovLicitacoes);
    } catch (error) {
      console.error('Erro ao buscar em dados.gov.br:', error);
    }
  }

  // Retornar resultados
  res.status(200).json({ 
    success: true,
    count: todasLicitacoes.length,
    licitacoes: todasLicitacoes,
    timestamp: new Date().toISOString(),
    message: todasLicitacoes.length > 0 
      ? `Encontradas ${todasLicitacoes.length} licitações` 
      : 'Nenhuma licitação encontrada no momento'
  });
}

function extrairLicitacoesDoConteudo(conteudo, portal, keywords) {
  const licitacoes = [];
  
  if (!conteudo) return licitacoes;

  const conteudoLower = conteudo.toLowerCase();
  
  // Verificar se há palavras-chave de educação
  const temEducacao = keywords.some(keyword => 
    conteudoLower.includes(keyword.toLowerCase())
  );

  if (!temEducacao) {
    console.log(`${portal.nome}: Sem palavras-chave de educação`);
    return licitacoes;
  }

  // Padrões para identificar licitações
  const padroesLicitacao = [
    /pregão\s+(eletrônico|presencial)?\s*n[º.\s]+\s*(\d+)/gi,
    /concorrência\s+n[º.\s]+\s*(\d+)/gi,
    /dispensa\s+(de\s+licitação)?\s*n[º.\s]+\s*(\d+)/gi,
    /tomada\s+de\s+preços\s+n[º.\s]+\s*(\d+)/gi,
    /convite\s+n[º.\s]+\s*(\d+)/gi
  ];

  // Extrair informações
  for (const padrao of padroesLicitacao) {
    const matches = conteudo.match(padrao);
    if (matches) {
      for (const match of matches) {
        const titulo = match.trim();
        const valor = extrairValor(conteudo);
        const prazo = extrairPrazo(conteudo);
        const orgao = extrairOrgao(conteudo, portal.nome);
        
        licitacoes.push({
          id: Date.now() + Math.random(),
          title: titulo,
          organo: orgao,
          value: valor || 'Não informado',
          deadline: prazo || 'Não informado',
          relevance: calcularRelevancia(titulo, keywords),
          status: calcularStatus(prazo),
          url: portal.url,
          portal: portal.nome,
          description: `Licitação encontrada no portal ${portal.nome}`
        });
      }
    }
  }

  // Se não encontrou padrões específicos, tentar extrair links/títulos genéricos
  if (licitacoes.length === 0) {
    const linksLicitacao = conteudo.match(/https?:\/\/[^\s<>"']+licit[^\s<>"']*/gi) || [];
    
    if (linksLicitacao.length > 0) {
      licitacoes.push({
        id: Date.now(),
        title: `Licitação relacionada a educação - ${portal.nome}`,
        organo: portal.nome,
        value: 'Não informado',
        deadline: 'Não informado',
        relevance: 'medium',
        status: 'open',
        url: linksLicitacao[0],
        portal: portal.nome,
        description: 'Link de licitação encontrado'
      });
    }
  }

  return licitacoes;
}

async function buscarDadosGovBR(keywords) {
  const licitacoes = [];
  
  try {
    // Buscar no conjunto de dados de licitações
    const response = await fetch(
      'https://dados.gov.br/api/publico/conjuntos-dados/licitacoes-e-contratos',
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 10000
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      // Filtrar por educação
      if (data.resources) {
        for (const resource of data.resources) {
          const temEducacao = keywords.some(k => 
            (resource.title || '').toLowerCase().includes(k.toLowerCase()) ||
            (resource.description || '').toLowerCase().includes(k.toLowerCase())
          );
          
          if (temEducacao) {
            licitacoes.push({
              id: Date.now() + Math.random(),
              title: resource.title || 'Licitação - Dados Gov',
              organo: 'Governo Federal',
              value: 'Não informado',
              deadline: 'Não informado',
              relevance: 'high',
              status: 'open',
              url: resource.download_url || resource.access_url || 'https://dados.gov.br',
              portal: 'Dados.gov.br',
              description: resource.description || ''
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados.gov.br:', error);
  }

  return licitacoes;
}

function extrairValor(conteudo) {
  // Padrões para valores monetários
  const padroes = [
    /R\$\s*[\d.]+,\d+/i,
    /[\d.]+,\d+\s*(mil|milhão|bilhão)/i,
    /valor[:\s]+R\$\s*[\d.]+,\d+/i
  ];

  for (const padrao of padroes) {
    const match = conteudo.match(padrao);
    if (match) return match[0];
  }

  return null;
}

function extrairPrazo(conteudo) {
  // Padrões para datas
  const padroes = [
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /data[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i
  ];

  for (const padrao of padroes) {
    const match = conteudo.match(padrao);
    if (match) {
      if (match[1] && match[2] && match[3]) {
        // Formato DD/MM/AAAA
        if (match[1].length <= 2) {
          return `${match[1]}/${match[2]}/${match[3]}`;
        }
        // Formato AAAA-MM-DD
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
    }
  }

  return null;
}

function extrairOrgao(conteudo, portalNome) {
  // Tentar extrair nome do órgão
  const padroes = [
    /órgão[:\s]+([^\n,]+)/i,
    /secretaria\s+([^\n,]+)/i,
    /ministério\s+([^\n,]+)/i,
    /prefeitura\s+([^\n,]+)/i
  ];

  for (const padrao of padroes) {
    const match = conteudo.match(padrao);
    if (match) return match[1].trim();
  }

  return portalNome;
}

function calcularRelevancia(titulo, keywords) {
  const tituloLower = titulo.toLowerCase();
  const count = keywords.filter(k => tituloLower.includes(k.toLowerCase())).length;
  
  if (count >= 2) return 'high';
  if (count === 1) return 'medium';
  return 'low';
}

function calcularStatus(prazo) {
  if (!prazo || prazo === 'Não informado') return 'open';
  
  try {
    const partes = prazo.split('/');
    if (partes.length === 3) {
      const dataPrazo = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
      const hoje = new Date();
      const diasRestantes = Math.ceil((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes <= 0) return 'closed';
      if (diasRestantes <= 7) return 'urgent';
      if (diasRestantes <= 15) return 'closing';
      return 'open';
    }
  } catch (error) {
    console.error('Erro ao calcular status:', error);
  }
  
  return 'open';
}
