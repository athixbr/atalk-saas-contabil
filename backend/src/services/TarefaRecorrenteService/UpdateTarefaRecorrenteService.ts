import TarefaRecorrente from "../../models/TarefaRecorrente";
import TarefaRecorrenteCliente from "../../models/TarefaRecorrenteCliente";
import TarefaRecorrenteSocio from "../../models/TarefaRecorrenteSocio";
import TarefaRecorrenteUsuario from "../../models/TarefaRecorrenteUsuario";
import Cliente from "../../models/Cliente";
import Socio from "../../models/Socio";
import Departamento from "../../models/Departamento";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import {
  validateEntregasMensais,
  validateDiasField,
  validateCompetenciaValor,
  validatePrazosFixos,
  normalizePrazosFixos
} from "./validateTarefaRecorrenteFields";

interface TarefaRecorrenteData {
  codigo?: string;
  classificacao?: string;
  mininome?: string;
  nomeTarefa?: string;
  tipoTarefa?: string;
  departamentoId?: number;
  entregasMensais?: object;
  diasAntecipacao?: number;
  diasInicio?: number;
  diasConclusao?: number;
  tipoDiasAntes?: string;
  prazosFixos?: string;
  sabadoUtil?: boolean;
  competencia?: string;
  competenciaTipo?: string;
  exigirRobo?: boolean;
  passivelMulta?: boolean;
  alertaGuia?: boolean;
  checklistObrigatorio?: boolean;
  prazoEntregaDias?: number;
  prazoEntregaHoras?: number;
  esfera?: string;
  notificarCliente?: boolean;
  servicoLiberado?: boolean;
  baixarAutomatico?: boolean;
  exigeAgendamento?: boolean;
  habilitarDeclaracao?: boolean;
  notificaVencimento?: boolean;
  parecerAutomatico?: boolean;
  recorrente?: boolean;
  requerAnexo?: boolean;
  requerCampoProcesso?: boolean;
  responderProtocolo?: boolean;
  ativa?: boolean;
  retencaoMeses?: number;
  prazoMinimoRealizacao?: number;
  semVencimento?: boolean;
  faseConfig?: object;
  checklistId?: number;
  canaisNotificacao?: string[];
  valor?: number;
  clientesIds?: Array<number | { id?: number; clienteId?: number; vencimento?: string; controleComDataId?: number }>;
  sociosIds?: number[];
  usuariosIds?: number[];
  usuarioResponsavelId?: number;
}

interface Request {
  id: string | number;
  companyId: number;
  userId: number;
  data: TarefaRecorrenteData;
}

const UpdateTarefaRecorrenteService = async ({
  id,
  companyId,
  userId,
  data
}: Request): Promise<TarefaRecorrente> => {
  const tarefaRecorrente = await TarefaRecorrente.findOne({
    where: { id, companyId }
  });

  if (!tarefaRecorrente) {
    throw new AppError("ERR_TAREFA_RECORRENTE_NOT_FOUND", 404);
  }

  const { clientesIds, sociosIds, usuariosIds, usuarioResponsavelId, ...updateData } = data;

  // Código agora é exibido a partir do ID auto-incremental e não é alterado pelo formulário.
  delete updateData.codigo;

  // Classificação: quando informada, formato 00.00.00
  if (updateData.classificacao !== undefined && !/^\d{2}\.\d{2}\.\d{2}$/.test(updateData.classificacao)) {
    throw new AppError("ERR_CLASSIFICACAO_INVALIDA: Classificação deve estar no formato 00.00.00", 400);
  }

  // Entregas Mensais: cada mês deve ter um dia válido no calendário, "ultimo", "nao_tem" ou vazio
  validateEntregasMensais(updateData.entregasMensais);

  // Prazos e Configurações: campos numéricos limitados a 4 dígitos
  validateDiasField(updateData.diasAntecipacao, "diasAntecipacao");
  validateDiasField(updateData.diasInicio, "diasInicio");
  validateDiasField(updateData.diasConclusao, "diasConclusao");
  validateCompetenciaValor(updateData.competencia);
  updateData.prazosFixos = normalizePrazosFixos(updateData.prazosFixos) as string;
  validatePrazosFixos(updateData.prazosFixos);

  // Se não informou usuário responsável mas informou departamento, buscar coordenador
  let finalUsuarioResponsavelId = usuarioResponsavelId;
  if (finalUsuarioResponsavelId === undefined && updateData.departamentoId) {
    const coordenador = await DepartamentoUsuario.findOne({
      where: {
        departamentoId: updateData.departamentoId,
        isCoordenador: true
      }
    });
    
    if (coordenador) {
      finalUsuarioResponsavelId = coordenador.userId;
    }
  }

  // Campos booleanos que podem vir como strings "sim"/"nao"
  const booleanFields = [
    'sabadoUtil', 'exigirRobo', 'passivelMulta', 'alertaGuia',
    'checklistObrigatorio', 'notificarCliente', 'servicoLiberado',
    'baixarAutomatico'
  ];

  // Limpar campos vazios, converter booleanos e tratar ENUMs
  const cleanData = Object.entries(updateData).reduce((acc, [key, value]) => {
    // "ativa" nunca deve virar null: se vier vazio, a chave é omitida
    // (mantém o valor atual em vez de apagar o status), nunca grava NULL
    // explícito, senão a tarefa fica de fora da geração automática
    // (GenerateTarefasRecorrentesService filtra where: { ativa: true }).
    if (key === 'ativa') {
      if (value === "nao" || value === false) {
        acc[key] = false;
      } else if (value === "sim" || value === true) {
        acc[key] = true;
      }
      return acc;
    }
    // Converter strings "sim"/"nao" para boolean
    if (booleanFields.includes(key)) {
      if (value === "sim" || value === true) {
        acc[key] = true;
      } else if (value === "nao" || value === false) {
        acc[key] = false;
      } else if (value === "" || value === null || value === undefined) {
        acc[key] = null;
      }
    }
    // Se for string vazia em campos ENUM, converter para null
    else if (value === "" && (key === "esfera")) {
      acc[key] = null;
    } 
    else if (key === "tipoTarefa") {
      acc[key] = value || "recorrente";
    }
    // Se for string vazia em outros campos opcionais, não incluir
    else if (value !== "" && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  // Atualizar dados da tarefa
  await tarefaRecorrente.update({
    ...cleanData,
    ...(finalUsuarioResponsavelId !== undefined && { usuarioResponsavelId: finalUsuarioResponsavelId }),
    updatedBy: userId
  });

  // Atualizar vínculos de clientes
  if (clientesIds !== undefined) {
    await TarefaRecorrenteCliente.destroy({
      where: { tarefaRecorrenteId: id }
    });

    if (clientesIds.length > 0) {
      const clientesVinculos = clientesIds.map((cliente: any) => ({
        tarefaRecorrenteId: Number(id),
        clienteId: typeof cliente === "object" ? cliente.clienteId || cliente.id : cliente,
        vencimento: typeof cliente === "object" ? cliente.vencimento || null : null,
        controleComDataId: typeof cliente === "object" ? cliente.controleComDataId || null : null
      })).filter(vinculo => vinculo.clienteId);
      await TarefaRecorrenteCliente.bulkCreate(clientesVinculos);
    }
  }

  // Atualizar vínculos de sócios
  if (sociosIds !== undefined) {
    await TarefaRecorrenteSocio.destroy({
      where: { tarefaRecorrenteId: id }
    });

    if (sociosIds.length > 0) {
      const sociosVinculos = sociosIds.map(socioId => ({
        tarefaRecorrenteId: Number(id),
        socioId
      }));
      await TarefaRecorrenteSocio.bulkCreate(sociosVinculos);
    }
  }

  // Atualizar vínculos de usuários
  if (usuariosIds !== undefined) {
    await TarefaRecorrenteUsuario.destroy({
      where: { tarefaRecorrenteId: id }
    });

    if (usuariosIds.length > 0) {
      const usuariosVinculos = usuariosIds.map(userId => ({
        tarefaRecorrenteId: Number(id),
        userId
      }));
      await TarefaRecorrenteUsuario.bulkCreate(usuariosVinculos);
    }
  }

  // Recarregar com associações
  await tarefaRecorrente.reload({
    include: [
      { model: Departamento, as: "departamento" },
      { model: User, as: "usuarioResponsavel", attributes: ["id", "name", "email"] },
      { model: Cliente, as: "clientes" },
      { model: Socio, as: "socios" },
      { model: User, as: "usuarios" }
    ]
  });
  tarefaRecorrente.setDataValue("codigo", String(tarefaRecorrente.id));

  return tarefaRecorrente;
};

export default UpdateTarefaRecorrenteService;
