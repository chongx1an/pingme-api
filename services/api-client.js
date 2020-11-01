const { default: Axios } = require('axios')

const axios = Axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
})

const get = (url, params) => axios.get(url, { params })
const post = (url, params) => axios.post(url, params)
const put = (url, params) => axios.put(url, params)
const del = (url) => axios.delete(url)

module.exports = {
    get,
    post,
    put,
    del,
}