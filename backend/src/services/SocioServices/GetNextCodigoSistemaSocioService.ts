import GetNextCodigoSistemaService from "../ClienteServices/GetNextCodigoSistemaService";

const GetNextCodigoSistemaSocioService = async (companyId: number): Promise<string> => {
  return GetNextCodigoSistemaService(companyId);
};

export default GetNextCodigoSistemaSocioService;
