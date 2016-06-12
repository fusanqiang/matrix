import Component from '../../app/component';

export default class Flex extends Component {
    constructor(){
        super();
        this.name = 'flex';
    }

    _computed(options){
        if ( !options ){ options = {} }
        options.style = function(){
            return this.flex != undefined ? {
                boxFlex: this.flex,
                flex: this.flex
            } : {}
        }

        options.class = function(){
            const classes = [];

            if ( this.direction ){
                classes.push('mx-flex-direction-' + this.direction);
            }

            if ( this.justify ){
                classes.push('mx-flex-justify-' + this.justify);
            }

            if ( this.alignItems ){
                classes.push('mx-flex-align-items-' + this.alignItems);
            }

            if ( this.alignContent ){
                classes.push('mx-flex-align-content-' + this.alignContent);
            }

            if ( this.wrap ){
                classes.push('mx-flex-wrap-' + this.wrap);
            }

            return classes.join(' ');
        }


        if ( typeof this.computed === 'function' ){
            options = this.computed(options);
        }
        return options;
    }

    _template(){
        if ( typeof this.template === 'function' ){
            return this.template();
        }
        return `<div class="mx-flex-box" :class="class" :style="style"><slot></slot></div>`;
    }

    _props(props){
        if ( !props ){ props = {} };

        props.flex = String;

        // row|column|row-reverse|column-reverse
        props.direction = String;

        // start|center|end|between|around
        props.justify = String;

        // start|center|end|between|around
        props.alignItems = String;

        // start|center|end|between|around
        props.alignContent = String;

        // wrap|nowrap|wrap-reverse
        props.wrap = String;

        if ( typeof this.props === 'function' ){
            props = this.props(props);
        }

        return props;
    }
}
