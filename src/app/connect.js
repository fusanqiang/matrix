'use strict';

import { EventEmitter } from 'events';
import Layer from './layer';

import { animateForward, animateBackward } from './animate';
import { typedof } from './util';

export default class Connect extends EventEmitter {
    constructor(){
        super();
        this.route = '/';
        this.stack = [];
    }

    $redirect(url){ this.$server.redirect(url); }
    $reback(url){ this.$server.reback(url); }
    $forward(url){ this.$server.forward(url); }
    $back(url){ this.$server.back(url); }
    $refresh(){ this.$server.refresh(); }
    define(route, webview){ return this.at(route, next => this.publish(webview, next)); }
    _useForward(webview, next){ this._direction(webview, next, this._choose(animateForward)); }
    _useBackward(webview, next){ this._direction(webview, next, this._choose(animateBackward)); }

    _route(route, fn, options){
        let handle = fn;
        let path = route;
        const that = this;

        // default route to '/'
        if (typeof route !== 'string') {
            handle = route;
            path = '/';
        }

        // wrap sub-apps
        if ( typeof handle.handle === 'function' ) {
            let server = handle;
            server.route = path;
            Object.defineProperty(server, '$node', { get(){ return that.$node; } });
            Object.defineProperty(server, '$server', { get(){ return that.$server; } });
            Object.defineProperty(server, '$webviews', { get(){ return that.$webviews; } });
            Object.defineProperty(server, '$options', { get(){ return that.$options; } });
            handle = function (next) {
                server.handle(next);
            };
        }

        // strip trailing slash
        if ( path !== '/' && path[path.length - 1] === '/' ) {
            path = path.slice(0, -1);
        }


        // add the middleware
        this.stack.push(new Layer(path, handle, options));

        return this;
    }

    use( route, fn ) {
        return this._route(route, fn, {
            sensitive: false,
            strict: false,
            end: false
        });
    }

    at(route, fn){
        return this._route(route, fn, {
            sensitive: false,
            strict: true,
            end: true
        });
    }

    publish(webview, next){
        const direction = this.$server.action;
        switch (direction){
            case 'HISTORY:FORWARD':
                this._useForward(webview, next);
                break;
            case 'HISTORY:BACKWARD':
                this._useBackward(webview, next);
                break;
            case 'APPLICATION:FORWARD':
                this._useForward(webview, next);
                break;
            case 'APPLICATION:BACKWARD':
                this._useBackward(webview, next);
                break;
            case 'REFRESH':
                this._refresh(webview, next);
                break;
            default:
                this._create(webview, newWebview => {
                    newWebview.$node.classList.add('active');
                    next();
                });
        }
    }

    _direction(webview, next, animate){
        const _oldWebview = this.$server._webview;
        const _newWebview = this.$webviews[this.$server._key];
        const _next = next;

        this.$server._force = true;

        next = function(){
            if ( _oldWebview === _newWebview ){
                _newWebview.active();
            }else{
                if ( _oldWebview && typeof _oldWebview.unActive === 'function' ){
                    _oldWebview.unActive();
                }
                if ( _newWebview && typeof _newWebview.active === 'function' ){
                    _newWebview.active();
                }
            }

            _next();
        }

        if ( !_newWebview ){
            this._create(webview, newWebview => animate(_oldWebview, newWebview, next));
        }else{
            this.$server._webview = _newWebview;
            animate(_oldWebview, _newWebview, next);
        }
    }

    _choose(animate){
        const options = this.$options;
        let animateName, animateInFn, animateOutFn;
        if ( typeof options.animate === 'string' ){
            animateName = options.animate;
        }
        else if ( typedof(options.animate, 'Array') ){
            animateInFn = options.animate[0];
            animateOutFn = options.animate[1];
        }
        else if ( typeof options.animate === 'object' && !options.animate.prototype ){
            animateInFn = options.animate.forward;
            animateOutFn = options.animate.back;
        }

        return function(_oldWebview, _newWebview, next){
            if ( animateName ){
                animate(_oldWebview, _newWebview, next, animateName);
            }
            else if ( typeof animateInFn === 'function' && typeof animateOutFn === 'function' ){
                if ( animate == animateForward ){
                    animateInFn(_oldWebview, _newWebview, next);
                }else{
                    animateOutFn(_oldWebview, _newWebview, next);
                }
            }else{
                animate(_oldWebview, _newWebview, next);
            }
        }
    }

    _refresh(webview, next){
        const _Webview = this.$server._webview;
        if ( !_Webview ){
            this._create(webview, newWebview => {
                newWebview.$node.classList.add('active');
                next();
            });
        }else{
            _Webview.refresh && _Webview.refresh();
            next();
        }
    }

    _create(webview, next){
        const webviewNode = document.createElement('div');
        this.$node.appendChild(webviewNode);
        webviewNode.classList.add('mx-webview');
        const $webview = new webview(webviewNode);
        this.$webviews[this.$server._key] = $webview;
        $webview.$server = this.$server;
        this.$server._webview = $webview;
        $webview._publish(next);
    }

    handle(done){
        let index = 0;
        let stack = this.stack;
        const that = this;

        function next(err){
            const layer = stack[index++];
            if ( !layer ) {
              setImmediate(done, err);
              return;
            }

            const params = layer.match(that.route);

            if ( !params ){
                return next(err);
            }

            that._compile(layer.handle, params, err, next);
        }

        next();
    }

    _compile(handle, params, err, next){
        var arity = handle.length;
        var error = err;
        var hasError = Boolean(err);
        this.$server.params = params;
        try {
            if (hasError && arity === 2) {
              // error-handling middleware
              handle(err, next);
              return;
          } else if (!hasError && arity < 2) {
              // request-handling middleware
              handle(next);
              return;
            }
        } catch (e) {
            // replace the error
            error = e;
        }

        // continue
        next(error);
    }
}
