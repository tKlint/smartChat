
const formidable = require('formidable');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');

class BaseController {  
    resolve(){  
        return new Proxy(this, {  
            get(target, name) {  
                return target[name].bind(target)  
            }  
        })  
    }  
}

/**
 * upload file class
 * static class
 */
class Upload extends BaseController {
    maxFieldsSize = 5 * 1024 * 1024;
    form;
    uploadDir;
    dir;
    constructor(dir) {
        super();
        this.form = new formidable.IncomingForm();
        this.dir = dir;
        this.uploadDir = `${__dirname}/../${this.dir}/`;
    }

    uploadFile (request, response) {
        /**
         * 文件配置
         */
        this.form.encoding = 'utf-8';
        this.form.keepExtensions = true;
        this.form.maxFieldsSize = this.maxFieldsSize;
        this.form.uploadDir = this.uploadDir;

        this.form.parse(request, (parseErr, fields, files) => {

            if (parseErr) {
                return response.status(500).send({
                    errCode: 10500,
                    errMsg: 'upload: fail parse file error',
                });
            }

            const { name } = files.file;

            const extname = path.extname(name);
            const savedFileName = uuid.v1() + extname;

            const oldFilePath = files.file.path;
            const newFilePath = this.uploadDir + savedFileName;
            fs.rename(oldFilePath, newFilePath, (renameErr) => {
                if (renameErr) {
                    return response.status(500).send({
                        errCode: 10500,
                        errMsg: 'upload: fail rename file error',
                    })
                }
                const url = `http://${request.headers.host}/${this.dir}/${savedFileName}`;
                return response.send({
                    errCode: 0,
                    errMsg: 'upload: success',
                    data: [
                        { url }
                    ]
                });
            })
        });
    }
}

module.exports = new Upload('temp').resolve();