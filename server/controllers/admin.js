const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

const RSA_PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../' , 'keys') + '/private.key','utf8');

const User = require('../models/admin');


exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    // required to generate hashed password
    /*bcrypt
    .hash(password, 12)
    .then(hashedpw => {
      console.log(hashedpw);
    });*/
    User.findOne({ username: email })
        .then(user => {
            if (!user) {
                /*const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error;*/
                res.status(401).json({message: 'Wrong Username/Password'});
                throw new Error('Wrong Username/Password');
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                /*const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;*/

                res.status(401).json({message: 'Wrong Username/Password'});
                return;
            }
            /*const token = jwt.sign({
                    email: loadedUser.username,
                    userId: loadedUser._id.toString()
                },
                'somesupersecretsecret', { expiresIn: '1h' }
            ); */
            
            const token = jwt.sign({
                uname: loadedUser.username,
                role: 'admin'
            }, RSA_PRIVATE_KEY, {algorithm: 'RS256', expiresIn: '1h'});
            res.status(200).json({ token: token });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};