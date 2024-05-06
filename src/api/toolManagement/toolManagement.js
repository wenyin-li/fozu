import request from '@/utils/request'

// 工具列表
export function queryList(data) {
  return request({
    url: '/tool/queryList',
    method: 'post',
    data: data
  })
}

// 新增修改工具
export function insertOrUpdate(data) {
  return request({
    url: '/tool/insertOrUpdate',
    method: 'post',
    data: data
  })
}

// 删除工具
export function batchDelete(data) {
  return request({
    url: '/tool/batchDelete',
    method: 'post',
    data: data
  })
}

// 所有工具列表
export function queryToolNameListAll(data) {
  return request({
    url: '/tool/queryToolNameListAll',
    method: 'post',
    data: data
  })
}

// 提示工具列表
export function queryToolTipsList(data) {
  return request({
    url: '/tool/queryToolTipsList',
    method: 'post',
    data: data
  })
}

// 提示工具删除
export function batchDeleteToolTips(data) {
  return request({
    url: '/tool/batchDeleteToolTips',
    method: 'post',
    data: data
  })
}

// 提示工具新增
export function insertToolTipsOrUpdate(data) {
  return request({
    url: '/tool/insertToolTipsOrUpdate',
    method: 'post',
    data: data
  })
}
