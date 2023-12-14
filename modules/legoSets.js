require('dotenv').config();

import Sequelize, { INTEGER, STRING, Op } from 'sequelize';

//set up sequelize to point to our postgres database
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  }
});

// Theme model

const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: INTEGER,
      primaryKey: true, // use "id" as a primary key
      autoIncrement: true, // automatically increment the value

    },
    name: STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

// Set model

const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: STRING,
      primaryKey: true, // use "set_num" as a primary key
    },
    name: STRING,
    year: INTEGER,
    num_parts: INTEGER,
    theme_id: INTEGER,
    img_url: STRING
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'})

// Note, extra wrapper promises added for simplicity and greater control over error messages

function initialize() { 
  return new Promise(async (resolve, reject) => {
    try{
      await sequelize.sync();
      resolve();
    }catch(err){
      reject(err.message)
    }
  });

}

function getAllSets() {

  return new Promise(async (resolve,reject)=>{
    let sets = await Set.findAll({include: [Theme]});
    resolve(sets);
  });
   
}

function getAllThemes() {

  return new Promise(async (resolve,reject)=>{
    let themes = await Theme.findAll();
    resolve(themes);
  });
   
}

function getSetByNum(setNum) {

  return new Promise(async (resolve, reject) => {
    let foundSet = await Set.findAll({include: [Theme], where: { set_num: setNum}});
 
    if (foundSet.length > 0) {
      resolve(foundSet[0]);
    } else {
      reject("Unable to find requested set");
    }

  });

}

function getSetsByTheme(theme) {

  return new Promise(async (resolve, reject) => {
    let foundSets = await Set.findAll({include: [Theme], where: { 
      '$Theme.name$': {
        [Op.iLike]: `%${theme}%`
      }
    }});
 
    if (foundSets.length > 0) {
      resolve(foundSets);
    } else {
      reject("Unable to find requested sets");
    }

  });

}

function addSet(setData){
  return new Promise(async (resolve,reject)=>{
    try{
      await Set.create(setData);
      resolve();
    }catch(err){
      reject(err.errors[0].message)
    }
  });
}

function editSet(set_num, setData){
  return new Promise(async (resolve,reject)=>{
    try {
      await Set.update(setData,{where: {set_num: set_num}})
      resolve();
    }catch(err){
      reject(err.errors[0].message);
    }
  });
}

function deleteSet(set_num){
  return new Promise(async (resolve,reject)=>{
    try{
      await Set.destroy({
        where: { set_num: set_num }
      });
      resolve();
    }catch(err){
      reject(err.errors[0].message);
    }
   
  });
  
}

export default { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet }
