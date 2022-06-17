const which = require('which');
const path = require('path');
const ora = require('ora');
const { getAllFilesByDir } = require('./getAllFilesByDir');
const chalk = require('chalk');
const { execSync } = require('child_process');
const encoding = require('encoding');
const logger = require('./log4js')
const dayjs = require('dayjs');
const { AttachCmdException } = require('./error');

function execAttachCmd(params) {
    let cmdList = [];
    let errorCmd;
    let failCmdCount = 0;
    let successCmdCount = 0;
    let exceptionCmdCount = 0;
    let indexCmd = 0;

    const startTime = dayjs();
    let spinner = ora({
        prefixText: chalk.blue('附加数据库命令'), spinner: 'arrow3', interval: 50,
    }).start();

    try {
        checkVerCmd(params.sqlVersion);
    } catch (error) {
        spinner.fail(chalk.red('检查数据库端客户端命令失败!'));
        throw error;
    }

    try {
        cmdList = buildAttachDbCmd(params);
    } catch (error) {
        spinner.fail(chalk.red('读取附加的数据库文件路径失败'));
        throw error;
    }

    for (const cmd of cmdList) {
        ++indexCmd;
        try {
            execCmdSync(cmd);
            ++successCmdCount;
            const msgSuccess = `第${indexCmd}个命令执行成功:  ${cmd}`;
            spinner.text = chalk.yellow(msgSuccess);
            logger.info.info(msgSuccess);
        } catch (error) {
            if (error instanceof AttachCmdException) {
                ++exceptionCmdCount;
                const msgException = `第${indexCmd}个命令执行异常:  ${cmd}`;
                logger.ex.info(`第${indexCmd}个` + error.message);
                spinner.text = chalk.yellow(msgException);

            } else {
                //执行了错误的命令
                ++failCmdCount;
                errorCmd = cmd;
                const errorMsgOut = encoding.convert(error.stdout, 'utf-8', 'cp936').toString() + encoding.convert(error.stderr, 'utf-8', 'cp936').toString()
                const msgFail = `第${indexCmd}个命令执行错误:  ${cmd}` +'\n' + errorMsgOut;
                logger.error.info(msgFail);
                spinner.text = chalk.yellow(`第${indexCmd}个命令执行错误:  ${cmd}`);
                break; //不在执行错误命令之后的其它命令
            }

        }
    }

    const runTimeCount = dayjs().diff(startTime, 'millisecond') / 1000;
    if (failCmdCount === 0 && exceptionCmdCount === 0) {
        spinner.succeed(chalk.yellow(`命令执行成功  总共导入了:  ${cmdList.length} 个数据库   失败: 0 个   执行时间: ${runTimeCount} 秒`));
    } else {
        const failMsg = failCmdCount === 0 ? '错误总数 0 \n' : `错误命令:第 ${indexCmd} 个命令:  ${errorCmd} 错误` + '\n';
        spinner.fail(chalk.red('命令错误或存在异常: 错误或异常的详细信息,请查看log目录下的error.log或exception.log日志' + '\n' + `执行时间: ${runTimeCount} 秒` + '\n' + '成功总数 ' + successCmdCount + '\n' + '异常总数 ' + exceptionCmdCount + '\n' + failMsg));

    }

}

//检查附加数据库的命令是在环境变量的path中否存
function checkVerCmd(sqlVersion) {
    if (sqlVersion === '2000') {
        const path = which.sync('osql', { nothrow: true });
        if (!path) throw Error('请检查是否安装sqlServer2000 osql.exe 客户端命令,或是否将其添加到环境变量的path中');
    } else if (sqlVersion === '2008') {
        const path = which.sync('sqlcmd', { nothrow: true });
        if (!path) throw Error('请检查是否安装sqlServer2008 sqlcmd.exe 客户端命令,或是否将其添加到环境变量的path中');
    } else {
        throw Error('附加命令只支持 2000 或 2008两个版本参数')
    }
}

function getAllAttachFiles(dir) {
    const fileList = getAllFilesByDir(dir, (fileName) => {
        if (path.extname(fileName) === '.MDF') {
            return fileName;
        } else {
            return null;
        }
    });
    return fileList;
}

/**
 * 文件路径 D:\U8SOFT\ADMIN\ZT006\2022\UFDATA.MDF,D:\U8SOFT\ADMIN\ZT006\2022\UFDATA.LDF
 * 附加的数据库名:UFDATA_006_2022 
 *          
 * @param {string} fileName    D:\U8SOFT\ADMIN\ZT006\2022\UFDATA.MDF
 * @return {string} UFDATA_006_2022
 */
function fileNameToDbName(fileName) {
    fileName = path.normalize(fileName);
    const filePath = path.dirname(fileName);
    //TODO: 验证文件格式通过正则
    const index = filePath.indexOf('ZT') + 2;
    const dbName = filePath.substring(index).replace('\\', '_').replace('/', '_'); //006_2002
    return 'UFDATA_' + dbName;
}

function buildSql2000AttachDbCmdList(params, fileList = []) {
    const cmdList = [];
    let attachdb_cmd = ''
    fileList.forEach(item => {
        const dbName = fileNameToDbName(item.fileName);
        const mdfFile = path.normalize(item.fileName);
        const ldfFile = mdfFile.substring(0, mdfFile.length - 3) + 'LDF';
        if (params.user) {
            attachdb_cmd = `osql -U "${params.user}" -P "${params.password}" -S .\\${params.instance}  -Q "sp_attach_db '${dbName}','${mdfFile}','${ldfFile}'"`;
        } else {
            attachdb_cmd = `osql -E -S .\\${params.instance}  -Q "sp_attach_db '${dbName}','${mdfFile}','${ldfFile}'"`;
        }

        cmdList.push(attachdb_cmd);
    })
    return cmdList;
}

function buildSql2008AttachDbCmdList(params, fileList = []) {
    const cmdList = [];
    let attachdb_cmd = ''
    fileList.forEach(item => {
        const dbName = fileNameToDbName(item.fileName);
        const mdfFile = path.normalize(item.fileName);
        const ldfFile = mdfFile.substring(0, mdfFile.length - 3) + 'LDF';
        if (params.user) {
            attachdb_cmd = `sqlcmd -U "${params.user}" -P "${params.password}" -S .\\${params.instance}  -Q "CREATE DATABASE [${dbName}] ON ( FILENAME = '${mdfFile}' ),( FILENAME = '${ldfFile}' ) FOR ATTACH"`;
        } else {
            attachdb_cmd = `sqlcmd -S .\\${params.instance}  -Q "CREATE DATABASE [${dbName}] ON ( FILENAME = '${mdfFile}' ),( FILENAME = '${ldfFile}' ) FOR ATTACH"`;
        }

        cmdList.push(attachdb_cmd);
    })
    return cmdList;
}

function buildAttachDbCmd(params) {
    let fileList = getAllAttachFiles(params.dir);
    if (params.sqlVersion === '2000') {
        fileList = buildSql2000AttachDbCmdList(params, fileList);
    } else {
        fileList = buildSql2008AttachDbCmdList(params, fileList);
    }
    logger.info.info('根据数据库名构建的附加数据库命令列表:');
    fileList.forEach(cmd => logger.info.info(cmd));
    return fileList;
}

function execCmdSync(cmdStr) {
    const msgBuffer = execSync(cmdStr, { stdio: ['pipe', 'pipe', 'pipe'] });
    if (msgBuffer.length) {
        // sqlCmd 或 osql 命令在执行过程中,如果msgBuffer,有输出信息,数据库附加时,可能出现警告附加db会成功或不成功!
        throw new AttachCmdException('命令执行异常:' + cmdStr + ",    " + encoding.convert(msgBuffer, 'utf-8', 'cp936').toString());
    }
}

module.exports = {
    execAttachCmd
}

