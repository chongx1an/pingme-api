Object.prototype.toQuery = () => {

    let queryString = ''

    for(let key in this) {
        queryString += `${key}=${this[key]}`
    }

    return queryString

}