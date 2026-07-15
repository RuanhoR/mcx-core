import { Argument, Command } from 'commander';
import inpurer from 'inquirer';
import { getI18n, LanguageList } from './i18n';
import { InputResult } from './types';
import { initProject, fileExists } from './init';
import { resolve } from "node:path"
function throwErr(text: string) {
  console.log('×: ERR: ' + text);
  process.exit(1);
}
export function createCliApp() {
  const program = new Command('create-mbler');
  return program
    .name('create-mbler')
    .description('Create mbler project')
    .addArgument(new Argument('[dir]', 'Where to create mbler project'))
    .option('-l, --language <value>', 'Define Create mbler tool language', 'en')
    .action(async function (...argv) {
      const language = this.getOptionValue('language');
      if (!LanguageList.includes(language)) {
        throwErr(
          'Invaild Language, should such as ' + JSON.stringify(LanguageList),
        );
      }
      const inputResult = (await inpurer.prompt([
        {
          type: 'input',
          default: argv[0] || './',
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
        return console.error("Dir is exists, cannot create again");
      }
      await initProject(inputResult);
    });
}
export const cli = () => {
  createCliApp().parse();
};
export * from './i18n';
export * from './types';