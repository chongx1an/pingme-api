module.exports = async (req, res, next) => {

    if('threadTs' in { ...req.body, ...req.params, ...req.query }) {

        // check if thread belongs to the user's workspace
        // return unauthorized if not found

    }

    next()
    
}