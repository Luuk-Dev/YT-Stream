function _validate(_url){
    if(typeof _url !== 'string') return false;
    try {
        return new URL(_url);
    } catch {
        return false;
    }
}

module.exports = _validate;