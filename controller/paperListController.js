const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const urlencodeParser = bodyParser.urlencoded({extended: false});
const {User, Paper} = require("./db");
const ws = require('nodejs-websocket');


module.exports = function (app) {

    // const auth = async (req,res,next) => {
    //     const raw = String(req.headers.authorization).split(' ').pop()
    //     const { id } = jwt.verify(raw, "HAOHAOXUEXI")
    //     req.user = await User.findById(sid)
    //     next()
    // }


    const webSocketServer = ws.createServer((conn)=>{
        console.log("New Connection");
        conn.on('error',function (err) {
            console.log(err)
        })
        conn.on('text',function () {
            
        })
    }).listen(10086);

    function broadcast(str){
        webSocketServer.connections.forEach(function (conn) {
            conn.send(str)
        })
    }

    app.get('/paperlist', async (req, res)=>{
        const papers = await Paper.find();
        res.render('paperlist',{papers:papers})
    });

    app.post('/paperlist/api/login', async (req, res) => {
        const user = await User.findOne({
            name:req.body.name,
            sid:req.body.sid
        });

        if (!user) {
            return res.status(422).send({
                message:"你好像不是这门课的学生。。。"
            })
        }

        const ownedPapers = await Paper.find({
            Owner: user.sid
        });

        const token = jwt.sign({
            id: user.sid
        },"HAOHAOXUEXI");

        return res.status(200).send({
            message:"hello",
            token: token,
            ownedPapers: ownedPapers
        })

    });

    app.post('/paperlist/api/selection', async (req,res)=>{
        const raw = String(req.headers.authorization).split(' ').pop();
        const { id } = jwt.verify(raw, "HAOHAOXUEXI");
        const user = await User.findOne({'sid': id});
        if (!user) {
            return res.status(422).send('你好像还没登陆...')
        }
        else {
            const ownedPaper = await Paper.find({
                Owner : id
            });
            if (ownedPaper.length === 5) {
                return res.status(422).send("你已经选够了...");
            }
            const paper = req.body.paper;
            let foundPaper = await Paper.findOne({'Document Title':paper});
            if(foundPaper.Owner === '') {
                foundPaper.Owner = id;
                foundPaper.save();
                console.log(foundPaper);
                broadcast(JSON.stringify({
                    type:'selection',
                    title:paper
                }))
                return res.status(200).send('选择成功');
            }
            else {
                return res.status(422).send('该论文已经被选了...')
            }
        }
    });

    app.post('/paperlist/api/removal',async (req,res) => {
        const raw = String(req.headers.authorization).split(' ').pop();
        const { id } = jwt.verify(raw, "HAOHAOXUEXI");
        const user = await User.findOne({'sid': id});
        if (!user) {
            return res.status(422).send('你好像还没登陆...')
        }
        else {
            const paper = req.body.paper;
            let foundPaper = await Paper.findOne({'Document Title':paper});
            if(foundPaper.Owner === id ) {
                foundPaper.Owner = '';
                foundPaper.save();
                console.log(foundPaper);
                broadcast(JSON.stringify({
                    type:'removal',
                    title:paper
                }))
                return res.status(200).send('取消成功');
            }
            else {
                return res.status(422).send('这不是你选择的论文..')
            }
        }
    });

    app.post('/paperlist/api/register', async (req, res) => {
        const user = await User.create(req.body);
    });

    app.get('/paperlist/api/users', async (req, res) => {
        const users = await User.find();
        res.send(users)
    });

    app.get('/paperlist/api/papers', async (req, res) => {
        const papers = await Paper.find();
        res.send(papers)
    });


    app.post('/paperlist', urlencodeParser, function (req, res) {
        console.log(req.body);
    })
};