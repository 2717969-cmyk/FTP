const fs = require('fs');
const path = require('path');

function getFilePath(filename) {
    return path.join(__dirname, 'data', filename);
}

function readJSON(filename) {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) return {};
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '{}');
}

function writeJSON(filename, data) {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJSON, writeJSON, getFilePath };