import request from '@/utils/request'

// 查询书籍列表
export function selectSakyamuniBookList(data) {
  return request({
    url: '/sakyamuni/selectSakyamuniBookList',
    method: 'post',
    data: data
  })
}

// 新增佛祖
export function insertOrUpdate(data) {
    return request({
      url: '/sakyamuni/insertOrUpdate',
      method: 'post',
      data: data
    })
  }

// 删除佛祖
export function deleteSakyamuniBook(data) {
    return request({
      url: '/sakyamuni/deleteSakyamuniBook',
      method: 'post',
      data: data
    })
  }
