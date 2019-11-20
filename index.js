// Original on prem version by Abel Sanchez
// Updated by John R Williams to call AWS Lambda Functions
// This uses an Express Web Server to call the AWS API Gateway 
// The Gateway passes requests to Lambda Functions which Update DynamoDB DataBase

var express = require('express');
var app = express();
var cors = require('cors');

const fetch = require('node-fetch');

const url = 'https://1ym90d86f3.execute-api.us-east-1.amazonaws.com/prod/items';

// used to serve static files from public directory
app.use(express.static('public'));
accounts = [];

var audit = function (action, amount) {
    var record = {
        action: action,
        amount: amount,
        timestamp: new Date()
    };
    return record;
};


app.get('/account/create/:name/:email/:password', function (req, res) {
    var record = {
        "email": req.params.email,
        "name": req.params.name,
        "password": req.params.password,
        "balance": "0.0"
    };
    postAllAsync(res, record);

});
/*
app.get('/account/login/:email/:password', function (req, res) {
    var data = [];
    getAllAsync().then(function (response) {
        item = response.find(function (item) {
            if (item.email == req.params.email) return item;
            else return null;
        });
        if (item != null) {
            console.log('got record:' + JSON.stringify(item))
            res.send(JSON.stringify(item));
        }
    }).catch((err) => {
        res.send('failed:' + err)
    })
    console.log('Login OK');
});
*/
app.get('/account/get/:email', function (req, res) {
    var theAccount = getAccount(res, req.params.email);

});

app.get('/account/deposit/:email/:amount', function (req, res) {

    var amount = Number(req.params.amount);
    account = accounts.filter((item) => {
        if (item.email == req.params.email) return item;
    });
    if (account.length > 0) {
        theAccount = account[0];
    } else console.log("Error in deposit - no user identified");
    var dollars = Number(theAccount.balance) + amount;
    theAccount.balance = dollars;
    var record = {
        "balance": dollars
    };
    patchAllAsync(res, theAccount.itemId, record).then(function (response) {}).catch((err) => {
        console.log("error:" + err);
    });
});

app.get('/account/withdraw/:email/:amount', function (req, res) {
    account = accounts.filter((item) => {
        if (item.email == req.params.email) return item;
    });
    if (account.length > 0) {
        theAccount = account[0];
    } else console.log("Error in deposit - no user identified");

    var amount = Number(req.params.amount);
    var dollars = Number(theAccount.balance) - amount;
    theAccount.balance = dollars;
    var record = {
        "balance": dollars
    };
    patchAllAsync(res, theAccount.itemId, record).then(function (record) {}).catch((err) => {
        console.log("error:" + err);
    })
})

app.get('/account/transactions/:email', function (req, res) {
    var theAccount = getAccount(res, req.params.email);
});

app.get('/account/all', function (req, res) {
    var theAccounts = getAccount(res);
    //res.send(theAccounts);
});
//   These are the workhourse calls to the AWS API
// update accounts locally
async function getAccount(res, email = "") {

    var theAccount = null;
    if (email != "") {
        var account = accounts.filter((item) => {
            if (item.email == email) return item;
        });
        if (account.length > 0) {
            theAccount = account[0];
        } else console.log("Error  - no user identified");
    }
    var urlid = url;
    if (theAccount != null) urlid = url + theAccount.itemId;
    trresponse = await fetch(urlid);
    const json = await response.json();
    console.log("json:" + JSON.stringify(json));
    res.send(json);
    accounts = [];
    item = json.filter(function (item) {
        accounts.push(item);
        return item.email == email;
    });

}

async function postAllAsync(res, record) {
    try {
        const response = await fetch(url, {
            method: 'POST', // or 'PUT'
            mode: 'no-cors',
            "Access-Control-Allow-Credentials": true,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        const json = await response.json();
        console.log(JSON.stringify(json));
        res.send(json);
    } catch (error) {
        console.log(error);
    }
}
async function patchAllAsync(res, id, record) {
    try {
        var urlid = url + id;
        const response = await fetch(urlid, {
            method: 'PATCH', // or 'PUT'
            mode: 'no-cors',
            "Access-Control-Allow-Credentials": true,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        })
        const json = await response;
        console.log(JSON.stringify(json));
        res.send(json);
    } catch (error) {
        console.log("172:" + error);
    }
}

// fire this to test async await
async function Test() {
    var url = "https://11jskt4u1d.execute-api.us-east-1.amazonaws.com/prod/items/"
    try {
        const response = await fetch(url);
        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.log(error);
    }
}

var port = 3000;
app.listen(port);
console.log('Running on port: ' + port);