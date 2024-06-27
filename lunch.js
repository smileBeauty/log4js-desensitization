const log4js = require("log4js");
const dayjs = require("dayjs");

const desensitizationFlag = !!process.env.desensitizationFlag;

const _toString = Object.prototype.toString;

/**
 * @description 对字符串和数值进行脱敏
 * @param {string|number} originContent 脱敏之前的日志内容
 * @param {string} [mask=*] 脱敏之后填充的符号 默认是 *
 * @returns {string} 脱敏之后的单个字段
 */
const makeItDesensitization = (originContent, mask = "*") => {
  if (["string", "number"].includes(typeof originContent)) {
    const _originContent = `${originContent}`;
    const _length = _originContent.length;
    if (_length > 2) {
      const star = new Array(_originContent.length - 2).fill(mask);
      return `${_originContent.slice(0, 1)}${star.join(
        ""
      )}${_originContent.slice(-1)}`;
    } else {
      return "".padEnd(_length, mask);
    }
  }
  return originContent;
};

/**
 * @description 对json字符串针对敏感信息进行脱敏
 * @param {string} originContent 需要脱敏的json字符串
 * @param {string[]} sensitiveFields 敏感信息字段名
 * @param {string} [mask=*] 脱敏之后填充的符号 默认是 *
 * @returns {string} 脱敏之后的日志内容
 */
function findSensitiveFieldsAndReplace(originContent, sensitiveFields, mask = "*") {
  const regex = new RegExp(
    `"(${sensitiveFields.join("|")})"\\s*:\\s*(?:"([^"]+)"|(\\d+))`,
    "g"
  );
  let matches = [];
  let match;
  while ((match = regex.exec(originContent)) !== null) {
    matches.push({
      field: match[1],
      value: match[2],
      desensitizationValue: makeItDesensitization(match[2], mask),
    });
  }
  let finalContent = originContent;
  matches.forEach((item) => {
    finalContent = finalContent.replace(item.value, item.desensitizationValue);
  });
  return finalContent;
}

/**
 * @description 脱敏的layout 参数和pattern layout一致
 * @param {layoutConfig} _layoutConfig layout的配置
 * @returns {string} 日志内容的最后文言
 */
function desensitizationLayout(_layoutConfig) {
  return function (logEvent) {
    const logContent = logEvent.data.reduce((preVal, curVal) => {
      let _curValStr = curVal;
      if (
        _toString.call(curVal) === "[object Object]" ||
        Array.isArray(curVal)
      ) {
        _curValStr = JSON.stringify(curVal);
      }
      _curValStr = findSensitiveFieldsAndReplace(
        _curValStr,
        _layoutConfig.sensitiveFields,
        _layoutConfig.mask
      );
      const _value = `${preVal} ${_curValStr}`;
      return _value;
    }, "");
    const logTemplate = `${dayjs(logEvent.startTime).format(
      "YYYY-MM-DD HH:mm:ss"
    )} [${logEvent.pid}] ${logEvent.level.levelStr} [${
      logEvent.categoryName
    }] - `;
    return logTemplate + logContent;
  };
}

log4js.addLayout("desensitization", desensitizationLayout);

log4js.configure({
  appenders: {
    app: {
      type: "file",
      filename: `info.log`,
      maxLogSize: 50485760,
      backups: 3,
      layout: {
        type: desensitizationFlag ? "desensitization" : "pattern",
        mask: "*",
        pattern: "%d{yyyy-MM-dd hh:mm:ss,SSS} [%z] %-5p [%c] - %m%n",
        sensitiveFields: ["password"],
      },
    },
    console: {
      type: "console",
      layout: {
        type: desensitizationFlag ? "desensitization" : "pattern",
        mask: "*",
        pattern: "%d{yyyy-MM-dd hh:mm:ss,SSS} [%z] %-5p [%c] - %m%n",
        sensitiveFields: ["password"],
      },
    },
  },
  categories: {
    default: {
      appenders: ["app", "console"],
      level: "info",
    },
  },
});

const logger = log4js.getLogger("default");

// logger.trace("Cheese trace");
// logger.debug("Cheese debug");
// logger.info("Cheese info");
// logger.warn("Cheese warn");
// logger.error("Cheese error");
// logger.fatal("Cheese fatal");

logger.info({ username: "张三", password: "a123456" });
