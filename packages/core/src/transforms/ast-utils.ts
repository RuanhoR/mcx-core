import * as t from '@babel/types';

export function extractVarDefIdList(express: t.LVal | t.VoidPattern): string[] {
  const result: string[] = [];
  if (t.isIdentifier(express)) result.push(express.name);
  if (t.isObjectPattern(express))
    express.properties.forEach(prop => {
      if (t.isObjectProperty(prop))
        return result.push(
          ...extractVarDefIdList(
            prop.value as t.Identifier | t.AssignmentPattern,
          ),
        );
      if (t.isRestElement(prop) && prop.argument.type == 'Identifier')
        result.push(prop.argument.name);
    });
  if (t.isArrayPattern(express)) {
    for (const element of express.elements) {
      if (!element) continue;
      result.push(...extractVarDefIdList(element));
    }
  }
  if (t.isAssignmentPattern(express)) {
    result.push(...extractVarDefIdList(express.left));
  }
  return result;
}

export function extractIdList(expression: t.Declaration): string[] {
  if (t.isFunctionDeclaration(expression)) {
    return [expression.id?.name || ''];
  }
  if (t.isVariableDeclaration(expression)) {
    const result: string[] = [];
    for (const varDef of expression.declarations) {
      result.push(...extractVarDefIdList(varDef.id));
    }
    return result;
  }
  if (t.isClassDeclaration(expression)) {
    return [expression.id?.name || ''];
  }
  return [];
}

export function toExpression(
  s: t.ExportDefaultDeclaration['declaration'],
): t.Expression {
  if (t.isFunctionDeclaration(s))
    return t.functionExpression(s.id, s.params, s.body, s.generator, s.async);
  if (t.isClassDeclaration(s))
    return t.classExpression(s.id, s.superClass, s.body, s.decorators);
  if (t.isTSDeclareFunction(s)) return t.objectExpression([]);
  return s;
}
