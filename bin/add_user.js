#!/usr/bin/env node

import { docopt } from 'docopt';
import mongoose from '../lib/mongoose';

const User = mongoose.model('User');

const doc =
`Usage:
   add_user.js --email=<email> --password=<password> [--name=<name>] [--drop]
   add_user.js -h | --help

Options:
   -h --help                 Show this screen.
   -l --email <email>        Login for new user.
   -p --password <password>  Password for new user.
   -n --name <name>          New user name [default: Admin].
   -d --drop                 Drop database first.
`;

main(docopt(doc));

async function main(opts) {
    const user = new User({
        status   : 'ACTIVE',
        name     : opts['--name'],
        email    : opts['--email'] ? opts['--email'] : 'admin@mail.com',
        password : opts['--password']
    });

    try {
        if (opts['--drop']) {
            await dropAllUsers();
        }

        await user.save();
        console.log('Success!', user);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}

function dropAllUsers() {
    return new Promise((resolve, reject) => {
        return mongoose.connection.collections.users.drop((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}
