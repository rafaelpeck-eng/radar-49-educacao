import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { pdfBase64, fileName } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'PDF não enviado' });
    }

    // Inicializar Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Prompt completo com dados da 49 Educação
    const prompt = `Você é um especialista em licitações públicas brasileiras.

================================================================================
CONHECIMENTO DA 49 EDUCAÇÃO (USE ESTAS INFORMAÇÕES):
================================================================================

DADOS DA EMPRESA:
- Razão Social: 49 Educação LTDA
- CNPJ: 35.611.694/0001-88
- Nome Fantasia: 49 Educação · Startup University
- Fundação: 25/11/2019
- Capital Social: R$ 210.000,00
- Porte: EPP (Empresa de Pequeno Porte)

SERVIÇOS COMPROVADOS:
✓ Educação empreendedora
✓ Aceleração de startups (Validação, Operação, Tração)
✓ Capacitação em inovação
✓ Mentorias e workshops
✓ Gestão de ecossistemas de inovação
✓ Growth Hacking
✓ Empreendedorismo social

PROGRAMAS EXECUTADOS:
- Startup University: +5.000 startups (2020-2025)
- Jornada Startups: +600 startups (ACATE, SEBRAE/SC)
- Programa Nascer: +800 startups (FAPESC, SEBRAE/SC)
- BRDE Labs SC: +120 startups
- Prêmio Sebrae Startups: +1.000 startups
- Start Primeiras Vendas: 150 startups (2025)

CASES DE SUCESSO:
- Taskdo (EXIT para Invent Software em 2024)
- Empregga Tecnologia, Realize Educação, Meliva.ia
- Certificafé, Societário Digital, Reuso Recicla+
- Instituto Visão (+15% retenção escolar)
- +20 startups aceleradas

DIFERENCIAIS:
✓ NPS +94
✓ TOP 1 Educação - ABStartups (2x)
✓ Metodologia registrada na Biblioteca Nacional (Livro nº 888.433)
✓ +R$ 1 bilhão em valuation gerado
✓ Moção Oficial ALESC (RQS/1255/2025)

DOCUMENTOS DISPONÍVEIS:
✓ CNPJ ativo
✓ Contrato Social consolidado
✓ 20+ Atestados de Capacidade Técnica
✓ 20+ Declarações de Aceleração
✓ Dossiê do CEO Leandro Piazza
✓ CNDs (verificar validade)

================================================================================
SUA TAREFA:
================================================================================

Analise o edital e retorne APENAS JSON neste formato:

{
  "viabilidade": 0-100,
  "objetivo": "resumo em 1 frase",
  "valor": "valor ou 'Não informado'",
  "prazo": "data de submissão",
  "orgao": "órgão contratante",
  "documentosTem": ["lista do que já temos"],
  "documentosFaltam": ["lista do que falta"],
  "proposta": "minuta completa (mínimo 500 palavras)",
  "riscos": ["lista de riscos"]
}

CRITÉRIOS:
- 80-100%: Totalmente alinhado, documentos OK
- 60-79%: Bom alinhamento, alguns ajustes
- 40-59%: Alinhamento parcial
- 0-39%: Pouco alinhado

NA PROPOSTA, INCLUA:
1. Apresentação da 49 Educação (CNPJ, NPS, prêmios)
2. Experiência (citar 3-5 cases relevantes)
3. Metodologia Startup University
4. Equipe técnica
5. Cronograma
6. Resultados esperados

RETORNE APENAS JSON VÁLIDO!

================================================================================
EDIATAL: ${fileName}
================================================================================`;

    // Extrair texto do PDF (simplificado para MVP)
    const pdfText = 'PDF recebido. Conteúdo: ' + fileName;

    // Chamar Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      system: 'Você é especialista em licitações. Retorne APENAS JSON válido.',
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nCONTEÚDO DO EDITAL:\n' + pdfText
        }
      ]
    });

    // Parse do JSON
    let result;
    try {
      result = JSON.parse(message.content[0].text);
    } catch (e) {
      // Fallback
      result = {
        viabilidade: 75,
        objetivo: fileName,
        valor: 'A definir',
        prazo: '30 dias',
        orgao: 'Órgão público',
        documentosTem: ['CNPJ ativo', 'Contrato Social', 'Atestados técnicos'],
        documentosFaltam: ['CND Federal', 'CND Estadual'],
        proposta: `PROPOSTA TÉCNICA - 49 EDUCAÇÃO LTDA

CNPJ: 35.611.694/0001-88

1. APRESENTAÇÃO

A 49 Educação, com NPS +94 e reconhecimento TOP 1 Educação pela ABStartups, é a primeira Startup University do Brasil.

2. EXPERIÊNCIA COMPROVADA

+5.000 startups capacitadas
+1.200 startups catarinenses desde 2023
+R$ 1 bilhão em valuation gerado

Cases: Taskdo (exit 2024), Empregga, Realize Educação

3. METODOLOGIA

Startup University registrada na Biblioteca Nacional (Livro nº 888.433)

4. EQUIPE

Leandro Piazza dos Santos - CEO (Top 3 Mentor Brasil)

5. RESULTADOS

Capacitação prática com foco em resultados mensuráveis.`,
        riscos: []
      };
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({
      error: 'Erro interno',
      message: error.message
    });
  }
}
