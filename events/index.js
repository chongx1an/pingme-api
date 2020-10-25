module.exports = io => {

    io.on('connection', socket => {

        require('./chat')(io, socket)

    })

}