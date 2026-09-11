// @ts-ignore
import { Sequelize, Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ContactTag from "../../models/ContactTag";
import User from "../../models/User";

import { intersection } from "lodash";
import Tag from "../../models/Tag";
import removeAccents from "remove-accents";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  companyId: number;
  tagsIds?: number[];
  isGroup?: string;
  channel?: string;
  active?: string;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  tagsIds,
  isGroup,
  channel,
  active
}: Request): Promise<Response> => {
  const rawSearch = searchParam.trim();
  const sanitizedSearchParam = removeAccents(rawSearch.toLocaleLowerCase());

  // Build conditions array to avoid [Op.or] key collision
  const andConditions: any[] = [
    { companyId },
    // Oculta contatos LID (identificadores internos do WhatsApp sem número real).
    // Grupos são sempre incluídos; números válidos BR têm no máximo 13 dígitos.
    {
      [Op.or]: [
        { isGroup: true },
        Sequelize.where(
          Sequelize.fn("length", Sequelize.col("Contact.number")),
          { [Op.lte]: 13 }
        )
      ]
    }
  ];

  if (rawSearch) {
    andConditions.push({
      [Op.or]: [
        {
          name: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { name: { [Op.iLike]: `%${rawSearch}%` } },
        { number: { [Op.like]: `%${rawSearch}%` } },
        { email: { [Op.iLike]: `%${rawSearch}%` } }
      ]
    });
  }

  if (Array.isArray(tagsIds) && tagsIds.length > 0) {
    const contactTags = await ContactTag.findAll({
      where: { tagId: { [Op.in]: tagsIds } }
    });
    const contactTagFilter: number[][] = [contactTags.map(t => t.contactId)];
    const contactTagsIntersection: number[] = intersection(...contactTagFilter);
    andConditions.push({ id: { [Op.in]: contactTagsIntersection } });
  }

  if (isGroup === "false") {
    andConditions.push({ isGroup: false });
  }

  if (channel && channel !== "") {
    andConditions.push({ channel });
  }

  if (active !== undefined && active !== "") {
    andConditions.push({ active: active === "true" });
  }

  const whereCondition: any = { [Op.and]: andConditions };

  const limit = 250;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    distinct: true,
    limit,
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: ["id", "status", "createdAt", "updatedAt", "userId"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"]
          }
        ]
      },
      {
        model: Tag,
        as: "tags"
      }
    ],
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListContactsService;
