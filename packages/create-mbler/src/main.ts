import { Argument, Command } from 'commander'
import inpurer from 'inquirer'
import { getI18n, LanguageList } from './i18n'
import { showText, verifyType } from './utils'
function throwErr(text: string) {
  showText('×: ERR: ' + text)
  process.exit(1)
}
const program = new Command('create-mbler')
program
  .name('mbler')
  .description('Create mbler project')
  .addArgument(new Argument('[dir]', 'Where to create mbler project'))
  .option('-l, --language <value>', 'Define Create mbler tool language', 'en')
  .action(async function (...argv) {
    let language = this.getOptionValue('language')
    if (!LanguageList.includes(language)) {
      throwErr(
        'Invaild Language, should such as ' + JSON.stringify(LanguageList),
      )
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
    ])) as {
      createAt: string
      OtherModule: ('ui' | 'beta-api' | 'init git' | 'init dep')[]
      McVersion: string
      Description: string
      Name: string
    }
    if (
      !verifyType(inputResult, {
        createAt: 'string',
        Description: 'string',
        McVersion: 'string',
        Name: 'string',
        OtherModule: 'object',
      })
    ) {
      throwErr('basic type error')
    }
  })
export const cli = () => {
  program.parse()
}
export * from './i18n'
