const mysql = require('mysql');

class Database {
    constructor() {
        // this.host = 'localhost';
        // this.username = 'root';
        // this.password = 'admin';
        // this.database = 'deltaview-lms';
        
        this.host = 'www.deltawebservice.com';
       this.username = 'dwebserv_dwlms';
        this.password = 'Rahul@7982';
        this.database = 'dwebserv_deltalms';
        this.conn = mysql.createConnection({
            host: this.host,
            port:3306,
            user: this.username,
            password: this.password,
            database: this.database,
           connectTimeout: 60000,
            acquireTimeout: 60000,// 60 seconds for acquiring a connection
        });

        this.connect();
    }

    connect() {
        this.conn.connect((err) => {
            if (err) {
                // console.error('Database Connectivity Error:', err);
                console.log(err);
                return;
            }
            console.log('Connected to database successfully!');
        });
    }

    select(tbl_name, column = '*', where = '', print = false) {
        let wr = '';
        if (where !== '') {
            wr = `WHERE ${where}`;
        }
        const sql = `SELECT ${column} FROM ${tbl_name} ${wr}`;
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results[0]);
            });
        });
    }

    selectAll(tbl_name, column = '*', where = '', orderby = '', print = false) {
        let wr = '';
        if (where !== '') {
            wr = `WHERE ${where}`;
        }
        const sql = `SELECT ${column} FROM ${tbl_name} ${wr} ${orderby}`;
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    insert(tbl_name, data, print = false) {
        const fields = Object.keys(data).map(key => `\`${key}\``).join(',');
        const values = Object.values(data).map(value => (value === null ? 'NULL' : this.conn.escape(value))).join(',');
    
        const sql = `INSERT INTO ${tbl_name} (${fields}) VALUES (${values})`;
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    status: true,
                    insert_id: result.insertId,
                    affected_rows: result.affectedRows,
                    info: result.info
                });
            });
        });
    }
    

    update(table_name, form_data, where = '', print = false) {
        let whereSQL = '';
        if (where !== '') {
            whereSQL = ` WHERE ${where}`;
        }
    
        const sets = Object.entries(form_data).map(([column, value]) => {
            if (value === null) {
                return `\`${column}\` = NULL`;
            }
            return `\`${column}\` = ${this.conn.escape(value)}`; // Removed single quotes around value
        });
    
        const sql = `UPDATE ${table_name} SET ${sets.join(', ')} ${whereSQL}`;
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    status: true,
                    affected_rows: result.affectedRows,
                    info: result.info
                });
            });
        });
    }
    

    delete(tbl_name, where = '', print = false) {
        let whereSQL = '';
        if (where !== '') {
            whereSQL = ' WHERE ';
            if (typeof where === 'object') {
                const conditions = Object.entries(where).map(([key, value]) => `\`${key}\` = '${this.conn.escape(value)}'`);
                whereSQL += conditions.join(' AND ');
            } else {
                whereSQL += where;
            }
        }

        const sql = `DELETE FROM ${tbl_name} ${whereSQL}`;
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    status: true,
                    info: result.info
                });
            });
        });
    }

    query(sql, print = false) {
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results[0]);
            });
        });
    }

    queryAll(sql, print = false) {
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    insertAll(sql, print = false) {
        if (print) {
            console.log(sql);
        }
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    status: true
                });
            });
        });
    }
}

const db = new Database();

module.exports = db;
