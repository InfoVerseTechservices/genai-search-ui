import { OptionsType } from 'cookies-next/lib/types';

export const COOKIE_OPTIONS: OptionsType = {
  path: '/',
  expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 * 365),
  sameSite: 'lax',
  secure: true,
  domain: '.colomboai.com',
};

export const ROOT_URL_AUTH =
  'https://caiuserservice-1-dev-dot-fair-myth-398920.uc.r.appspot.com';
