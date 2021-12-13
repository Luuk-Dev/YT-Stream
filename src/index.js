module.exports = {
    validateURL: require('./validate.js').validateURL,
    validateID: require('./validate.js').validateID,
    getInfo: require('./info.js').getInfo,
    getID: require('./convert.js').getID,
    getURL: require('./convert.js').getURL,
    stream: require('./stream/createstream.js').stream,
    search: require('./search/index.js').search
}
