export default async function handler(req, res) {
  // Permitir apenas método GET e POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Dados mockados para teste (você pode substituir por scraping real depois)
    const licitacoesMock = [
      {
        id: "1",
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
        justificativaRelevancia: "Este pregão busca empresa especializada em capacitação empreendedora. A 49 Educação, com NPS +94 e reconhecimento TOP 1 Educação pela Associação Brasileira de Startups, possui expertise comprovada em educação empreendedora e aceleração de startups, estando perfeitamente apta a atender este chamamento.",
        link: "https://pncp.gov.br",
        status: "ABERTO"
      },
      {
        id: "2",
        titulo: "Chamamento Público nº 12/2025 - Programa de Aceleração de Startups",
        orgao: "Agência de Inovação de SC",
        portal: "Portal SC",
        numero: "12/2025",
        modalidade: "Chamamento Público",
        dataAbertura: "01/04/2025",
        dataSubmissao: "10/04/2025",
        valor: "R$ 200.000,00",
        objeto: "Seleção de organização da sociedade civil para implementação de programa de aceleração de startups de base tecnológica no estado de Santa Catarina.",
        palavrasChave: ["aceleração", "startups", "inovação", "tecnologia"],
        relevancia: "ALTA",
        justificativaRelevancia: "Chamamento público para aceleração de startups se alinha perfeitamente com o core business da 49 Educação (Startup University), que já executou diversos programas de aceleração reconhecidos nacionalmente.",
        link: "https://licitacoes.sc.gov.br",
        status: "ENCERRANDO"
      }
    ];

    // Retornar dados
    return res.status(200).json({
      licitacoes: licitacoesMock,
      resumo: `Encontradas ${licitacoesMock.length} licitações abertas relevantes para a 49 Educação`
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
