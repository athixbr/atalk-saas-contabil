import TarefaRecorrente from "../../models/TarefaRecorrente";
import TarefaRecorrenteCliente from "../../models/TarefaRecorrenteCliente";
import TarefaRecorrenteSocio from "../../models/TarefaRecorrenteSocio";
import TarefaRecorrenteUsuario from "../../models/TarefaRecorrenteUsuario";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteTarefaRecorrenteService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const tarefaRecorrente = await TarefaRecorrente.findOne({
    where: { id, companyId }
  });

  if (!tarefaRecorrente) {
    throw new AppError("ERR_TAREFA_RECORRENTE_NOT_FOUND", 404);
  }

  // Deletar vínculos
  await TarefaRecorrenteCliente.destroy({
    where: { tarefaRecorrenteId: id }
  });

  await TarefaRecorrenteSocio.destroy({
    where: { tarefaRecorrenteId: id }
  });

  await TarefaRecorrenteUsuario.destroy({
    where: { tarefaRecorrenteId: id }
  });

  // Deletar tarefa
  await tarefaRecorrente.destroy();
};

export default DeleteTarefaRecorrenteService;
