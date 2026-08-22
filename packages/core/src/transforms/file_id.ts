let fileIdCounter = 0;
export function generateFileId() {
  return `__file_import_${fileIdCounter++}__`;
}
export function resetFileIdCounter() {
  fileIdCounter = 0;
}
