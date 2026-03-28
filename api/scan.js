export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { portais } = req.body || {};
    
    // Dados mockados com links diretos para os principais editais
    const licitacoesExemplo = [
      {
        id: 1,
        titulo: "EDITAL DE CHAMADA PÚBLICA FAPESC N.º 14/2026 - PROGRAMA MULHERES+TEC 5ª EDIÇÃO",
        orgao: "FAPESC - Fundação de Amparo à Pesquisa e Inovação do Estado de Santa Catarina",
        portal: "FAPESC",
        numero: "14/2026",
        modalidade: "Chamada Pública",
        dataAbertura: "18/03/2026",
        dataSubmissao: "30/04/2026",
        valor: "A definir",
        objeto: "Programa Mulheres+Tec 5ª Edição - Fomento à participação feminina em projetos de ciência, tecnologia e inovação em Santa Catarina",
        palavrasChave: ["mulheres", "tecnologia", "inovação", "ciência", "educação", "capacitação"],
        relevancia: "ALTA",
        justificativaRelevancia: "Este edital da FAPESC busca promover a participação feminina em tecnologia e inovação. A 49 Educação, com NPS +94 e reconhecimento TOP 1 Educação pela Associação Brasileira de Startups, possui vasta experiência em capacitação em inovação, tendo impactado +1.200 startups catarinenses desde 2023 através da metodologia Startup University. A empresa já executou programas similares como o Programa Nascer (800 startups) e Jornada Startups (600 startups) via FAPESC e SEBRAE/SC, demonstrando capacidade técnica para apoiar este chamamento com excelência.",
        link: "https://fapesc.sc.gov.br/chamadas-abertas/edital-de-chamada-publica-fapesc-n-14-2026-programa-mulheres-tec-5a-edicao/",
        status: "ABERTO",
        diasRestantes: 25
      },
      {
        id: 2,
        titulo: "EDITAL N.º 12/2026 - PROGRAMA CENTELHA 3 – SC",
        orgao: "FAPESC / Programa Nacional de Apoio à Geração de Empreendimentos Inovadores",
        portal: "FAPESC",
        numero: "12/2026",
        modalidade: "Chamada Pública",
        dataAbertura: "16/03/2026",
        dataSubmissao: "15/05/2026",
        valor: "A definir",
        objeto: "Programa Centelha 3 SC - Apoio à geração de empreendimentos inovadores, capacitação de empreendedores e desenvolvimento de ideias de negócio inovadoras em Santa Catarina",
        palavrasChave: ["empreendedorismo", "inovação", "startups", "capacitação", "ideias de negócio"],
        relevancia: "ALTA",
        justificativaRelevancia: "Programa Centelha é focado em pré-incubação e capacitação de empreendedores - core business da 49 Educação. A empresa criou a primeira Startup University do Brasil e já capacitou +5.000 startups através da metodologia Startup University, registrada na Biblioteca Nacional (Livro nº 888.433). Com cases comprovados como Taskdo (exit em 2024) e +R$ 1 bilhão em valuation gerado, a 49 Educação possui expertise em programas de pré-incubação, tendo executado o Programa Nascer em 15 cidades catarinenses (800 startups impactadas).",
        link: "https://fapesc.sc.gov.br/chamadas-abertas/edital-n-12-2026-programa-centelha-3-sc/",
        status: "ABERTO",
        diasRestantes: 40
      },
      {
        id: 3,
        titulo: "EDITAL DE CHAMADA PÚBLICA FAPESC N.º 11/2026 - CREDENCIAMENTO DE NÚCLEOS DE INOVAÇÃO TECNOLÓGICA",
        orgao: "FAPESC",
        portal: "FAPESC",
        numero: "11/2026",
        modalidade: "Credenciamento",
        dataAbertura: "10/03/2026",
        dataSubmissao: "31/12/2026",
        valor: "A definir",
        objeto: "Credenciamento e Recredenciamento de Núcleos de Inovação Tecnológica de Santa Catarina - NITs",
        palavrasChave: ["inovação", "tecnologia", "gestão", "ecossistema", "capacitação"],
        relevancia: "ALTA",
        justificativaRelevancia: "Este edital busca credenciar núcleos de inovação tecnológica. A 49 Educação possui vasta experiência em gestão de ecossistemas de inovação, tendo executado 1.200 horas de consultoria para o Sebrae SC em Gestão de Ecossistemas de Inovação e Plataformas Digitais (2023). A empresa também desenvolveu a plataforma Nascer Digital e possui CRM educacional integrado, demonstrando capacidade técnica para operar NITs e fortalecer o ecossistema catarinense de inovação.",
        link: "https://fapesc.sc.gov.br/chamadas-abertas/edital-de-chamada-publica-fapesc-n-11-2026-credenciamento-e-recredenciamento-de-nucleos-de-inovacao-tecnologica-de-santa-catarina/",
        status: "ABERTO",
        diasRestantes: 260
      },
      {
        id: 4,
        titulo: "Pregão Eletrônico - Capacitação em Empreendedorismo para Startups",
        orgao: "SEBRAE/SC",
        portal: "SEBRAE",
        numero: "08/2025",
        modalidade: "Pregão Eletrônico",
        dataAbertura: "01/04/2025",
        dataSubmissao: "15/04/2025",
        valor: "R$ 129.000,00",
        objeto: "Contratação de empresa especializada para prestação de serviços de treinamento em vendas para startups, com foco em receitas previsíveis, estruturação de processos comerciais e growth hacking",
        palavrasChave: ["vendas", "startups", "treinamento", "growth", "capacitação"],
        relevancia: "ALTA",
        justificativaRelevancia: "Este edital do SEBRAE busca empresa especializada em treinamento de vendas para startups. A 49 Educação executou o programa Start Primeiras Vendas 2025/2026 para 150 startups e o programa Jornada Startups para +600 startups via ACATE. A empresa aplica metodologias de SPIN Selling, BANT, Growth Hacking e Playbook de Vendas, com resultados comprovados de aumento de faturamento nas startups atendidas. Leandro Piazza, CEO, é considerado Top 3 Mentor de Startups no Brasil.",
        link: "https://www.scf3.sebrae.com.br/PortalCf/Licitacoes",
        status: "ENCERRANDO",
        diasRestantes: 5
      },
      {
        id: 5,
        titulo: "Licitação - Programa de Aceleração de Startups Industriais",
        orgao: "FIESC",
        portal: "FIESC",
        numero: "05/2025",
        modalidade: "Chamamento Público",
        dataAbertura: "20/03/2025",
        dataSubmissao: "10/04/2025",
        valor: "R$ 200.000,00",
        objeto: "Seleção de organização para implementação de programa de aceleração de startups industriais de base tecnológica em Santa Catarina",
        palavrasChave: ["aceleração", "startups", "indústria", "tecnologia", "inovação"],
        relevancia: "ALTA",
        justificativaRelevancia: "Chamamento para aceleração de startups industriais se alinha perfeitamente com a expertise da 49 Educação. A empresa já acelerou empresas como Empregga Tecnologia, Realize Educação, Meliva.ia e outras 20+ startups nas fases de Validação, Operação e Tração. Com metodologia Startup University registrada na Biblioteca Nacional e +5.000 startups capacitadas, a empresa está apta a atender este chamamento com excelência.",
        link: "https://portaldecompras.fiesc.com.br/Portal/Mural.aspx",
        status: "ABERTO",
        diasRestantes: 18
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
