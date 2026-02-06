import { Utils } from "./utils";
export default async function MCXLoader(fileDir: string) {
  const file = Utils.readFileAsMcx(fileDir);
  return file;
}