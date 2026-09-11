import express from "express";
import isAuth from "../middleware/isAuth";
import * as ParametrosController from "../controllers/ParametrosController";

const parametrosRoutes = express.Router();

// ========== ROTAS DE STATUS ==========
parametrosRoutes.get("/parametros/status", isAuth, ParametrosController.listStatus);
parametrosRoutes.post("/parametros/status", isAuth, ParametrosController.createStatus);
parametrosRoutes.put("/parametros/status/:id", isAuth, ParametrosController.updateStatus);
parametrosRoutes.delete("/parametros/status/:id", isAuth, ParametrosController.deleteStatus);

// ========== ROTAS DE PRAZOS ==========
parametrosRoutes.get("/parametros/prazos", isAuth, ParametrosController.listPrazos);
parametrosRoutes.post("/parametros/prazos", isAuth, ParametrosController.createPrazo);
parametrosRoutes.put("/parametros/prazos/:id", isAuth, ParametrosController.updatePrazo);
parametrosRoutes.delete("/parametros/prazos/:id", isAuth, ParametrosController.deletePrazo);

// ========== ROTAS DE PRIORIDADES ==========
parametrosRoutes.get("/parametros/prioridades", isAuth, ParametrosController.listPrioridades);
parametrosRoutes.post("/parametros/prioridades", isAuth, ParametrosController.createPrioridade);
parametrosRoutes.put("/parametros/prioridades/:id", isAuth, ParametrosController.updatePrioridade);
parametrosRoutes.delete("/parametros/prioridades/:id", isAuth, ParametrosController.deletePrioridade);

// ========== ROTAS DE STATUS COMPLEMENTAR ==========
parametrosRoutes.get("/parametros/statuscomplementar", isAuth, ParametrosController.listStatusComplementar);
parametrosRoutes.post("/parametros/statuscomplementar", isAuth, ParametrosController.createStatusComplementar);
parametrosRoutes.put("/parametros/statuscomplementar/:id", isAuth, ParametrosController.updateStatusComplementar);
parametrosRoutes.delete("/parametros/statuscomplementar/:id", isAuth, ParametrosController.deleteStatusComplementar);

// ========== ROTAS DE SEGMENTO ==========
parametrosRoutes.get("/parametros/segmento", isAuth, ParametrosController.listSegmento);
parametrosRoutes.post("/parametros/segmento", isAuth, ParametrosController.createSegmento);
parametrosRoutes.put("/parametros/segmento/:id", isAuth, ParametrosController.updateSegmento);
parametrosRoutes.delete("/parametros/segmento/:id", isAuth, ParametrosController.deleteSegmento);

// ========== ROTAS DE ATUAÇÃO ==========
parametrosRoutes.get("/parametros/atuacao", isAuth, ParametrosController.listAtuacao);
parametrosRoutes.post("/parametros/atuacao", isAuth, ParametrosController.createAtuacao);
parametrosRoutes.put("/parametros/atuacao/:id", isAuth, ParametrosController.updateAtuacao);
parametrosRoutes.delete("/parametros/atuacao/:id", isAuth, ParametrosController.deleteAtuacao);

// ========== ROTAS DE SEDE CLIENTE ==========
parametrosRoutes.get("/parametros/sedecliente", isAuth, ParametrosController.listSedeCliente);
parametrosRoutes.post("/parametros/sedecliente", isAuth, ParametrosController.createSedeCliente);
parametrosRoutes.put("/parametros/sedecliente/:id", isAuth, ParametrosController.updateSedeCliente);
parametrosRoutes.delete("/parametros/sedecliente/:id", isAuth, ParametrosController.deleteSedeCliente);

// ========== ROTAS DE REGIME TRIBUTARIO FEDERAL ==========
parametrosRoutes.get("/parametros/regimetributariofederal", isAuth, ParametrosController.listRegimeTributarioFederal);
parametrosRoutes.post("/parametros/regimetributariofederal", isAuth, ParametrosController.createRegimeTributarioFederal);
parametrosRoutes.put("/parametros/regimetributariofederal/:id", isAuth, ParametrosController.updateRegimeTributarioFederal);
parametrosRoutes.delete("/parametros/regimetributariofederal/:id", isAuth, ParametrosController.deleteRegimeTributarioFederal);

// ========== ROTAS DE MODALIDADE FECHAMENTO CONTABIL ==========
parametrosRoutes.get("/parametros/modalidadefechamentocontabil", isAuth, ParametrosController.listModalidadeFechamentoContabil);
parametrosRoutes.post("/parametros/modalidadefechamentocontabil", isAuth, ParametrosController.createModalidadeFechamentoContabil);
parametrosRoutes.put("/parametros/modalidadefechamentocontabil/:id", isAuth, ParametrosController.updateModalidadeFechamentoContabil);
parametrosRoutes.delete("/parametros/modalidadefechamentocontabil/:id", isAuth, ParametrosController.deleteModalidadeFechamentoContabil);

// ========== ROTAS DE DISTRIBUICAO LUCROS ==========
parametrosRoutes.get("/parametros/distribuicaolucros", isAuth, ParametrosController.listDistribuicaoLucros);
parametrosRoutes.post("/parametros/distribuicaolucros", isAuth, ParametrosController.createDistribuicaoLucros);
parametrosRoutes.put("/parametros/distribuicaolucros/:id", isAuth, ParametrosController.updateDistribuicaoLucros);
parametrosRoutes.delete("/parametros/distribuicaolucros/:id", isAuth, ParametrosController.deleteDistribuicaoLucros);

// ========== ROTAS DE SERVICOS EXTRAORDINARIOS ==========
parametrosRoutes.get("/parametros/servicosextraordinarios", isAuth, ParametrosController.listServicosExtraordinarios);
parametrosRoutes.post("/parametros/servicosextraordinarios", isAuth, ParametrosController.createServicosExtraordinarios);
parametrosRoutes.put("/parametros/servicosextraordinarios/:id", isAuth, ParametrosController.updateServicosExtraordinarios);
parametrosRoutes.delete("/parametros/servicosextraordinarios/:id", isAuth, ParametrosController.deleteServicosExtraordinarios);

// ========== ROTAS DE GRUPO CLIENTE ==========
parametrosRoutes.get("/parametros/grupocliente", isAuth, ParametrosController.listGrupoCliente);
parametrosRoutes.post("/parametros/grupocliente", isAuth, ParametrosController.createGrupoCliente);
parametrosRoutes.put("/parametros/grupocliente/:id", isAuth, ParametrosController.updateGrupoCliente);
parametrosRoutes.delete("/parametros/grupocliente/:id", isAuth, ParametrosController.deleteGrupoCliente);

// ========== ROTAS DE GRUPO SERVICO ==========
parametrosRoutes.get("/parametros/gruposervico", isAuth, ParametrosController.listGrupoServico);
parametrosRoutes.post("/parametros/gruposervico", isAuth, ParametrosController.createGrupoServico);
parametrosRoutes.put("/parametros/gruposervico/:id", isAuth, ParametrosController.updateGrupoServico);
parametrosRoutes.delete("/parametros/gruposervico/:id", isAuth, ParametrosController.deleteGrupoServico);

// ========== ROTAS DE ESCRITORIO GESTOR ==========
parametrosRoutes.get("/parametros/escritoriogestor", isAuth, ParametrosController.listEscritorioGestor);
parametrosRoutes.post("/parametros/escritoriogestor", isAuth, ParametrosController.createEscritorioGestor);
parametrosRoutes.put("/parametros/escritoriogestor/:id", isAuth, ParametrosController.updateEscritorioGestor);
parametrosRoutes.delete("/parametros/escritoriogestor/:id", isAuth, ParametrosController.deleteEscritorioGestor);

// ========== ROTAS DE TAG SERVICO ==========
parametrosRoutes.get("/parametros/tagservico", isAuth, ParametrosController.listTagServico);
parametrosRoutes.post("/parametros/tagservico", isAuth, ParametrosController.createTagServico);
parametrosRoutes.put("/parametros/tagservico/:id", isAuth, ParametrosController.updateTagServico);
parametrosRoutes.delete("/parametros/tagservico/:id", isAuth, ParametrosController.deleteTagServico);

// ========== ROTAS DE TIPO DOCUMENTO ==========
parametrosRoutes.get("/parametros/tipodocumento", isAuth, ParametrosController.listTipoDocumento);
parametrosRoutes.post("/parametros/tipodocumento", isAuth, ParametrosController.createTipoDocumento);
parametrosRoutes.put("/parametros/tipodocumento/:id", isAuth, ParametrosController.updateTipoDocumento);
parametrosRoutes.delete("/parametros/tipodocumento/:id", isAuth, ParametrosController.deleteTipoDocumento);

// ========== ROTAS DE CARGO SOCIO ==========
parametrosRoutes.get("/parametros/cargosocio", isAuth, ParametrosController.listCargoSocio);
parametrosRoutes.post("/parametros/cargosocio", isAuth, ParametrosController.createCargoSocio);
parametrosRoutes.put("/parametros/cargosocio/:id", isAuth, ParametrosController.updateCargoSocio);
parametrosRoutes.delete("/parametros/cargosocio/:id", isAuth, ParametrosController.deleteCargoSocio);

// ========== ROTAS DE LOCALIZACAO CLIENTE ==========
parametrosRoutes.get("/parametros/localizacaocliente", isAuth, ParametrosController.listLocalizacaoCliente);
parametrosRoutes.post("/parametros/localizacaocliente", isAuth, ParametrosController.createLocalizacaoCliente);
parametrosRoutes.put("/parametros/localizacaocliente/:id", isAuth, ParametrosController.updateLocalizacaoCliente);
parametrosRoutes.delete("/parametros/localizacaocliente/:id", isAuth, ParametrosController.deleteLocalizacaoCliente);

// ========== ROTAS DE REGIME TRIBUTARIO ESTADUAL ==========
parametrosRoutes.get("/parametros/regimetributarioestadual", isAuth, ParametrosController.listRegimeTributarioEstadual);
parametrosRoutes.post("/parametros/regimetributarioestadual", isAuth, ParametrosController.createRegimeTributarioEstadual);
parametrosRoutes.put("/parametros/regimetributarioestadual/:id", isAuth, ParametrosController.updateRegimeTributarioEstadual);
parametrosRoutes.delete("/parametros/regimetributarioestadual/:id", isAuth, ParametrosController.deleteRegimeTributarioEstadual);

// ========== ROTAS DE MODALIDADE FECHAMENTO FISCAL ==========
parametrosRoutes.get("/parametros/modalidadefechamentofiscal", isAuth, ParametrosController.listModalidadeFechamentoFiscal);
parametrosRoutes.post("/parametros/modalidadefechamentofiscal", isAuth, ParametrosController.createModalidadeFechamentoFiscal);
parametrosRoutes.put("/parametros/modalidadefechamentofiscal/:id", isAuth, ParametrosController.updateModalidadeFechamentoFiscal);
parametrosRoutes.delete("/parametros/modalidadefechamentofiscal/:id", isAuth, ParametrosController.deleteModalidadeFechamentoFiscal);

// ========== ROTAS DE ADIANTAMENTO FOLHA ==========
parametrosRoutes.get("/parametros/adiantamentofolha", isAuth, ParametrosController.listAdiantamentoFolha);
parametrosRoutes.post("/parametros/adiantamentofolha", isAuth, ParametrosController.createAdiantamentoFolha);
parametrosRoutes.put("/parametros/adiantamentofolha/:id", isAuth, ParametrosController.updateAdiantamentoFolha);
parametrosRoutes.delete("/parametros/adiantamentofolha/:id", isAuth, ParametrosController.deleteAdiantamentoFolha);

// ========== ROTAS DE CONTROLES ==========
parametrosRoutes.get("/parametros/controles", isAuth, ParametrosController.listControles);
parametrosRoutes.post("/parametros/controles", isAuth, ParametrosController.createControles);
parametrosRoutes.put("/parametros/controles/:id", isAuth, ParametrosController.updateControles);
parametrosRoutes.delete("/parametros/controles/:id", isAuth, ParametrosController.deleteControles);

// ========== ROTAS DE TIPO CLIENTE ==========
parametrosRoutes.get("/parametros/tipocliente", isAuth, ParametrosController.listTipoCliente);
parametrosRoutes.post("/parametros/tipocliente", isAuth, ParametrosController.createTipoCliente);
parametrosRoutes.put("/parametros/tipocliente/:id", isAuth, ParametrosController.updateTipoCliente);
parametrosRoutes.delete("/parametros/tipocliente/:id", isAuth, ParametrosController.deleteTipoCliente);

// ========== ROTAS DE CATEGORIA CLIENTE ==========
parametrosRoutes.get("/parametros/categoriacliente", isAuth, ParametrosController.listCategoriaCliente);
parametrosRoutes.post("/parametros/categoriacliente", isAuth, ParametrosController.createCategoriaCliente);
parametrosRoutes.put("/parametros/categoriacliente/:id", isAuth, ParametrosController.updateCategoriaCliente);
parametrosRoutes.delete("/parametros/categoriacliente/:id", isAuth, ParametrosController.deleteCategoriaCliente);

// ========== ROTAS DE PERIODICIDADE CLIENTE ==========
parametrosRoutes.get("/parametros/periodicidadecliente", isAuth, ParametrosController.listPeriodicidadeCliente);
parametrosRoutes.post("/parametros/periodicidadecliente", isAuth, ParametrosController.createPeriodicidadeCliente);
parametrosRoutes.put("/parametros/periodicidadecliente/:id", isAuth, ParametrosController.updatePeriodicidadeCliente);
parametrosRoutes.delete("/parametros/periodicidadecliente/:id", isAuth, ParametrosController.deletePeriodicidadeCliente);

// ========== ROTAS DE REGIME TRIBUTARIO MUNICIPAL ==========
parametrosRoutes.get("/parametros/regimetributariomunicipal", isAuth, ParametrosController.listRegimeTributarioMunicipal);
parametrosRoutes.post("/parametros/regimetributariomunicipal", isAuth, ParametrosController.createRegimeTributarioMunicipal);
parametrosRoutes.put("/parametros/regimetributariomunicipal/:id", isAuth, ParametrosController.updateRegimeTributarioMunicipal);
parametrosRoutes.delete("/parametros/regimetributariomunicipal/:id", isAuth, ParametrosController.deleteRegimeTributarioMunicipal);

// ========== ROTAS DE MODALIDADE FECHAMENTO DP ==========
parametrosRoutes.get("/parametros/modalidadefechamentodp", isAuth, ParametrosController.listModalidadeFechamentoDP);
parametrosRoutes.post("/parametros/modalidadefechamentodp", isAuth, ParametrosController.createModalidadeFechamentoDP);
parametrosRoutes.put("/parametros/modalidadefechamentodp/:id", isAuth, ParametrosController.updateModalidadeFechamentoDP);
parametrosRoutes.delete("/parametros/modalidadefechamentodp/:id", isAuth, ParametrosController.deleteModalidadeFechamentoDP);

// ========== ROTAS DE ENVIO CORRESPONDENCIA ==========
parametrosRoutes.get("/parametros/enviocorrespondencia", isAuth, ParametrosController.listEnvioCorrespondencia);
parametrosRoutes.post("/parametros/enviocorrespondencia", isAuth, ParametrosController.createEnvioCorrespondencia);
parametrosRoutes.put("/parametros/enviocorrespondencia/:id", isAuth, ParametrosController.updateEnvioCorrespondencia);
parametrosRoutes.delete("/parametros/enviocorrespondencia/:id", isAuth, ParametrosController.deleteEnvioCorrespondencia);

// ========== ROTAS DE PARCELAMENTOS ==========
parametrosRoutes.get("/parametros/parcelamentos", isAuth, ParametrosController.listParcelamentos);
parametrosRoutes.get("/parametros/parcelamentos/:id", isAuth, ParametrosController.showParcelamentos);
parametrosRoutes.post("/parametros/parcelamentos", isAuth, ParametrosController.createParcelamentos);
parametrosRoutes.put("/parametros/parcelamentos/:id", isAuth, ParametrosController.updateParcelamentos);
parametrosRoutes.delete("/parametros/parcelamentos/:id", isAuth, ParametrosController.deleteParcelamentos);

// ========== ROTAS DE TAGS ==========
parametrosRoutes.get("/parametros/tags", isAuth, ParametrosController.listTags);
parametrosRoutes.post("/parametros/tags", isAuth, ParametrosController.createTags);
parametrosRoutes.put("/parametros/tags/:id", isAuth, ParametrosController.updateTags);
parametrosRoutes.delete("/parametros/tags/:id", isAuth, ParametrosController.deleteTags);

// ========== ROTAS DE STATUS CLIENTE ==========
parametrosRoutes.get("/parametros/statuscliente", isAuth, ParametrosController.listStatusCliente);
parametrosRoutes.post("/parametros/statuscliente", isAuth, ParametrosController.createStatusCliente);
parametrosRoutes.put("/parametros/statuscliente/:id", isAuth, ParametrosController.updateStatusCliente);
parametrosRoutes.delete("/parametros/statuscliente/:id", isAuth, ParametrosController.deleteStatusCliente);

// ========== ROTAS DE PORTE FEDERAL ==========
parametrosRoutes.get("/parametros/portefederal", isAuth, ParametrosController.listPorteFederal);
parametrosRoutes.post("/parametros/portefederal", isAuth, ParametrosController.createPorteFederal);
parametrosRoutes.put("/parametros/portefederal/:id", isAuth, ParametrosController.updatePorteFederal);
parametrosRoutes.delete("/parametros/portefederal/:id", isAuth, ParametrosController.deletePorteFederal);

// ========== ROTAS DE PORTE ESTADUAL ==========
parametrosRoutes.get("/parametros/porteestadual", isAuth, ParametrosController.listPorteEstadual);
parametrosRoutes.post("/parametros/porteestadual", isAuth, ParametrosController.createPorteEstadual);
parametrosRoutes.put("/parametros/porteestadual/:id", isAuth, ParametrosController.updatePorteEstadual);
parametrosRoutes.delete("/parametros/porteestadual/:id", isAuth, ParametrosController.deletePorteEstadual);

// ========== ROTAS DE PORTE MUNICIPAL ==========
parametrosRoutes.get("/parametros/portemunicipal", isAuth, ParametrosController.listPorteMunicipal);
parametrosRoutes.post("/parametros/portemunicipal", isAuth, ParametrosController.createPorteMunicipal);
parametrosRoutes.put("/parametros/portemunicipal/:id", isAuth, ParametrosController.updatePorteMunicipal);
parametrosRoutes.delete("/parametros/portemunicipal/:id", isAuth, ParametrosController.deletePorteMunicipal);

// ========== ROTAS DE TIER CLIENTE ==========
parametrosRoutes.get("/parametros/tiercliente", isAuth, ParametrosController.listTierCliente);
parametrosRoutes.post("/parametros/tiercliente", isAuth, ParametrosController.createTierCliente);
parametrosRoutes.put("/parametros/tiercliente/:id", isAuth, ParametrosController.updateTierCliente);
parametrosRoutes.delete("/parametros/tiercliente/:id", isAuth, ParametrosController.deleteTierCliente);

// ========== ROTAS DE CLUSTER CLIENTE ==========
parametrosRoutes.get("/parametros/clustercliente", isAuth, ParametrosController.listClusterCliente);
parametrosRoutes.post("/parametros/clustercliente", isAuth, ParametrosController.createClusterCliente);
parametrosRoutes.put("/parametros/clustercliente/:id", isAuth, ParametrosController.updateClusterCliente);
parametrosRoutes.delete("/parametros/clustercliente/:id", isAuth, ParametrosController.deleteClusterCliente);

// ========== ROTAS DE VOLUME FISCAL ==========
parametrosRoutes.get("/parametros/volumefiscal", isAuth, ParametrosController.listVolumeFiscal);
parametrosRoutes.post("/parametros/volumefiscal", isAuth, ParametrosController.createVolumeFiscal);
parametrosRoutes.put("/parametros/volumefiscal/:id", isAuth, ParametrosController.updateVolumeFiscal);
parametrosRoutes.delete("/parametros/volumefiscal/:id", isAuth, ParametrosController.deleteVolumeFiscal);

// ========== ROTAS DE VOLUME CONTABIL ==========
parametrosRoutes.get("/parametros/volumecontabil", isAuth, ParametrosController.listVolumeContabil);
parametrosRoutes.post("/parametros/volumecontabil", isAuth, ParametrosController.createVolumeContabil);
parametrosRoutes.put("/parametros/volumecontabil/:id", isAuth, ParametrosController.updateVolumeContabil);
parametrosRoutes.delete("/parametros/volumecontabil/:id", isAuth, ParametrosController.deleteVolumeContabil);

// ========== ROTAS DE VOLUME DP ==========
parametrosRoutes.get("/parametros/volumedp", isAuth, ParametrosController.listVolumeDP);
parametrosRoutes.post("/parametros/volumedp", isAuth, ParametrosController.createVolumeDP);
parametrosRoutes.put("/parametros/volumedp/:id", isAuth, ParametrosController.updateVolumeDP);
parametrosRoutes.delete("/parametros/volumedp/:id", isAuth, ParametrosController.deleteVolumeDP);

// ========== ROTAS DE VOLUME BPO ==========
parametrosRoutes.get("/parametros/volumebpo", isAuth, ParametrosController.listVolumeBPO);
parametrosRoutes.post("/parametros/volumebpo", isAuth, ParametrosController.createVolumeBPO);
parametrosRoutes.put("/parametros/volumebpo/:id", isAuth, ParametrosController.updateVolumeBPO);
parametrosRoutes.delete("/parametros/volumebpo/:id", isAuth, ParametrosController.deleteVolumeBPO);

// ========== ROTAS DE MODAL FECH BPO ==========
parametrosRoutes.get("/parametros/modalfechbpo", isAuth, ParametrosController.listModalFechBPO);
parametrosRoutes.post("/parametros/modalfechbpo", isAuth, ParametrosController.createModalFechBPO);
parametrosRoutes.put("/parametros/modalfechbpo/:id", isAuth, ParametrosController.updateModalFechBPO);
parametrosRoutes.delete("/parametros/modalfechbpo/:id", isAuth, ParametrosController.deleteModalFechBPO);

// ========== ROTAS DE STATUS CONTROLE ==========
parametrosRoutes.get("/parametros/statuscontrole", isAuth, ParametrosController.listStatusControle);
parametrosRoutes.post("/parametros/statuscontrole", isAuth, ParametrosController.createStatusControle);
parametrosRoutes.put("/parametros/statuscontrole/:id", isAuth, ParametrosController.updateStatusControle);
parametrosRoutes.delete("/parametros/statuscontrole/:id", isAuth, ParametrosController.deleteStatusControle);

// ========== ROTAS DE CONTROLE COM DATA ==========
parametrosRoutes.get("/parametros/controlecomdata", isAuth, ParametrosController.listControleComData);
parametrosRoutes.post("/parametros/controlecomdata", isAuth, ParametrosController.createControleComData);
parametrosRoutes.put("/parametros/controlecomdata/:id", isAuth, ParametrosController.updateControleComData);
parametrosRoutes.delete("/parametros/controlecomdata/:id", isAuth, ParametrosController.deleteControleComData);

// ========== ROTAS DE ESFERA ==========
parametrosRoutes.get("/parametros/esfera", isAuth, ParametrosController.listEsfera);
parametrosRoutes.post("/parametros/esfera", isAuth, ParametrosController.createEsfera);
parametrosRoutes.put("/parametros/esfera/:id", isAuth, ParametrosController.updateEsfera);
parametrosRoutes.delete("/parametros/esfera/:id", isAuth, ParametrosController.deleteEsfera);

// ========== ROTAS DE TIPO DE CONTA ==========
parametrosRoutes.get("/parametros/tipoconta", isAuth, ParametrosController.listTipoConta);
parametrosRoutes.post("/parametros/tipoconta", isAuth, ParametrosController.createTipoConta);
parametrosRoutes.put("/parametros/tipoconta/:id", isAuth, ParametrosController.updateTipoConta);
parametrosRoutes.delete("/parametros/tipoconta/:id", isAuth, ParametrosController.deleteTipoConta);

export default parametrosRoutes;
