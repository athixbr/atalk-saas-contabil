import { CookieOptions, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const jrtCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax"
};

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, jrtCookieOptions);
};
