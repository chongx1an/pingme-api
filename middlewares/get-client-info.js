const RequestIp = require('@supercharge/request-ip')
const GeoIp = require('geoip-lite')

module.exports = async (req, res, next) => {

    // let ip = RequestIp.getClientIp(req)
    let ip = '60.52.31.157'

    // let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
    //     req.connection.remoteAddress || 
    //     req.socket.remoteAddress || 
    //     (req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1')

    let geo = GeoIp.lookup(ip) || { city: '', country: '' }

    req.ip = ip
    req.geo = geo

    next()

}