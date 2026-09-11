import ClienteContato from "../../models/ClienteContato";
import ContatoAppAcesso from "../../models/ContatoAppAcesso";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  clienteContatoId: number;
  companyId: number;
}

interface Response {
  ativo: boolean;
  hasSenha: boolean;
}

const GetContatoAppAcessoService = async ({
  clienteId,
  clienteContatoId,
  companyId,
}: Request): Promise<Response> => {
  const contato = await ClienteContato.findOne({
    where: { id: clienteContatoId, clienteId },
  });

  if (!contato) {
    throw new AppError("Contato não encontrado", 404);
  }

  const appAcesso = await ContatoAppAcesso.findOne({
    where: { clienteContatoId, companyId },
  });

  if (!appAcesso) {
    return { ativo: false, hasSenha: false };
  }

  return {
    ativo: appAcesso.ativo,
    hasSenha: !!appAcesso.senhaHash,
  };
};

export default GetContatoAppAcessoService;
