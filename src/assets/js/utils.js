// utils.js

function NoDot(val){
    return val.replace('.', '_');
};


function CamelToSnake(val){
    return val.replace(/(.)([A-Z][a-z]+)/g, '$1_$2').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
};
