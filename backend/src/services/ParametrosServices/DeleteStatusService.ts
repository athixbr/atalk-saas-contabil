import Status from "../../models/Status";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteStatusService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const status = await Status.findOne({
    where: { id, companyId },
  });

  if (!status) {
    throw new AppError("Status não encontrado", 404);
  }

  await status.destroy();
};

export default DeleteStatusService;
