import type {
  MemberExpression,
  Identifier,
  Expression,
  ThisExpression,
  PrivateName,
  callExpression,
} from '@babel/types';
import { Context } from './compiler';

export default class NodeUtils {
  public static stringArrayToMemberExpression(
    stringArray: string[],
  ): MemberExpression {
    if (stringArray.length < 2) {
      throw new Error('String array must contain at least 2 items');
    }

    let current: Expression = {
      type: 'Identifier',
      name: stringArray[0]!,
    };

    for (let i = 1; i < stringArray.length; i++) {
      current = {
        type: 'MemberExpression',
        object: current,
        property: {
          type: 'Identifier',
          name: stringArray[i]!,
        },
        computed: false,
      };
    }
    if (current.type !== 'MemberExpression') {
      throw new Error('Internal error: expected MemberExpression');
    }

    return current;
  }
  public static memberExpressionToStringArray(
    memberExpression: MemberExpression,
    maxLength: number,
  ): string[] {
    const result: string[] = [];
    let current: Expression | ThisExpression = memberExpression;

    while (current.type === 'MemberExpression' && result.length < maxLength) {
      const prop = current.property;

      if (!current.computed && prop.type === 'Identifier') {
        result.unshift(prop.name);
      }

      current = current.object;
    }

    if (result.length >= maxLength) {
      return result;
    }

    switch (current.type) {
      case 'Identifier':
        result.unshift(current.name);
        break;

      case 'ThisExpression':
        result.unshift('this');
        break;

      case 'StringLiteral':
      case 'NumericLiteral':
      case 'BooleanLiteral':
        result.unshift(String(current.value));
        break;

      case 'NullLiteral':
        result.unshift('null');
        break;
    }

    return result;
  }

  /**
   * Calc babel expression value
   * @param expression Babel AST node
   * @param currentContext current context
   * @param topContext top context
   * @returns {string | number | symbol | object}
   */
  public static evaluateExpression(
    expression: Expression,
    currentContext: Context = {},
    topContext: Context = {},
  ): unknown {
    const context = { ...topContext, ...currentContext };

    const evaluate = (expr: unknown): unknown => {
      if (!expr) return undefined;
      const e = expr as Expression | PrivateName;
      switch (e.type) {
        case 'Identifier':
          if (!e.name) return undefined;
          if (e.name in context) {
            return evaluate(context[e.name]);
          }
          if (e.name === 'this') {
            return currentContext;
          }
          if (e.name === 'global') {
            return topContext;
          }
          throw new Error(`Undefined variable: ${e.name}`);
        case 'StringLiteral':
          return e.value;
        case 'NumericLiteral':
          return e.value;
        case 'BooleanLiteral':
          return e.value;
        case 'NullLiteral':
          return null;
        case 'MemberExpression': {
          const objectValue = evaluate(e.object);
          const property = e.computed
            ? evaluate(e.property)
            : (e.property as Identifier).name;
          if (
            objectValue &&
            typeof objectValue === 'object' &&
            (property as string | number | symbol) in objectValue
          ) {
            return (objectValue as Record<string, unknown>)[property as string];
          }
          throw new Error(
            `Cannot access property '${property}' of ${String(objectValue)}`,
          );
        }

        case 'ObjectExpression': {
          const obj: Record<string, unknown> = {};
          for (const prop of e.properties) {
            if (prop.type === 'ObjectProperty') {
              const key = prop.computed
                ? evaluate(prop.key as Expression)
                : (prop.key as Identifier).name;
              obj[key as string] = evaluate(prop.value);
            }
          }
          return obj;
        }

        case 'ArrayExpression':
          return e.elements.map((element: unknown) => {
            const el = element as { type: string } | null;
            return el && el.type !== 'SpreadElement' ? evaluate(el) : undefined;
          });

        case 'UnaryExpression': {
          const argumentValue = evaluate(e.argument);
          switch (e.operator) {
            case '+':
              return Number(argumentValue);
            case '-':
              return -Number(argumentValue);
            case '!':
              return !argumentValue;
            case '~':
              return ~Number(argumentValue);
            case 'typeof':
              return typeof argumentValue;
            case 'void':
              return void argumentValue;
            default:
              throw new Error(`Unsupported unary operator: ${e.operator}`);
          }
        }
        case 'PrivateName':
          return evaluate(context[e.id.name]);
        case 'BinaryExpression': {
          const leftValue: unknown = evaluate(e.left);
          const rightValue: unknown = evaluate(e.right);
          const isNum =
            typeof leftValue == 'number' && typeof rightValue == 'number';
          switch (e.operator) {
            case '+':
              if (
                typeof leftValue === 'number' &&
                typeof rightValue === 'number'
              ) {
                return leftValue + rightValue;
              }
              return String(leftValue) + String(rightValue);
            case '-':
              if (isNum) {
                return leftValue - rightValue;
              } else return 0;
            case '*':
              if (isNum) {
                return leftValue * rightValue;
              } else return 0;
            case '/':
              if (isNum) {
                return leftValue / rightValue;
              } else return 0;
            case '%':
              if (isNum) {
                return leftValue % rightValue;
              } else return 0;
            case '==':
              return leftValue == rightValue;
            case '!=':
              return leftValue != rightValue;
            case '===':
              return leftValue === rightValue;
            case '!==':
              return leftValue !== rightValue;
            case '<':
              return Number(leftValue) < Number(rightValue);
            case '<=':
              return Number(leftValue) <= Number(rightValue);
            case '>':
              return Number(leftValue) > Number(rightValue);
            case '>=':
              return Number(leftValue) >= Number(rightValue);
            case '|':
              return Number(leftValue) | Number(rightValue);
            case '&':
              return Number(leftValue) & Number(rightValue);
            case '^':
              return Number(leftValue) ^ Number(rightValue);
            case '<<':
              return Number(leftValue) << Number(rightValue);
            case '>>':
              return Number(leftValue) >> Number(rightValue);
            case '>>>':
              return Number(leftValue) >>> Number(rightValue);
            default:
              throw new Error(`Unsupported binary operator: ${e.operator}`);
          }
        }
        case 'LogicalExpression': {
          const left = evaluate(e.left);
          switch (e.operator) {
            case '&&':
              return left && evaluate(e.right);
            case '||':
              return left || evaluate(e.right);
            case '??':
              return left ?? evaluate(e.right);
            default:
              throw new Error('Unsupported logical operator');
          }
        }

        case 'ConditionalExpression':
          return evaluate(e.test)
            ? evaluate(e.consequent)
            : evaluate(e.alternate);

        case 'CallExpression': {
          const callee = evaluate(e.callee);
          if (typeof callee !== 'function') {
            throw new Error(`Cannot call non-function: ${String(callee)}`);
          }
          const args = e.arguments.map(
            (arg: typeof callExpression.arguments) =>
              arg.type === 'SpreadElement'
                ? evaluate(arg.argument)
                : evaluate(arg),
          );
          return callee.apply(null, args);
        }
        default:
          throw new Error(`Unsupported expression type: ${e.type}`);
      }
    };

    try {
      return evaluate(expression);
    } catch (error: unknown) {
      throw new Error(
        `Expression evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
