import request from '@/utils/request'

// 查询页面统计数据列表
export function queryListCountPageData(data) {
  return request({
    url: '/countData/queryListCountPageData',
    method: 'post',
    data: data
  })
}

// 新增或者修改页面统计配置信息
export function insertOrUpCountPageConfig(data) {
  return request({
    url: '/countData/insertOrUpCountPageConfig',
    method: 'post',
    data: data
  })
}

// 查询页面统计配置信息列表
export function queryListCountPageConfig(data) {
  return request({
    url: '/countData/queryListCountPageConfig',
    method: 'post',
    data: data
  })
}

// 统计类型
export function selectAllCountPageType(data) {
  return request({
    url: '/countData/selectAllCountPageType',
    method: 'post',
    data: data
  })
}


// 页面日期类型
export function queryListCountPageDataDate(data) {
  return request({
    url: '/countData/queryListCountPageDataDate',
    method: 'post',
    data: data
  })
}

// 页面渠道类型
export function queryListCountPageDataChannel(data) {
  return request({
    url: '/countData/queryListCountPageDataChannel',
    method: 'post',
    data: data
  })
}


