const RequestIp = require('@supercharge/request-ip')
const geoip = require('geoip-lite');

module.exports = async (req, res, next) => {

    // ip = RequestIp.getClientIp(req)
    ip = '60.52.31.157'

    geo = geoip.lookup(ip)

    req.ip = ip
    req.geo = geo

    next()

}