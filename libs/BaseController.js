class BaseController {  
    resolve(){  
        return new Proxy(this, {  
            get(target, name) {  
                return target[name].bind(target)  
            }  
        })  
    }
}
module.exports = BaseController;
