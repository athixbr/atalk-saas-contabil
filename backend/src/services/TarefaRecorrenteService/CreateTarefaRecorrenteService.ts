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
  nomeTarefa: string;
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
  companyId: number;
  userId: number;
}

const CreateTarefaRecorrenteService = async (
  data: TarefaRecorrenteData
): Promise<TarefaRecorrente> => {
  const {
    clientesIds = [],
    sociosIds = [],
    usuariosIds = [],
    companyId,
    userId,
    ...tarefaData
  } = data;

  // Código agora é exibido a partir do ID auto-incremental e não é persistido pelo formulário.
  delete tarefaData.codigo;

  // Classificação: obrigatória, formato 00.00.00
  if (!tarefaData.classificacao || !/^\d{2}\.\d{2}\.\d{2}$/.test(tarefaData.classificacao)) {
    throw new AppError("ERR_CLASSIFICACAO_INVALIDA: Classificação é obrigatória no formato 00.00.00", 400);
  }

  // Entregas Mensais: cada mês deve ter um dia válido no calendário, "ultimo", "nao_tem" ou vazio
  validateEntregasMensais(tarefaData.entregasMensais);

  // Prazos e Configurações: campos numéricos limitados a 4 dígitos
  validateDiasField(tarefaData.diasAntecipacao, "diasAntecipacao");
  validateDiasField(tarefaData.diasInicio, "diasInicio");
  validateDiasField(tarefaData.diasConclusao, "diasConclusao");
  validateCompetenciaValor(tarefaData.competencia);
  tarefaData.prazosFixos = normalizePrazosFixos(tarefaData.prazosFixos) as string;
  validatePrazosFixos(tarefaData.prazosFixos);

  // Validar departamentoId se fornecido
  if (tarefaData.departamentoId) {
    const departamentoExists = await Departamento.findByPk(tarefaData.departamentoId);
    if (!departamentoExists) {
      throw new AppError("ERR_DEPARTAMENTO_NOT_FOUND", 404);
    }
  }

  // Se não informou usuário responsável mas informou departamento, buscar coordenador
  let usuarioResponsavelId = data.usuarioResponsavelId;
  if (!usuarioResponsavelId && tarefaData.departamentoId) {
    const coordenador = await DepartamentoUsuario.findOne({
      where: {
        departamentoId: tarefaData.departamentoId,
        isCoordenador: true
      }
    });
    
    if (coordenador) {
      usuarioResponsavelId = coordenador.userId;
    }
  }

  // Campos booleanos que podem vir como strings "sim"/"nao"
  const booleanFields = [
    'sabadoUtil', 'exigirRobo', 'passivelMulta', 'alertaGuia',
    'checklistObrigatorio', 'notificarCliente', 'servicoLiberado',
    'baixarAutomatico'
  ];

  // Limpar campos vazios, converter booleanos e tratar ENUMs
  const cleanData = Object.entries(tarefaData).reduce((acc, [key, value]) => {
    // "ativa" nunca deve virar null: ausência/valor vazio omite a chave
    // (deixando o defaultValue: true do schema atuar), nunca grava NULL
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
      return acc;
    }
    // Continuar com a lógica existente para outros campos
    // Se for string vazia em campos ENUM, converter para null
    if (value === "" && (key === "esfera")) {
      acc[key] = null;
    } 
    else if (key === "tipoTarefa") {
      acc[key] = value || "recorrente";
    }
    // Se for departamentoId vazio ou inválido, converter para null
    else if (key === "departamentoId" && (!value || value === "")) {
      acc[key] = null;
    }
    // Se for string vazia em outros campos opcionais, não incluir
    else if (value !== "" && value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  // Criar a tarefa recorrente
  const tarefaRecorrente = await TarefaRecorrente.create({
    tipoTarefa: "recorrente",
    ...cleanData,
    usuarioResponsavelId,
    companyId,
    createdBy: userId,
    updatedBy: userId
  });

  // Vincular clientes
  if (clientesIds.length > 0) {
    const clientesVinculos = clientesIds.map((cliente: any) => ({
      tarefaRecorrenteId: tarefaRecorrente.id,
      clienteId: typeof cliente === "object" ? cliente.clienteId || cliente.id : cliente,
      vencimento: typeof cliente === "object" ? cliente.vencimento || null : null,
      controleComDataId: typeof cliente === "object" ? cliente.controleComDataId || null : null
    })).filter(vinculo => vinculo.clienteId);
    await TarefaRecorrenteCliente.bulkCreate(clientesVinculos);
  }

  // Vincular sócios
  if (sociosIds.length > 0) {
    const sociosVinculos = sociosIds.map(socioId => ({
      tarefaRecorrenteId: tarefaRecorrente.id,
      socioId
    }));
    await TarefaRecorrenteSocio.bulkCreate(sociosVinculos);
  }

  // Vincular usuários
  if (usuariosIds.length > 0) {
    const usuariosVinculos = usuariosIds.map(userId => ({
      tarefaRecorrenteId: tarefaRecorrente.id,
      userId
    }));
    await TarefaRecorrenteUsuario.bulkCreate(usuariosVinculos);
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

export default CreateTarefaRecorrenteService;
