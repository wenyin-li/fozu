import request from '@/utils/request'

// 查询推送列表
export function queryList(data) {
  return request({
    url: '/usersBindPushTask/queryList',
    method: 'post',
    data: data
  })
}

// 启用停用推送用户任务
export function updateStopOrStart(data) {
  return request({
    url: '/usersBindPushTask/updateStopOrStart',
    method: 'post',
    data: data
  })
}

// 新增修改推送
export function insertOrUpdate(data) {
  return request({
    url: '/usersBindPushTask/insertOrUpdate',
    method: 'post',
    data: data
  })
}
