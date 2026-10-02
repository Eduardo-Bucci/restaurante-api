require("dotenv").config()
const express = require("express")
const cors = require("cors")
const db = require("./config/database")

const jwt = require ("jsonwebtoken")

const auth = require("./middleware/auth")

const app = express()

const PORT = 3001

app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.json({
        mensagem:"API funcionando"
    })
})

app.post("/login", async (req, res) => {
    const {email, senha} = req.body

    try{
        const [usuarios] = await db.query(
            'SELECT * FROM usuario WHERE email = ?',
            [email]
        )
        const usuario = usuarios[0]
        if(usuario.length === 0){
            return res.status(401).json({mensagem:"Email ou senha não encontrados"})
        }

        if(usuario.senha !== senha){
            return res.status(401).json({
                mensagem:"Email ou senha inválidos"
            })
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )

        res.json({
            token
        })
    
    }catch(error){
        console.log(error)
    }

})


app.get("/produtos", auth, async(req,res)=>{

    try {
        const [produtos]= await db.query(
            "SELECT * from produtos"
        )
        res.status(200).json(produtos)
    } catch (error) {
        console.log(error)
    }

})




app.post("/produtos", async (req, res) => {
    try {
        const { descricao, categoria, preco, imagem } = req.body;

        const sql = `
            INSERT INTO produtos (descricao, categoria, preco, imagem)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            descricao,
            categoria,
            preco,
            imagem
        ]);

        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso",
            produto: {
                id: result.insertId,
                descricao,
                categoria,
                preco,
                imagem
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao cadastrar produto"
        });
    }
});

app.delete("/produtos/:id",async(req,res)=>{
    try {
        const {id} = req.params
        await db.query("DELETE FROM produtos WHERE id = ?", [id])
        res.json({mensagem:"Produto deletado com sucesso"})
    } catch (error) {
        console.log(error)
        res.json({
            erro: "Erro ao deletar o produto"
        })
    }
})


app.listen(PORT, ()=>{
    console.log("Servidor rodando na porta 3001")
})