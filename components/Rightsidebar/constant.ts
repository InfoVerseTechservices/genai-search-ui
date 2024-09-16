import { OptionsType } from "cookies-next/lib/types";

export const COOKIE_OPTIONS: OptionsType = {
    path: "/",
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 * 365),
    sameSite: 'strict',
    secure: true,
    domain: '.colomboai.com'
  }