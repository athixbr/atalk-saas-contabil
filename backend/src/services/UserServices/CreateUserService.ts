import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  companyId?: number;
  profile?: string;
  startWork?: string;
  endWork?: string;
  whatsappId?: number;
  allTicket?: string;
  defaultTheme?: string;
  defaultMenu?: string;
  allowGroup?: boolean;
  wpp?: string;
  isActive?: boolean;
  departamentos?: Array<{ departamentoId: number; isCoordenador: boolean }>;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
  isActive: boolean;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  companyId,
  profile = "admin",
  startWork,
  endWork,
  whatsappId,
  allTicket,
  defaultTheme,
  defaultMenu,
  allowGroup,
  wpp,
  isActive = true,
  departamentos = []
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const user = await User.create(
    {
      email,
      password,
      name,
      companyId,
      profile,
      startWork,
      endWork,
      whatsappId: whatsappId || null,
      allTicket,
      defaultTheme,
      defaultMenu,
      allowGroup,
      wpp: wpp || null,
      isActive
    },
    { include: ["queues", "company"] }
  );

  await user.$set("queues", queueIds);

  if (departamentos.length > 0) {
    await DepartamentoUsuario.bulkCreate(
      departamentos.map(d => ({
        userId: user.id,
        departamentoId: d.departamentoId,
        isCoordenador: d.isCoordenador || false
      }))
    );
  }

  await user.reload();

  const serializedUser = SerializeUser(user);

  return serializedUser;
};

export default CreateUserService;
