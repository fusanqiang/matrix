import { compile } from './util';
const noop = function(){}

export default class Component {
    constructor(){
        this._isMx = true;
        this._vue_options = {
            data: {},
            computed: {},
            methods: {},
            watch: {},
            directives: {},
            elementDirectives: {},
            filters: {},
            components: {},
            transitions: {},
            partials: {},
            events: {},
            mixins: [],
            extends: {},
            extra: {}
        };
    }

    $_extend(property, defaults){
        let key = this[property];
        let _key = this._vue_options[property];
        if ( key ){
            const val = key.call(this, _key);

            if ( val === undefined ){
                if ( defaults != undefined ){
                    this._vue_options[property] = defaults;
                }
            }else{
                this._vue_options[property] = val;
            }

            if ( property === 'components' ){
                let _cp = this._vue_options.components;
                for ( let i in _cp ) this._vue_options.components[i] = compile(_cp[i]);
            }
            if ( property === 'mixins' ){
                let mixins = this._vue_options.mixins;
                if ( Array.isArray(mixins) ){
                    this._vue_options.mixins = mixins.map(function(mixin){
                        if ( mixin.components ){
                            for ( let j in mixin.components ) mixin.components[j] = compile(mixin.components[j]);
                        }
                        return mixin;
                    });
                }else{
                    if ( mixins.components ){
                        for ( let z in mixins.components ) this._vue_options.mixins.components[z] = compile(mixins.components[z]);
                    }
                }
            }
        }
    }

    $_name(){
        this._vue_options.name = typeof this.name === 'function' ? this.name() : this.name;
    }

    $_extra(){
        this.$_extend('extra', {});
    }

    $_data(){
        if ( !this.data ){
            delete this._vue_options.data;
            return;
        }
        let val = this.data(this._vue_options.data);
        if ( val ) this._vue_options.data = val;
        const data = this._vue_options.data;
        if ( typeof data === 'object' ){
            this._vue_options.data = function(){
                return data;
            }
        }else if ( typeof data != 'function' ){
            delete this._vue_options.data;
        }
    }

    $_props(){
        this.$_extend('props');
    }

    $_computed(){
        this.$_extend('computed', {});
    }

    $_methods(){
        this.$_extend('methods', {});
    }

    $_watch(){
        this.$_extend('watch', {});
    }

    $_template(){
        this.$_extend('template');
    }

    $_replace(){
        this.$_extend('replace');
    }

    $_init(){
        this.$_extend('init');
    }

    $_created(){
        this.$_extend('created');
    }

    $_beforeCompile(){
        this.$_extend('beforeCompile');
    }

    $_compiled(){
        this.$_extend('compiled');
    }

    $_ready(){
        this.$_extend('ready');
    }

    $_attached(){
        this.$_extend('attached');
    }

    $_detached(){
        this.$_extend('detached');
    }

    $_beforeDestroy(){
        this.$_extend('beforeDestroy');
    }

    $_destroyed(){
        this.$_extend('destroyed');
    }

    $_directives(){
        this.$_extend('directives', {});
    }

    $_elementDirectives(){
        this.$_extend('elementDirectives', {});
    }

    $_filters(){
        this.$_extend('filters', {});
    }

    $_components(){
        this.$_extend('components', {});
    }

    $_transitions(){
        this.$_extend('transitions', {});
    }

    $_partials(){
        this.$_extend('partials', {});
    }

    $_parent(){
        this.$_extend('parent');
    }

    $_events(){
        this.$_extend('events', {});
    }

    $_mixins(){
        this.$_extend('mixins', []);
    }

    $_extends(){
        this.$_extend('extends');
    }

    $_install(){
        this.$_data();
        this.$_props();
        this.$_computed();
        this.$_methods();
        this.$_watch();
        this.$_template();
        this.$_replace();
        this.$_init();
        this.$_created();
        this.$_beforeCompile();
        this.$_compiled();
        this.$_ready();
        this.$_attached();
        this.$_detached();
        this.$_beforeDestroy();
        this.$_destroyed();
        this.$_directives();
        this.$_elementDirectives();
        this.$_filters();
        this.$_components();
        this.$_transitions();
        this.$_partials();
        this.$_parent();
        this.$_events();
        this.$_mixins();
        this.$_name();
        this.$_extends();
        this.$_extra();

        const extras = this._vue_options.extra;

        for ( let i in extras ){
            this._vue_options[i] = extras[i];
        }

        return this;
    }
}
