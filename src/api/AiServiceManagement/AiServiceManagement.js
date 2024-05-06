import request from '@/utils/request'

// 分类查询
export function queryAdminImageRecordList(data) {
  return request({
    url: '/aIAdminService/queryAdminImageRecordList',
    method: 'post',
    data: data
  })
}

// 分类删除
export function queryAdminNovelList(data) {
  return request({
    url: '/aIAdminService/queryAdminNovelList',
    method: 'post',
    data: data
  })
}

// 新增修改分类
export function getAdminNovelDetail(data) {
  return request({
    url: '/aIAdminService/getAdminNovelDetail',
    method: 'get',
    params: data
  })
}

