# log4js-desensitization

## log4js 日志脱敏 desensitization

# nodejs版本 v18.19.0

# 启动命令

## "start": "node lunch.js" 不开启日志脱敏

## "start:d": "cross-env desensitizationFlag=1 node lunch.js" 开启日志脱敏

# TODO-LIST

## 1. 目前脱敏规则两种 根据字段配置脱敏规则
### 1.1 长度大于2 保留第一个字符和最后一个字符 其余的全部脱敏
### 1.2 长度小于大于2 全部脱敏

## 2. 如果是新项目 拒绝直接打印字符串 全部要求 {} 类型进行 防止字符串识别不出来 脱敏不彻底
## 3. 匹配脱敏规则的正则确保万无一失
## 4. 加入单元测试 将脱敏方法弄成npm包
## 6. 支持 winston

