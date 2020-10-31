module.exports = app => {

    app.request.requirePermit = function(requires, permits = []) {

        let params = {
            ...this.query,
            ...this.params,
            ...this.body,
        }

        let missingKeys = []

        requires.forEach(key => {
            if(!(key in params)) {
                missingKeys.push(key)
            }
        })

        if(missingKeys.length) {
            throw new Error('Parameter error: [' + missingKeys.map(key => `"${key}"`).join(', ') + '] is required')
        }

        permits = requires.concat(permits)

        for(let key in params) {
            if(!permits.includes(key)) {
                delete params[key]
            }
        }

        return params

    }

    app.response.success = function(data) {

        return this.json({
            success: true,
            ...data,
        })
        
    }

    app.response.error = function(error, status = 500) {

        if(typeof error == "string") {

            error = {
                code: error,
                message: error.split('_').join(' ').uppercamelize(),
            }

        }

        return this.status(status).json({ error })

    }

}