const RequestIp = require('@supercharge/request-ip')
const GeoIp = require('geoip-lite')

module.exports = async (req, res, next) => {

    req.ip = RequestIp.getClientIp(req)
    // let ip = '60.52.31.157'

    // if(req.body.ip) {

    //     req.ip = req.body.ip

    // } else {

    //     req.ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
    //     req.connection.remoteAddress || 
    //     req.socket.remoteAddress || 
    //     (req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1')

    // }
    
    req.geo = GeoIp.lookup(req.ip) || { city: '', country: '' }

    next()

}