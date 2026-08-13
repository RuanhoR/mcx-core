import { cac } from 'cac';
import inpurer from 'inquirer';
import { getI18n, LanguageList } from './i18n';
import { InputResult } from './types';
import { initProject, fileExists } from './init';
import { resolve } from 'node:path';
function throwErr(text: string) {
  console.log('×: ERR: ' + text);
  process.exit(1);
}
export function createCliApp() {
  const cli = cac('create-mbler');
  cli.option('-l, --language <value>', 'Define Create mbler tool language', {
    default: 'en',
  });
  cli.command('[dir]', 'Create mbler project').action(async (dir, options) => {
    const language = options.language;
    if (!LanguageList.includes(language)) {
      throwErr(
        'Invaild Language, should such as ' + JSON.stringify(LanguageList),
      );
    }
    const inputResult = (await inpurer.prompt([
      {
        type: 'input',
        default: dir || './',
        message: getI18n('InputCreateAt', language),
        name: 'createAt',
      },
      {
        type: 'input',
        name: 'Name',
        message: getI18n('Name', language),
      },
      {
        type: 'input',
        name: 'Description',
        message: getI18n('Description', language),
        default: 'The package is a ...',
      },
      {
        type: 'input',
        name: 'McVersion',
        message: getI18n('McVersion', language),
        default: '1.21.100',
      },
      {
        type: 'checkbox',
        name: 'OtherModule',
        message: getI18n('Need', language),
        choices: ['ui', 'beta-api', 'init git', 'init dep'],
      },
      {
        type: 'select',
        name: 'Language',
        message: getI18n('Need', language),
        choices: ['mcx', 'js', 'ts'],
      },
      {
        type: 'select',
        name: 'PackageManager',
        message: getI18n('PackageManager', language),
        choices: ['npm', 'pnpm'],
      },
    ])) as InputResult;
    if (await fileExists(resolve(inputResult.createAt))) {
      console.error('Dir is exists, cannot create again');
      return;
    }
    await initProject(inputResult);
  });
  cli.help();
  return cli;
}
export const cli = () => {
  createCliApp().parse();
};
export * from './i18n';
export * from './types';
