const RequestIp = require('@supercharge/request-ip')
const GeoIp = require('geoip-lite')

module.exports = async (req, res, next) => {

    const ip = RequestIp.getClientIp(req)
    
    req.geo = GeoIp.lookup(ip) || { city: '', country: '' }

    next()

}