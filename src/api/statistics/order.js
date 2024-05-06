import request from '@/utils/request'

// 查询订单列表
export function queryListCountOrderData(data) {
  return request({
    url: '/countData/queryListCountOrderData',
    method: 'post',
    data: data
  })
}

// 订单日期统计数据列表
export function queryListCountOrderDataDate(data) {
  return request({
    url: '/countData/queryListCountOrderDataDate',
    method: 'post',
    data: data
  })
}

// 订单渠道统计数据列表
export function queryListCountOrderDataChannel(data) {
  return request({
    url: '/countData/queryListCountOrderDataChannel',
    method: 'post',
    data: data
  })
}
