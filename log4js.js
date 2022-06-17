const log4js = require('log4js');
log4js.configure({
    appenders: {
        allFileOut: { type: "file", filename: "./log/allLog.log" },
        filterDataFileOut: {
            type: "dateFile",
            filename: "./log/filterError.log",
            pattern: "yyyy-MM-dd-hh-mm", // "yyyy-MM-dd-hh-mm-ss",
            alwaysIncludePattern: true,
            numBackups: 2
        },
        filterErrors: { type: 'logLevelFilter', appender: 'filterDataFileOut', level: 'error' },
        infoDataFileOut: {
            type: "dateFile",
            filename: "./log/info.log",
            pattern: "yyyy-MM-dd-hh-mm",
            alwaysIncludePattern: true,
            numBackups :2
        },
        errorDataFileOut: {
            type: "dateFile",
            filename: "./log/error.log",
            pattern: "yyyy-MM-dd-hh-mm",
            alwaysIncludePattern: true,
            numBackups:2
        },
        exceptionDataFileOut: {
            type: "dateFile",
            filename: "./log/exception.log",
            pattern: "yyyy-MM-dd-hh-mm",
            alwaysIncludePattern: true,
            numBackups:2
        },
        consoleOut: {
            type: "stdout",
            layout: {
                type: 'pattern',
                pattern: '%p %d{yyyy/MM/dd-hh.mm.ss.SSS} %c %m%n - '
            }
        },
    },
    categories: {
        default: { appenders: ["consoleOut"], level: "debug" },
        console: { appenders: ["consoleOut"], level: "debug" },
        error: { appenders: ["errorDataFileOut"], level: "debug" },
        info: { appenders: ["infoDataFileOut"], level: "debug" },
        exception: { appenders: ["exceptionDataFileOut"], level: "debug" },
    }
});

module.exports = {
    log4js,
    default: log4js.getLogger(),
    console: log4js.getLogger('console'),
    error: log4js.getLogger('error'),
    info: log4js.getLogger('info'),
    ex: log4js.getLogger('exception'),
}
