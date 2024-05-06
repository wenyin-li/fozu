import request from '@/utils/request'

// 渠道类型列表
export function selectChannelType(data) {
  return request({
    url: '/channel/selectChannelType',
    method: 'post',
    data: data
  })
}

// 新增渠道类型
export function insertOrUpChannelType(data) {
  return request({
    url: '/channel/insertOrUpChannelType',
    method: 'post',
    data: data
  })
}

// 渠道列表
export function selectChannel(data) {
  return request({
    url: '/channel/selectChannel',
    method: 'post',
    data: data
  })
}

// 新增渠道
export function insertOrUpChannel(data) {
  return request({
    url: '/channel/insertOrUpChannel',
    method: 'post',
    data: data
  })
}
