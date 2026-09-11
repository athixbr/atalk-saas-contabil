import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import ClienteContato from "../../models/ClienteContato";
import ContatoDepartamento from "../../models/ContatoDepartamento";
import Departamento from "../../models/Departamento";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  clienteContatoId: number;
  departamentoIds: number[];
  companyId: number;
}

interface Response {
  departamentos: Departamento[];
}

const SetContatoDepartamentosService = async ({
  clienteId,
  clienteContatoId,
  departamentoIds,
  companyId,
}: Request): Promise<Response> => {
  const contato = await ClienteContato.findOne({
    where: { id: clienteContatoId, clienteId },
  });

  if (!contato) {
    throw new AppError("Contato não encontrado", 404);
  }

  const idsUnicos = Array.from(
    new Set((departamentoIds || []).map((id) => Number(id)))
  );

  if (idsUnicos.length > 0) {
    const departamentosExistentes = await Departamento.findAll({
      where: { id: idsUnicos, companyId },
      attributes: ["id"],
    });

    if (departamentosExistentes.length !== idsUnicos.length) {
      throw new AppError("Um ou mais departamentos não foram encontrados", 404);
    }
  }

  await ContatoDepartamento.destroy({
    where: {
      clienteContatoId,
      companyId,
      ...(idsUnicos.length > 0
        ? { departamentoId: { [Op.notIn]: idsUnicos } }
        : {}),
    },
  });

  const vinculosAtuais = await ContatoDepartamento.findAll({
    where: { clienteContatoId, companyId },
    attributes: ["departamentoId"],
  });

  const idsAtuais = new Set(vinculosAtuais.map((v) => v.departamentoId));
  const idsParaCriar = idsUnicos.filter((id) => !idsAtuais.has(id));

  for (const departamentoId of idsParaCriar) {
    await ContatoDepartamento.create({
      clienteContatoId,
      departamentoId,
      companyId,
    });
  }

  const vinculos = await ContatoDepartamento.findAll({
    where: { clienteContatoId, companyId },
    include: [
      {
        model: Departamento,
        as: "departamento",
        attributes: ["id", "nome"],
      },
    ],
    order: [[{ model: Departamento, as: "departamento" }, "nome", "ASC"]],
  });

  const departamentos = vinculos
    .map((vinculo) => vinculo.departamento)
    .filter(Boolean);

  return { departamentos };
};

export default SetContatoDepartamentosService;
