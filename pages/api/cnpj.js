import initMiddleware from "../../lib/init-middleware";
import Cors from "cors";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "OPTIONS"],
    preflightContinue: true,
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { cnpj } = req.query;
  const normalizedCnpj = typeof cnpj === "string"
    ? cnpj.replace(/[^a-z\d]/gi, "").toUpperCase()
    : "";

  if (!/^[A-Z\d]{14}$/.test(normalizedCnpj)) {
    return res.status(400).json({ error: "Informe um CNPJ válido com 14 caracteres." });
  }

  try {
    const upstreamResponse = await fetch(
      `https://www.receitaws.com.br/v1/cnpj/${normalizedCnpj}`,
      { headers: { Accept: "application/json" } }
    );
    const data = await upstreamResponse.json().catch(() => null);

    if (!upstreamResponse.ok || data?.status === "ERROR") {
      return res.status(502).json({
        error: "A ReceitaWS não conseguiu concluir a consulta.",
        upstreamStatus: upstreamResponse.status,
        details: data?.message || "Resposta inválida do provedor.",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      error: "Não foi possível conectar à ReceitaWS.",
      details: error.message,
    });
  }
}
