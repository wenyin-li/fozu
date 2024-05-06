import request from '@/utils/request'

// 分类查询
export function queryCateList(data) {
  return request({
    url: '/category/queryList',
    method: 'post',
    data: data
  })
}

// 分类删除
export function batchDelete(data) {
  return request({
    url: '/category/batchDelete',
    method: 'post',
    data: data
  })
}

// 新增修改分类
export function insertOrUpdate(data) {
  return request({
    url: '/category/insertOrUpdate',
    method: 'post',
    data: data
  })
}

