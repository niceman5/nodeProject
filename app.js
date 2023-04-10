const express = require("express");
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv')
const path = require("path");

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3000);

// app.get('/', (req, res)=> {
//     res.send('Hello Express');
// })

app.use(morgan('dev'))      //로그를 남김

// 정적 파일제공에 사용함
// public폴더를 정적파일 제공 폴더로 지정. css나 js나 html, 이미지를 넣으면 브라우져에서 접근가능함
app.use('/', express.static(path.join(__dirname, 'public')))    

//body-parser 
//body-parser의 일부기능들이 express에 내장되어 바로 사용가능함
app.use(express.json())
app.use(express.urlencoded({ extended : false }))

// cookie를 해석해 req.cookie객체로 만듬
app.use(cookieParser(process.env.COOKIE_SECRET))

//세션관리용 미들웨어
app.use(session({
    resave:false,       //요청이 올때마다 세션 수정사항이 없어도 세션 다시 저장할지
    saveUninitialized:false,    //세션에 저장할 내용이 없어도 처음부터 생성할지
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false
    },
    name:'session-cookie'
}))

// 파일 업로드를 위해 사용함 
const multer = require("multer")
const fs = require("fs");

try {
    fs.readdirSync('uploads')
} 
catch (error) {
    console.error('uploads폴더가 없어 uploads폴더를 생성합니다.')
    fs.mkdirSync('uploads')
}

const upload = multer({
    storage:multer.diskStorage({
        destination(req, file, done){
            done(null, 'uploads/')
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits : { fileSize : 5 * 1024 * 1024 },    
});
app.get('/upload', (req, res)=>{
    res.sendFile(path.join(__dirname, 'multipart.html'));
})
app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file)
    res.send('ok');
})

// app.use((req, res, next) => {
//     console.log('모든 요청에 실행됩니다.')
//     next()
// })

// app.get('/', (req, res)=> {
//     res.sendFile(path.join(__dirname, '/index.html'))
// })

app.get('/', (req, res, next)=> {
    console.log('GET / 요청에서만 실행됩니다.')
    next();
}, (req, res) => {
    throw new Error("에러는 에러처리 미들웨어로 갑니다.")
})
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send(err.message);
})

app.listen(app.get('port'), ()=> {
    console.log(app.get('port'), '번 포트에서 대기중');
})
