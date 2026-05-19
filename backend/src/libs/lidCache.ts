/**
 * lidCache.ts — Cache LID → PN para Baileys v7
 *
 * Contatos com privacidade ativada usam JID no formato @lid (ex: 148262908600511@lid)
 * em vez do número de telefone @s.whatsapp.net.
 *
 * Este módulo centraliza o mapeamento para evitar importações circulares entre
 * wbot.ts e wbotMessageListener.ts.
 */

import { isLidUser } from "@whiskeysockets/baileys";
import cacheLayer from "./cache";

// Map em memória para resolução imediata (sem latência de I/O)
// Populado pelo evento lid-mapping.update no wbot.ts
export const lidPhoneMemCache = new Map<string, string>();

/** TTL do mapeamento no Redis: 30 dias */
export const LID_REDIS_TTL = String(30 * 24 * 3600);

/**
 * Armazena mapeamento LID → phone em memória e no Redis.
 * Chamado pelo wbot.ts nos eventos lid-mapping.update e contacts.upsert.
 */
export const storeLidMapping = async (lidJid: string, phoneJid: string): Promise<void> => {
  if (!lidJid || !phoneJid || !isLidUser(lidJid)) return;
  // 1. In-memory imediato
  lidPhoneMemCache.set(lidJid, phoneJid);
  // 2. Redis para persistência entre restarts
  await cacheLayer.set(`lid:${lidJid}`, phoneJid, "EX", LID_REDIS_TTL);
};

/**
 * Resolve um JID @lid para @s.whatsapp.net.
 * Verifica memória antes do Redis (mais rápido).
 */
export const resolveLidJid = async (lid: string): Promise<string | null> => {
  if (!lid || !isLidUser(lid)) return null;
  // 1. In-memory (imediato — sem latência)
  const mem = lidPhoneMemCache.get(lid);
  if (mem) return mem;
  // 2. Redis (persistência entre restarts)
  const cached = await cacheLayer.get(`lid:${lid}`);
  if (cached) {
    lidPhoneMemCache.set(lid, cached as string); // warm in-memory cache
    return cached as string;
  }
  return null;
};
