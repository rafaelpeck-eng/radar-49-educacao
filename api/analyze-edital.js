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

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Prompt com TODO o conhecimento da 49 Educação
    const prompt = `
Você é um especialista em licitações públicas brasileiras e vai analisar um edital para a empresa 49 Educação LTDA.

================================================================================
CONHECIMENTO COMPLETO DA 49 EDUCAÇÃO:
================================================================================

DADOS DA EMPRESA:
- Razão Social: 49 Educação LTDA
- CNPJ: 35.611.694/0001-88
- Nome Fantasia: 49 Educação · Startup University
- CEO: Leandro Piazza dos Santos (CPF 036.000.429-63)
- Fundação: 25/11/2019
- Capital Social: R$ 210.000,00
- Porte: EPP (Empresa de Pequeno Porte)
- Sede: Cocal do Sul/SC + Filial Florianópolis/SC

SERVIÇOS COMPROVADOS:
✓ Educação empreendedora
✓ Aceleração de startups (Validação, Operação, Tração e Escala)
✓ Capacitação profissional em inovação
✓ Mentorias individuais e coletivas
✓ Workshops de inteligência artificial
✓ Formação de founders
✓ Desenvolvimento de ecossistemas de startups
✓ Programas de inovação corporativa
✓ Eventos de empreendedorismo
✓ Growth Hacking (SEO/SEM, mídias sociais, funis)
✓ Empreendedorismo social
✓ Fundos de investimento e captação de recursos
✓ Treinamento em vendas para startups

PROGRAMAS EXECUTADOS:
| Programa | Startups | Parceiro | Período |
|----------|----------|----------|---------|
| Startup University | +5.000 | - | 2020-2025 |
| Jornada Startups | +600 | ACATE, SEBRAE/SC | 2022-2025 |
| Programa Nascer | +800 | FAPESC, SEBRAE/SC | 2020-2024 |
| BRDE Labs SC | +120 | BRDE, SEBRAE | 2023-2025 |
| Prêmio Sebrae Startups | +1.000 | SEBRAE Nacional | 2022-2024 |
| Start Primeiras Vendas | 150 | - | 2025 |

CASES DE SUCESSO (20+ EMPRESAS ACELERADAS):
- Taskdo (EXIT para Invent Software em 2024) ⭐
- Empregga Tecnologia (Validação + Fundos de Investimento)
- Realize Educação (Validação + Operação)
- Meliva.ia (Operação)
- Certificafé (Operação)
- Societário Digital (Operação)
- Reuso Recicla+ (Operação)
- Serodonto (Operação)
- ArchTechTour (Validação)
- Flash Menu (Operação)
- Gerencit (Operação)
- Captei (Operação)
- Ottimizza (Tração e Escala)
- Fifty Fifty Drinks (Gestão da Inovação)
- Éleme (Growth + Fundos de Investimento)
- Instituto Visão (Empreendedorismo Social - +15% retenção escolar)
- Prototipando a Quebrada (Empreendedorismo Social)
- Aleve Legaltech Ventures (Aceleradora de Empresas)

DIFERENCIAIS:
✓ NPS +94
✓ TOP 1 Educação — Associação Brasileira de Startups (2x)
✓ Metodologia Startup University registrada na Biblioteca Nacional (Livro nº 888.433)
✓ +R$ 1 bilhão em valuation gerado para startups
✓ Moção Oficial ALESC (RQS/1255/2025) - Primeira Startup University do Brasil
✓ Leandro Piazza: Top 3 Mentor de Startups no Brasil
✓ Reconhecimento na mídia: O Globo, Terra, Exame, Carta Capital, Poder 360

DOCUMENTOS DISPONÍVEIS PARA HABILITAÇÃO:
✓ CNPJ ativo
✓ Contrato Social consolidado (5 alterações)
✓ 20+ Atestados de Capacidade Técnica
✓ 20+ Declarações de Aceleração
✓ Dossiê completo do Leandro Piazza
✓ Certidões negativas (CNDs) - verificar validade
✓ Balanços/DRE - organizar

================================================================================
SUA TAREFA:
================================================================================

Analise o edital enviado e retorne APENAS JSON neste formato:

{
  "viabilidade": 0-100,
  "objetivo": "resumo do objeto em 1 frase",
  "valor": "valor estimado ou 'Não informado'",
  "prazo": "data de submissão ou 'Não informado'",
  "orgao": "órgão contratante",
  "documentosTem": ["lista de documentos que a 49 já tem e servem para este edital"],
  "documentosFaltam": ["lista de documentos que faltam ou precisam ser atualizados"],
  "proposta": "minuta completa de proposta técnica (mínimo 500 palavras, usando cases reais da 49 Educação)",
  "riscos": ["lista de riscos ou impedimentos identificados"]
}

CRITÉRIOS DE VIABILIDADE:
- 80-100%: Edital alinhado com serviços comprovados da 49, documentos disponíveis, prazo adequado
- 60-79%: Bom alinhamento, mas alguns documentos faltam ou prazo apertado
- 40-59%: Alinhamento parcial, necessidade de documentos novos ou parcerias
- 0-39%: Pouco alinhamento, muitos impedimentos

NA PROPOSTA TÉCNICA, INCLUA:
1. Apresentação da 49 Educação (usar dados reais: CNPJ, NPS, prêmios)
2. Experiência comprovada (citar 3-5 cases relevantes para o objeto do edital)
3. Metodologia Startup University (mencionar registro na Biblioteca Nacional)
4. Equipe técnica (Leandro Piazza + Ana Cláudia Plentz)
5. Cronograma de execução
6. Resultados esperados (usar métricas reais: +5.000 startups, +R$ 1 bi valuation)

IMPORTANTE:
- Use linguagem formal de proposta técnica
- Seja específico com números e casos reais
- Conecte o objeto do edital com serviços que a 49 já executou
- Não invente informações - use apenas dados reais fornecidos acima

================================================================================
EDIATAL PARA ANÁLISE:
================================================================================

${fileName}

[Conteúdo do PDF será extraído abaixo]
`;

    // Extrair texto do PDF (simplificado - em produção usar pdf-parse)
    const pdfText = await extractTextFromPDF(pdfBase64);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: 'Você é um especialista em licitações públicas brasileiras. Retorne APENAS JSON válido, sem texto antes ou depois.',
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nCONTEÚDO DO EDITAL:\n' + pdfText.substring(0, 50000)
        }
      ]
    });

    // Parse do JSON
    let result;
    try {
      result = JSON.parse(message.content[0].text);
    } catch (e) {
      // Fallback se não for JSON válido
      result = {
        viabilidade: 50,
        objetivo: 'Análise não pôde ser completada',
        valor: 'Não informado',
        prazo: 'Não informado',
        orgao: 'Não informado',
        documentosTem: ['CNPJ ativo', 'Contrato Social'],
        documentosFaltam: ['Análise completa do PDF falhou'],
        proposta: 'Não foi possível gerar a proposta. Tente novamente.',
        riscos: ['Erro na análise do PDF']
      };
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}

// Função simplificada para extrair texto do PDF
// Em produção, use a biblioteca 'pdf-parse'
async function extractTextFromPDF(base64) {
  // Para MVP, retornamos uma mensagem indicando que o PDF foi recebido
  // Em produção, implementar com pdf-parse ou similar
  return 'PDF recebido. Conteúdo será analisado pelo Claude.';
}
