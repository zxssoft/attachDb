const program = require('commander')
// const Option = program.Option;
const Argument = program.Argument;
const chalk = require('chalk');
const { execAttachCmd } = require('./runCmd')
const logger = require('./log4js')
program
    //.name('命令名')
    //.usage('使用方式')
    .version('1.0.0', '-v, --version')
    // .addArgument(new Argument('<sqlVersion>', 'sql版本 2000 或 2008 默认：2000').choices(['2000','2008']))
    //.addArgument(new Argument('[sqlVersion]', 'sql版本 2000 或 2008 默认：2000').default('2000','默认是2000'))
    // .argument('[sqlVersion]', '指定sql版本 2000 或 2008 默认：2000','2000')
    .addArgument(new Argument('[sqlVersion]', 'sql版本 2000 或 2008').choices(['2000', '2008']).default('2000', '默认是2000'))
    //.option('-p, --cmdPath [cmdPath]', 'sql客户端命令文件路径,如果命令在环境变量中配置,不用指定命令路径' )
    .option('-u, --user [user]', '用户名, 如果是windows认证方式登陆,不用指定此参数')
    .option('-p, --password [password]', '密码, 如果是windows认证方式登陆,不用指定此参数', '')
    .requiredOption('-d, --dir <dir>', '附加的db文件目录<必须指定>')
    .requiredOption('-i, --instance <instanceName>', '连接的数据库的实例名<必须指定>')
    .showHelpAfterError()
    .addHelpText('after', `
        sqlServer2000 附加命令示例:
            windows 认证方式
            执行此命令前,先将 osql.exe 命令添加到环境变量路径中 
            .\attachDb.exe  -d <dir> -i <instenceName> 
            用户名密码方式 
            .\attachDb.exe -u <user> -p <password> -d <dir> -i <instenceName> 
       
         sqlServer2008 附加命令示例:
            执行此命令前,先将 sqlcmd.exe 命令添加到环境变量路径中 
            windows 认证方式
            .\attachDb.exe  2008 -d <dir> -i <instenceName> 
            用户名密码方式 
            .\attachDb.exe 2008 -u <user> -p <password> -d <dir> -i <instenceName> 
    `)
    .action((args, opts) => {
        const parmas = { sqlVersion: args, ...opts }
        try {
            execAttachCmd(parmas);
        } catch (error) {
            logger.error.error(chalk.red('错误提示:', error.message));
        }
    });

program.parse(process.argv);
