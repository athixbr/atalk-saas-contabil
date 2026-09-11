import ClienteContato from "../../models/ClienteContato";
import ContatoAppAcesso from "../../models/ContatoAppAcesso";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  clienteContatoId: number;
  companyId: number;
  ativo: boolean;
  senha?: string;
}

interface Response {
  ativo: boolean;
  hasSenha: boolean;
}

const SetContatoAppAcessoService = async ({
  clienteId,
  clienteContatoId,
  companyId,
  ativo,
  senha,
}: Request): Promise<Response> => {
  const contato = await ClienteContato.findOne({
    where: { id: clienteContatoId, clienteId },
  });

  if (!contato) {
    throw new AppError("Contato não encontrado", 404);
  }

  let appAcesso = await ContatoAppAcesso.findOne({
    where: { clienteContatoId, companyId },
  });

  if (ativo && !senha && !(appAcesso && appAcesso.senhaHash)) {
    throw new AppError("Informe uma senha para ativar o acesso ao app", 400);
  }

  if (!appAcesso) {
    appAcesso = await ContatoAppAcesso.create({
      clienteContatoId,
      companyId,
      ativo,
      ...(senha ? { senha } : {}),
    });
  } else {
    await appAcesso.update({
      ativo,
      ...(senha ? { senha } : {}),
    });
  }

  return {
    ativo: appAcesso.ativo,
    hasSenha: !!appAcesso.senhaHash,
  };
};

export default SetContatoAppAcessoService;
