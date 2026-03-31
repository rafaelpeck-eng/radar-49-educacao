export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Resposta simplificada para teste
  res.status(200).json({
    viabilidade: 85,
    objetivo: "Teste de API funcionando",
    valor: "R$ 100.000,00",
    prazo: "30/04/2026",
    orgao: "Órgão de teste",
    documentosTem: ["CNPJ ativo", "Contrato Social"],
    documentosFaltam: ["CND Federal"],
    proposta: "Proposta de teste - API funcionando!",
    riscos: []
  });
}
