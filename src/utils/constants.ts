export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export type TWareCategory =
  | 'софт-скил'
  | 'хард-скил'
  | 'дополнительное'
  | 'кнопка'
  | 'другое';
export type TCategorizer = Record<TWareCategory, string>;

export const constantCategory: TCategorizer = {
  'софт-скил': 'soft',
  'хард-скил': 'hard',
  дополнительное: 'additional',
  кнопка: 'button',
  другое: 'other',
};
