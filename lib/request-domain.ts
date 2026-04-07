export const REQUEST_TYPES = ["电影", "电视剧", "动漫", "纪录片"] as const;
export const REQUEST_STATUSES = ["待处理", "已完成", "已拒绝"] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

const requestTypeSet = new Set<string>(REQUEST_TYPES);
const requestStatusSet = new Set<string>(REQUEST_STATUSES);

export function isRequestType(value: string): value is RequestType {
  return requestTypeSet.has(value);
}

export function isRequestStatus(value: string): value is RequestStatus {
  return requestStatusSet.has(value);
}

export function normalizeTitle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function parseRequestId(raw: string) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}
