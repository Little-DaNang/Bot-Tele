const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');
const POINTS_PATH = path.join(__dirname, '../../data/points.json');

let dbCache = null;
let pointsCache = null;

function readDB() {
  if (dbCache) return dbCache;
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    dbCache = JSON.parse(data);
    return dbCache;
  } catch (err) {
    dbCache = { groups: [] };
    return dbCache;
  }
}

function writeDB(db) {
//  console.log('Writing DB:', db);
  dbCache = db;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function addGroup(group) {
  const db = readDB();
  if (db.groups.find(g => g.chatId === group.chatId)) return false;
  db.groups.push(group);
  writeDB(db);
  return true;
}

function removeGroup(chatId) {
  const db = readDB();
  const idx = db.groups.findIndex(g => g.chatId === chatId);
  if (idx === -1) return false;
  db.groups.splice(idx, 1);
  writeDB(db);
  return true;
}

function enableGroup(chatId, enable = true) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  group.enable = enable;
  writeDB(db);
  return true;
}

function setEnable(chatId, enable) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  group.enable = enable;
  writeDB(db);
  return true;
}

function addAdmin(chatId, adminId) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  if (!group.admins.includes(adminId)) group.admins.push(adminId);
  writeDB(db);
  return true;
}
function isAdmin(chatId, userId) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  return group.admins.includes(userId);
}
function removeAdmin(chatId, adminId) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  group.admins = group.admins.filter(id => id !== adminId);
  writeDB(db);
  return true;
}

function addRule(chatId, rule) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  if (!group.rules.includes(rule)) group.rules.push(rule);
  writeDB(db);
  return true;
}

function removeRule(chatId, rule) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  group.rules = group.rules.filter(r => r !== rule);
  writeDB(db);
  return true;
}

function readPoints() {
  if (pointsCache) return pointsCache;
  try {
    const data = fs.readFileSync(POINTS_PATH, 'utf8');
    pointsCache = JSON.parse(data);
    return pointsCache;
  } catch (err) {
    pointsCache = { groups: [] };
    return pointsCache;
  }
}

function writePoints(points) {
  pointsCache = points;
  fs.writeFileSync(POINTS_PATH, JSON.stringify(points, null, 2), 'utf8');
}

function addPoint(chatId, username, point) {
  const points = readPoints();
  let group = points.groups.find(g => g.chatId === chatId);
  if (!group) {
    group = { chatId, members: [] };
    points.groups.push(group);
  }
  const memberIdx = group.members.findIndex(m => Object.keys(m)[0] === username);
  if (memberIdx !== -1) {
    group.members[memberIdx][username] = point;
  } else {
    group.members.push({ [username]: point });
  }
  writePoints(points);
  return true;
}

function removePoint(chatId, username) {
  const points = readPoints();
  const group = points.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  const origLen = group.members.length;
  group.members = group.members.filter(m => Object.keys(m)[0] !== username);
  if (group.members.length === origLen) return false;
  writePoints(points);
  return true;
}

function isEnable(chatId) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return false;
  return !!group.enable;
}

function getRules(chatId) {
  const db = readDB();
  const group = db.groups.find(g => g.chatId === chatId);
  if (!group) return [];
  return group.rules || [];
}

function getGroup(chatId) {
  const db = readDB();
  return db.groups.find(g => g.chatId === chatId) || null;
}

function getPoints(chatId) {
  const points = readPoints();
  const group = points.groups.find(g => g.chatId === chatId);
  if (!group) return [];
  return group.members || [];
}

function setModel(chatId, model) {
  const db = readDB();
  //update value db.model
  db.model = model;
  writeDB(db);
  return true;
}
const modelDefault = 'gpt-5.1';
function getModel() {
  const db = readDB();
  // For simplicity, return default model db.model
  return db.model || modelDefault;
}

module.exports = {
  addGroup,
  removeGroup,
  enableGroup,
  isAdmin,
  addAdmin,
  removeAdmin,
  addRule,
  removeRule,
  readDB,
  writeDB,
  addPoint,
  removePoint,
  readPoints,
  writePoints,
  setEnable,
  isEnable,
  getRules,
  getGroup,
  getPoints,
  setModel,
  getModel
};
