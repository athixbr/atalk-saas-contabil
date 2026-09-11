import Holerite from "../../models/Holerite";
import AppError from "../../errors/AppError";
import DigitalOceanService from "../DigitalOceanService";
import fs from "fs";
import path from "path";

interface Request {
  holeriteId: number;
  companyId: number;
}

const DeleteHoleriteService = async ({
  holeriteId,
  companyId,
}: Request): Promise<void> => {
  const holerite = await Holerite.findOne({
    where: { id: holeriteId, companyId },
  });

  if (!holerite) {
    throw new AppError("Holerite não encontrado", 404);
  }

  // Deletar arquivo físico (local legado ou no storage)
  const filePath = path.join(__dirname, "..", "..", "..", "public", holerite.arquivoPdf);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  } else {
    try {
      await DigitalOceanService.delete(holerite.arquivoPdf);
    } catch (_) {}
  }

  await holerite.destroy();
};

export default DeleteHoleriteService;
