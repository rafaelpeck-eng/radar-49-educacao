export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Dados de exemplo para teste
    const licitacoesExemplo = [
      {
        id: 1,
        titulo: "Pregão Eletrônico nº 49/2025 - Capacitação em Empreendedorismo",
        orgao: "Secretaria Municipal de Educação",
        portal: "PNCP",
        numero: "49/2025",
        modalidade: "Pregão Eletrônico",
        dataAbertura: "15/04/2025",
        dataSubmissao: "30/04/2025",
        valor: "R$ 150.000,00",
        objeto: "Contratação de empresa especializada para realização de cursos de capacitação em empreendedorismo e inovação para jovens e adultos do município.",
        palavrasChave: ["empreendedorismo", "capacitação", "inovação", "educação"],
        relevancia: "ALTA",
        justificativaRelevancia: "Este pregão busca empresa especializada em capacitação empreendedora. A 49 Educação, com NPS +94 e reconhecimento TOP 1 Educação pela Associação Brasileira de Startups, possui experiência comprovada em educação empreendedora e aceleração de startups.",
        link: "https://pncp.gov.br",
        status: "ABERTO",
        diasRestantes: 15
      },
      {
        id: 2,
        titulo: "Chamamento Público nº 12/2025 - Programa de Aceleração de Startups",
        orgao: "Agência de Inovação de SC",
        portal: "FAPESC",
        numero: "12/2025",
        modalidade: "Chamamento Público",
        dataAbertura: "01/04/2025",
        dataSubmissao: "10/04/2025",
        valor: "R$ 200.000,00",
        objeto: "Seleção de organização da sociedade civil para implementação de programa de aceleração de startups de base tecnológica no estado de Santa Catarina.",
        palavrasChave: ["aceleração", "startups", "inovação", "tecnologia"],
        relevancia: "ALTA",
        justificativaRelevancia: "Chamamento público para aceleração de startups se alinha perfeitamente com o core business da 49 Educação (Startup University). A empresa já acelerou +1.200 startups catarinenses desde 2023.",
        link: "https://fapesc.sc.gov.br",
        status: "ENCERRANDO",
        diasRestantes: 5
      }
    ];

    return res.status(200).json({
      licitacoes: licitacoesExemplo,
      resumo: `${licitacoesExemplo.length} licitações encontradas`
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
