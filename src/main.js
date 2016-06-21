require('normalize.css');
require('./css/matrix.scss');

import 'setimmediate';
import Vue                              from 'vue';
import Ready                            from 'domready';
import Connect                          from './app/connect';
import Webview                          from './app/webview';
import Bootstrap                        from './app/boot';
import FastClick                        from 'fastclick';
import * as Util                        from './app/util';
import ComponentConstructor             from './app/component';
import {
    redirect, reback, forward, back, refresh,
    touch, click
}                                       from './app/directive';

export { Promise }                      from 'es6-promise';
export { EventEmitter }                 from 'events';

export const vue        = Vue;
export const connect    = Connect;
export const compile    = Util.compile;
export const webview    = Webview;
export const component  = ComponentConstructor;
export const components = Util.MioxComponents;
export const util       = Util;

export const bootstrap = function(el, options){
    const app = new Bootstrap(el, options);
    Vue.prototype.$app = app;
    Vue.prototype.$redirect = function(url){
        app.$server.redirect(url);
    };
    Vue.prototype.$reback = function(url){
        app.$server.reback(url);
    };
    Vue.prototype.$foward = function(url){
        app.$server.foward(url);
    };
    Vue.prototype.$back = function(url){
        app.$server.back(url);
    };
    Vue.prototype.$refresh = function(){
        app.$server.refresh();
    };
    return app;
};

export const ready = function(cb){
    Ready(function(){
        FastClick.attach(document.body);
        cb();
    });
};

export const define = function(name, cb, globalInset){
    let VueExtends;
    if ( typeof name === 'string' && cb ){
        let _component;

        if (typeof cb === 'function' && !cb.prototype && !cb.prototype.$_install){
            _component = cb(component, components);
        }else{
            _component = cb;
        }

        Util.MioxComponents[name] = _component;
        VueExtends = compile(_component);

        if ( globalInset ){
            Vue.component(name, VueExtends);
        }else{
            Util.VueComponents[name] = VueExtends;
        }
    }else{
        for ( let i in name ){
            Util.MioxComponents[i] = name[i];
            VueExtends = compile(name[i]);
            if ( !!cb ){
                Vue.component(i, VueExtends);
            }else{
                Util.VueComponents[i] = VueExtends;
            }
        }
    }
}

Vue.directive('click', click);
Vue.directive('touch', touch);
Vue.directive('redirect', redirect);
Vue.directive('reback', reback);
Vue.directive('forward', forward);
Vue.directive('back', back);
Vue.directive('refresh', refresh);
