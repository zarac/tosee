module.exports = {
    res_json : function(res, obj) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(obj));
    }
};
