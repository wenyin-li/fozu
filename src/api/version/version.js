import request from '@/utils/request'

// 查询版本列表
export function queryListAppVersion(data) {
  return request({
    url: '/appVersion/queryListAppVersion',
    method: 'post',
    data: data
  })
}

// 版本新增编辑
export function insertOrUpAppVersion(data) {
  return request({
    url: '/appVersion/insertOrUpAppVersion',
    method: 'post',
    data: data
  })
}
