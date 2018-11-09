/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Convert logs to colorful html
 * v0.1 - 2016-12-07
 * @author Zhangpc
 */

export function ecma48SgrEscape(str) {
  // \033表示\e
  // ([0-9]{1,2})表示param，且捕获param值
  // (?:;([0-9]{1,2}))*表示0或多个‘;param’，且捕获param值，(?:regexp)表示不捕获regexp的值
  const re = /\033\[([0-9]{1,2})(?:;([0-9]{1,2}))*m/
  re.compile(re)

  // 查找sgr序列
  let i = str.search(re)
  let ret = ''
  while (i >= 0) {
    ret += str.substr(0, i)
    str = str.substr(i)
    // 获取匹配结果，matched[0]为sgr序列，其余为param
    const matched = str.match(re)
    if (_is_valid_sgr(matched)) {
      // 查找下一处sgr序列
      str = str.substr(matched[0].length)
      i = str.search(re)
      let text
      if (i >= 0) {
        // 如找到下一个sgr序列，则将两序列之间的字符串转译
        text = str.substr(0, i)
        // 待转译字符串定位到下一个序列的起始位置
        str = str.substr(i)
        i = 0
      } else {
        // 如果未找到，则转译剩余字符串
        text = str
      }
      // 转译字符串
      ret += _escape_sgr_str(matched, text)
    } else {
      // 如果为无效的sgr序列，则当做普通文本处理，继续查找下一处sgr
      ret += str.substr(0, matched[0].length)
      str = str.substr(matched[0].length)
      i = str.search(re)
    }
  }
  if (str.length > 0) {
    ret += str
  }
  return ret
}

function _escape_sgr_str(matched, text) {
  // 暂时只支持加粗和字体颜色
  for (let i = 1; i < matched.length; i++) {
    switch (matched[i]) {
      case '1':
        text = text.bold() // 加粗
        break
      case '30':
        text = text.fontcolor('Gray') // 由于使用黑色背景，这里将黑色显示为灰色
        break
      case '31':
      case '91':
        // 91在混淆的日志中出现过，shell显示为红色，但在man中未找到相关说明。在此做特殊处理。
        text = text.fontcolor('Red')
        break
      case '32':
        text = text.fontcolor('Green')
        break
      case '33':
        text = text.fontcolor('Yellow') // 棕色显示为黄色
        break
      case '34':
        text = text.fontcolor('#0080FF') // 蓝色显示为浅蓝
        break
      case '35':
        text = text.fontcolor('Magenta')
        break
      case '36':
        text = text.fontcolor('Cyan')
        break
      case '37':
        text = text.fontcolor('White')
        break
      default:
        text = text.fontcolor('White')
    }
  }
  return text
}

function _is_valid_sgr(matched) {
  if (matched.length === 3 && !matched[2]) {
    // \e[0m 这种情况
    return _is_valid_sgr_param(matched[1])
  }
  for (let i = 1; i < matched.length; i++) {
    if (_is_valid_sgr_param(matched[i]) === false) {
      return false
    }
  }
  return true
}

// param   result
// 0       reset all attributes to their defaults
// 1       set bold
// 2       set half-bright (simulated with color on a color display)
// 4       set  underscore (simulated with color on a color display)
//        (the colors used to simulate dim  or  underline  are  set
//        using ESC ] ...)
// 5       set blink
// 7       set reverse video
// 10      reset  selected mapping, display control flag, and toggle
//        meta flag (ECMA-48 says "primary font").
// 11      select null mapping, set display control flag, reset tog‐
//        gle meta flag (ECMA-48 says "first alternate font").
// 12      select null mapping, set display control flag, set toggle
//        meta flag (ECMA-48 says "second  alternate  font").   The
//        toggle meta flag causes the high bit of a byte to be tog‐
//        gled before the mapping table translation is done.
// 21      set normal intensity (ECMA-48 says "doubly underlined')
// 22      set normal intensity
// 24      underline off
// 25      blink off
// 27      reverse video off
// 30      set black foreground
// 31      set red foreground
// 32      set green foreground
// 33      set brown foreground
// 34      set blue foreground
// 35      set magenta foreground
// 36      set cyan foreground
// 37      set white foreground
// 38      set underscore on, set default foreground color
// 39      set underscore off, set default foreground color
// 40      set black background
// 41      set red background
// 42      set green background
// 43      set brown background
// 44      set blue background
// 45      set magenta background
// 46      set cyan background
// 47      set white background
// 49      set default background color
function _is_valid_sgr_param(str) {
  const num = parseInt(str)
  if ((num >= 0 && num <= 2)
    || (num >= 10 && num <= 12)
    || (num >= 30 && num <= 47)
    || num === 4 || num === 5 || num === 7 || num === 21 || num === 22
    || num === 24 || num === 25 || num === 27 || num === 49 || num === 91) {
    return true
  }
  return false
}
