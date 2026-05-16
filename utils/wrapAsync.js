function wrapAsync(fn){
    return (req, res, next)=>{
        fb(req, res, next).catch(next);
    };
}

module.exports = wrapAsync;