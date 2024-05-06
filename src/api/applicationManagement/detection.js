import request from '@/utils/request'

// 查询发现列表
export function queryList(data) {
  return request({
    url: '/application/queryList',
    method: 'post',
    data: data
  })
}

// 新增修改发现
export function insertOrUpdate(data) {
  return request({
    url: '/application/insertOrUpdate',
    method: 'post',
    data: data
  })
}

// 删除发现
export function batchDelete(data) {
  return request({
    url: '/application/batchDelete',
    method: 'post',
    data: data
  })
}

