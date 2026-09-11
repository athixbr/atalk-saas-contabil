import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";
import fs from "fs";
import path from "path";
import DigitalOceanService from "../services/DigitalOceanService";

import ListService from "../services/AnnouncementService/ListService";
import CreateService from "../services/AnnouncementService/CreateService";
import ShowService from "../services/AnnouncementService/ShowService";
import UpdateService from "../services/AnnouncementService/UpdateService";
import DeleteService from "../services/AnnouncementService/DeleteService";
import FindService from "../services/AnnouncementService/FindService";
import FindAdminNotificationsService from "../services/AnnouncementService/FindAdminNotificationsService";
import DismissService from "../services/AnnouncementService/DismissService";
import MarkReadService from "../services/AnnouncementService/MarkReadService";

import Announcement from "../models/Announcement";
import ResolveNotificationTargetUsersService from "../services/AnnouncementService/ResolveNotificationTargetUsersService";

import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  companyId: string | number;
};

type StoreData = {
  priority: string;
  title: string;
  text: string;
  status: string;
  companyId: number;
  mediaPath?: string;
  mediaName?: string;
  tipo?: string;
  usuariosIds?: number[];
  departamentosIds?: number[];
  expirationDays?: number;
  scheduledAt?: string | null;
};

type FindParams = {
  companyId: string;
};

const dispatchAdminNotification = async (
  io: ReturnType<typeof getIO>,
  record: Announcement
): Promise<void> => {
  const targetUserIds = await ResolveNotificationTargetUsersService(
    record.usuariosIds,
    record.departamentosIds
  );

  targetUserIds.forEach(targetUserId => {
    io.emit(`user${targetUserId}-admin-notification`, {
      action: "new",
      record
    });
  });
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { expirationDays, scheduledAt: scheduledAtInput, ...data } =
    req.body as StoreData;

  const schema = Yup.object().shape({
    title: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const expiresAt = expirationDays
    ? new Date(Date.now() + Number(expirationDays) * 24 * 60 * 60 * 1000)
    : null;

  const scheduledAt = scheduledAtInput ? new Date(scheduledAtInput) : null;
  const isImmediate = !scheduledAt || scheduledAt.getTime() <= Date.now();

  const record = await CreateService({
    ...data,
    companyId,
    expiresAt,
    scheduledAt,
    notifiedAt: isImmediate ? new Date() : null,
    createdByUserId: Number(userId)
  });

  const io = getIO();
  io.emit(`company-announcement`, {
    action: "create",
    record
  });

  if (record.tipo === "admin_notification" && isImmediate) {
    await dispatchAdminNotification(io, record);
  }

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { expirationDays, scheduledAt: scheduledAtInput, ...data } =
    req.body as StoreData;

  const schema = Yup.object().shape({
    title: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const expiresAt =
    expirationDays !== undefined
      ? expirationDays > 0
        ? new Date(Date.now() + Number(expirationDays) * 24 * 60 * 60 * 1000)
        : null
      : undefined;

  const scheduledAt =
    scheduledAtInput !== undefined
      ? scheduledAtInput
        ? new Date(scheduledAtInput)
        : null
      : undefined;

  const record = await UpdateService({
    ...data,
    id,
    ...(expiresAt !== undefined ? { expiresAt } : {}),
    ...(scheduledAt !== undefined ? { scheduledAt } : {})
  });

  const io = getIO();
  io.emit(`company-announcement`, {
    action: "update",
    record
  });

  const isDue =
    !record.scheduledAt || new Date(record.scheduledAt).getTime() <= Date.now();

  if (record.tipo === "admin_notification" && !record.notifiedAt && isDue) {
    await record.update({ notifiedAt: new Date() });
    await dispatchAdminNotification(io, record);
  }

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id);
 
  const io = getIO();
  io.emit(`company-announcement`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Announcement deleted" });
};

export const findList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.query as FindParams;
  const records: Announcement[] = await FindService(params);

  return res.status(200).json(records);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    const announcement = await Announcement.findByPk(id);

    await announcement.update({
      mediaPath: file.filename.replace('/','-'),
      mediaName: file.originalname.replace('/','-')
    });
    await announcement.reload();

    const io = getIO();
    io.emit(`company-announcement`, {
      action: "update",
      record: announcement
    });

    return res.send({ mensagem: "Mensagem enviada" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const adminNotifications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  const records = await FindAdminNotificationsService({ userId, companyId });

  return res.status(200).json(records);
};

export const dismiss = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId } = req.user;
  const announcementId = Number(req.params.id);

  const record = await DismissService({ announcementId, userId });

  return res.status(200).json(record);
};

export const markRead = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId } = req.user;
  const announcementId = Number(req.params.id);

  const record = await MarkReadService({ announcementId, userId });

  return res.status(200).json(record);
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const announcement = await Announcement.findByPk(id);

    const filePath = path.resolve("public", "announcements",announcement.mediaPath);

    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      fs.unlinkSync(filePath);
    } else {
      try { await DigitalOceanService.delete(`announcements/${announcement.mediaPath}`); } catch (_) {}
    }

    await announcement.update({
      mediaPath: null,
      mediaName: null
    });
    await announcement.reload();

    const io = getIO();
    io.emit(`company-announcement`, {
      action: "update",
      record: announcement
    });

    return res.send({ mensagem: "Arquivo excluído" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
