const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const port = 3000;

// MongoDB connection URI using MongoClient
// const uri = 'mongodb://127.0.0.1:27017/Fahman';
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Fahman';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connecting to MongoDB using Mongoose
app.use(express.static('public'));// const express = require('express');
const MongoDBURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/testDB';
mongoose.connect(MongoDBURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// const bodyParser = require('body-parser');
// const { MongoClient } = require('mongodb');
// const session = require('express-session');

// const app = express();
// const port = 3000;

// // MongoDB connection URI
// // const uri = 'mongodb://localhost:27017/Fahman';
// const uri = 'mongodb://127.0.0.1:27017/Fahman'


// // Connect to MongoDB
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true
// }));

// app.use(express.static('public'));

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.username) {
        res.redirect('/login.html');
    } else {
        next();
    }
};

app.post('/sign_up', async (req, res) => {
    const { fname, username, email, password, phone, dob, gpa,rank } = req.body;

    app.post('/check_username', async (req, res) => {
        const { username } = req.body;
    
        try {
            // await client.connect();
            // const database = client.db('Fahman');
            const collection = database.collection('Fahman');
            const existingUser = await collection.findOne({ username });
    
            res.json({ exists: !!existingUser });
    
    
        } catch (error) {
            console.error('Error checking username:', error);
            res.status(500).json({ error: 'Error checking username: ' + error.message });
        } finally {
            // await client.close();
            // console.error('Error checking username:', error);
            // console.error('Error checking username:', error);
            // res.status(500).json({ error: 'Error checking username: ' + error.message });
    
        }
    });

    const data = {
        "name": fname,
        "email": email,
        "username": username,
        "password": password,
        "DOB": dob,
        "phone": phone,
        "gpa": gpa,
        "rank":rank
    };
    
    try {
        await client.connect();
        const database = client.db('Fahman');
        const collection = database.collection('details');

        await collection.insertOne(data);
        console.log("Record inserted Successfully");
        res.redirect('/signup_success.html');
        console.log(`User registered:
        Name: ${fname},
        Email: ${email},
        Password: ${password},
        Phone: ${phone},
        GPA: ${gpa},
        Date of Birth: ${dob},
        Rank: ${rank}`);
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        await client.connect();
        const database = client.db('Fahman');
        const collection = database.collection('details');

        const user = await collection.findOne({ "username": username, "password": password });

        if (user) {
            req.session.username = user.username;
            res.redirect('/userDetails.html');
        } else {
            res.redirect('/login.html');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});



app.get('/userDetails.html', requireLogin, async (req, res) => {
    try {
        await client.connect();
        const database = client.db('Fahman');
        const collection = database.collection('details');

        const userDetails = await collection.findOne({ username: req.session.username });

        if (!userDetails) {
            res.status(404).send('User details not found');
            return;
        }

        // Render the userDetails.ejs template with user-specific details
        res.render('userDetails', { userDetails });
    } catch (error) {
        console.error('Error retrieving user details:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout failed:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/login.html');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
