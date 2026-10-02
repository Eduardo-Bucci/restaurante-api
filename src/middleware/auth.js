const jwt = require("jsonwebtoken")

function auth(req, res, next){

    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({
            mensagem:"token não informado"
        })
    }
    const token = authHeader.split(" ")[1]

    try{
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.usuarios = decoded
        next()
    }
    catch(erro){
        console.log(erro)
        return res.status(401).json({
            mensagem: "token inválido"
        })
    }
}


module.exports = auth