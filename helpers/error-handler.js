function errorHandler (err, req,res,next){
    console.log("error");
    if(err.name == 'UnauthorizedError'){
        return res.status(400).json({message: "User is not authorized"});
    }

    if(err.name == "Validation Error"){
        return res.status(401).json({message: "User validation error"});
    }

    return res.status(500).json({message: "Server error: "+err});
}

module.exports = errorHandler;