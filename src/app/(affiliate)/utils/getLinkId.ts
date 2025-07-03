export function getLinkId(linkField: any): string | number | undefined {
  if (typeof linkField === 'object' && linkField !== null && 'id' in linkField) {
    return linkField.id;
  }
  return linkField;
}