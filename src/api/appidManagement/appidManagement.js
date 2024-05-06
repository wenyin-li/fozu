import request from '@/utils/request'

// appid查询
export function queryListCountPageSourceAppid(data) {
  return request({
    url: '/countData/queryListCountPageSourceAppid',
    method: 'POST',
    data: data
  })
}

// appid查询所有
export function getListAllCountPageSourceAppid(data) {
  return request({
    url: '/countData/getListAllCountPageSourceAppid',
    method: 'get',
    params: data
  })
}

// appid查询新增编辑
export function insertOrUpdateCountPageSourceAppid(data) {
  return request({
    url: '/countData/insertOrUpdateCountPageSourceAppid',
    method: 'post',
    data: data
  })
}

