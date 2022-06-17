const fs = require('fs')
const _ = require('lodash')
const chalk = require('chalk')
const ora = require('ora');
const path = require('path');
const logger = require('./log4js')
/**
 * 
 * @param {string} dir 获取文件的目录
 * @param {function} filterFileCallback(fileName) 对文件名进行过滤 例如,只查找.mdf文件返回符合过滤条件的文件否则返回null
 * @returns {array}  返回根据文件创建日期升序排列的文件名
 */
function getAllFilesByDir(dir, filterFileCallback) {

  if(!fs.existsSync(dir)) {
   const errorMsg = '目录' + dir + '不存在'
    logger.error.error(errorMsg);
    throw Error(errorMsg);
  }
  
  //递归遍历所有文件夹和文件
  // param1:路径  param2:将结果存储到该数组中
  function recurveDirAllfiles(path, fileList = [], filterFileCallback) { 	// 结果将存储到fileList数组中
    let filesArr = fs.readdirSync(path);     // 获取目录下所有文件
    filesArr.forEach(item => {
      const stat = fs.statSync(path + "\\" + item);
      if (stat.isDirectory()) { //如果是文件夹
        recurveDirAllfiles(path + '\\' + item, fileList, filterFileCallback);
      } else if (stat.isFile()) {  // 如果是文件
        const fileName = path + '\\' + item;
        if (filterFileCallback && filterFileCallback instanceof Function) {
          const filterFileName = filterFileCallback(fileName);
          if (filterFileName) {
            fileList.push({ fileName: filterFileName, stat: stat });
          }
        } else {
          fileList.push({ fileName, stat: stat });
        }
      }
    })
    return fileList;
  }

  let allFiles = [];
  try {
    allFiles = recurveDirAllfiles(dir, fileList = [], filterFileCallback);
  } catch (error) {
    logger.error.Error('获取文件失败:'+ error.message);
    throw error;
  }

  //根文件创建日期升序排列文件名
  const storeFiles = _.sortBy(allFiles, (item) => {
    return item.stat.birthtimeMs;
  });

  logger.info.info('获取附加文件名称列表成功!   获取到的文件总数是 ' + allFiles.length + ' 个文件 \n');
  logger.info.info('获取附加目录的文件列表信息:');
  storeFiles.forEach(item => logger.info.info(item.fileName)); 
  return storeFiles;
}

module.exports = {getAllFilesByDir}