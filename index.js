const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const { render } = require("ejs");
const urlencodedParser = bodyParser.urlencoded({extended: false});
const app = express();
app.set("view engine", "ejs");
app.use(express.static("./public"));

const connection =  mysql.createConnection({
    multipleStatements: true,
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "pastebin"
});

connection.connect((err)=>{
    if(err) throw err;
    console.log("connected to the db");
})
  
app.use(bodyParser.urlencoded({
    extended: true
}))

//P.S. You may use and edit these functions. They are here for a reason :)
function generateUUID(){
    let generate = "";
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    for ( var i = 0; i < length; i++ ) {
        generate += char.charAt(Math.floor(Math.random() * char.length));
    }
    checkExists(generate);
    return generate;
}

function checkExists(code){
    connection.query("SELECT * FROM accounts WHERE uuid = '"+code+"'", (err, response) => {
        if (err) throw err;
        if (response.length > 0){
            return code;
        }else{
            generateUUID();
        }
    })
}

function generateUUIDNotes(){
    let generate = "";
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    for ( var i = 0; i < length; i++ ) {
        generate += char.charAt(Math.floor(Math.random() * char.length));
    }
    checkExistsNotes(generate);
    return generate;
}

function checkExistsNotes(code){
    connection.query("SELECT * FROM notes WHERE uuid = '"+code+"'", (err, response) => {
        if (err) throw err;
        if (response.length > 0){
            return code;
        }else{
            generateUUIDNotes();
        }
    })
}

app.use(session({
    secret: "Ch43y0Vn6Num84W4N",
    saveUninitialized: true,
    resave: true
}));
//write you code here
//Good luck!

app.get("/", (req, res)=>{
    if(req.session.current_user){
        res.redirect('/notes');
    }else{
        res.render('login')
    }
})

app.get("/register", (req, res)=>{
    res.render('register')
})

app.post("/register", (req, res)=>{
    connection.query(`INSERT INTO accounts(uuid, username, password, created) VALUES('`+generateUUID()+`', '`+req.body.username+`', '`+req.body.password+`', now() )`, (err, result)=>{
        if (err) throw err
        res.redirect('/');
    })
    
})

app.post('/login', (req, res)=>{
    console.log(req.body);
    connection.query(`SELECT * FROM accounts WHERE username = '`+req.body.username+`'`, (err, result)=>{

        if (err) throw err

        if (result.length > 0){

            if(result[0].password == req.body.password){
                req.session.current_user = result[0]
            }else{
                req.session.error = "Account Not Found";
            }
            res.redirect('/')

        }else{
            res.redirect('/')
        }
    })
})

app.get("/logout", (req, res)=>{
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
})

app.get("/notes", (req, res)=>{
    if(req.session.current_user){
        connection.query(`SELECT * FROM notes WHERE account_uuid = '`+req.session.current_user.uuid+`'`, (err, result)=>{
            let notes = [];

            result.forEach(element => {
                notes.push(element);
            });
            res.render('notes', {data: notes});
        })
    }else{
        req.session.error = "No Account Logged In"
        res.redirect('/')
    }
})

app.get("/notesContent", (req, res)=>{
    connection.query(`SELECT * FROM notes WHERE uuid = '`+req.query.uuid+`'`, (err, result)=>{
        if(err) throw err;
        let notes = [];

        result.forEach(element => {
            notes.push(element);
        });
        notes[0] = Object.assign({downvote: 0, upvote: 0}, notes[0]);
        connection.query(`SELECT COUNT(*) FROM votes WHERE note_uuid = '`+req.query.uuid+`' AND vote = 'downvote'`, (err, result)=>{
            if(err) throw err
            notes[0].downvote = result[0]['COUNT(*)'];
            connection.query(`SELECT COUNT(*) FROM votes WHERE note_uuid = '`+req.query.uuid+`' AND vote = 'upvote'`, (err, result)=>{
                if(err) throw err
                notes[0].upvote = result[0]['COUNT(*)'];
                res.render('notescontent', {data: notes, session: req.session});
            })
        })
    })
})

app.post("/addnotes", (req, res)=>{
    if(req.session.current_user){
        connection.query(`INSERT INTO notes(uuid, account_uuid, title, content, status, created) VALUES( '`+generateUUIDNotes()+`','`+req.session.current_user.uuid+`', '`+req.body.title+`', '`+req.body.content+`', '`+"active"+`', now() )`, (err, result)=>{
            if (err) throw err
            res.redirect('/notes');
        })
    }else{
        req.session.error = "No Account Logged In"
        res.redirect('/')
    }
}) 

app.post("/update", (req, res)=>{
    if(req.session.current_user){
        connection.query(`UPDATE votes SET  vote = 'upvote', updated = now() WHERE account_uuid = '`+req.session.current_user.uuid+`' AND note_uuid = '`+req.query.uuid+`'`, (err, result)=>{
            if (err) throw err
            res.redirect('/notesContent?uuid='+req.query.uuid);
        })
    }else{
        req.session.error = "No Account Logged In"
        res.redirect('/')
    }
})

app.post("/upvote", (req, res)=>{
    if(req.session.current_user){
        connection.query(`SELECT * FROM votes WHERE account_uuid = '`+req.session.current_user.uuid+`' AND note_uuid = '`+req.query.uuid+`'`, (err, vote)=>{
            if(err) throw err;
            if(vote.length > 0){
                connection.query(`UPDATE votes SET  vote = 'upvote', updated = now() WHERE account_uuid = '`+req.session.current_user.uuid+`' AND note_uuid = '`+req.query.uuid+`'`, (err, result)=>{
                    if (err) throw err
                    res.redirect('/notesContent?uuid='+req.query.uuid);
                })
            }else{
                connection.query(`INSERT INTO votes(note_uuid, account_uuid, vote, created) VALUES('`+req.query.uuid+`', '`+req.session.current_user.uuid+`', 'upvote', now())`, (err, result)=>{
                    if (err) throw err
                    res.redirect('/notesContent?uuid='+req.query.uuid);
                })
            }

        })
    }else{
        req.session.error = "No Account Logged In"
        res.redirect('/')
    }
}) 

app.post("/downvote", (req, res)=>{
    if(req.session.current_user){
        connection.query(`SELECT * FROM votes WHERE account_uuid = '`+req.session.current_user.uuid+`' AND note_uuid = '`+req.query.uuid+`'`, (err, vote)=>{
            if(err) throw err;
            if(vote.length > 0){
                connection.query(`UPDATE votes SET  vote = 'downvote', updated = now() WHERE account_uuid = '`+req.session.current_user.uuid+`' AND note_uuid = '`+req.query.uuid+`'`, (err, result)=>{
                    if (err) throw err
                    res.redirect('/notesContent?uuid='+req.query.uuid);
                })
            }else{
                connection.query(`INSERT INTO votes(note_uuid, account_uuid, vote, created) VALUES('`+req.query.uuid+`', '`+req.session.current_user.uuid+`', 'downvote', now())`, (err, result)=>{
                    if (err) throw err
                    res.redirect('/notesContent?uuid='+req.query.uuid);
                })
            }

        })
    }else{
        req.session.error = "No Account Logged In"
        res.redirect('/')
    }
}) 

app.listen(3000);


