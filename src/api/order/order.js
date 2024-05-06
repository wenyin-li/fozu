import request from '@/utils/request'

// 查询订单列表
export function orderAdminList(data) {
  return request({
    url: '/order/orderAdminList',
    method: 'post',
    data: data
  })
}

// 订单类型
export function orderAdminDetail(params) {
  return request({
    url: '/order/orderAdminDetail',
    method: 'get',
    params: params
  })
}
