function sendError(res,status,error,message){
    const body = { error };
    if(message){
        body.message = message;
    }
    return res.status(status).json(body);
}

module.exports = { sendError } ;

