const fs = require('fs');
const path = require('path');
const readLine = require('readline');
const { Users, sequelize } = require('../models/users');
const EventEmitter = require('events');
const databaseEmitter = new EventEmitter();

// exporting all common packages needed 
module.exports = {
    fs,
    path,
    readLine,
    Users,
    sequelize,
    databaseEmitter
};
