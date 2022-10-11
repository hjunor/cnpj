import initMiddleware from "../../lib/init-middleware";
import Cors from "cors";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "OPTIONS", "PUT"],
  })
);

export default async function handler(req, res) {
  const { cnpj } = req.query;

  await cors(req, res);

  fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      if (result.ok) {
        return result.json();
      } else {
        return res.status(500).json({ error: "Erro recebido do RECEITAWS." });
      }
    })
    .then((result) => {
      res.status(200).json(result);
    });
}
