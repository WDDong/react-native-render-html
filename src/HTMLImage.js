import React, { PureComponent } from 'react';
import { Image, View, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

export default class HTMLImage extends PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            width: props.imagesInitialDimensions.width,
            height: props.imagesInitialDimensions.height,
            indeterminate: (!props.style || !props.style.width || !props.style.height)
        };
    }

    static propTypes = {
        source: PropTypes.object.isRequired,
        alt: PropTypes.string,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: Image.propTypes.style,
        imagesMaxWidth: PropTypes.number,
        imagesInitialDimensions: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        })
    }

    static defaultProps = {
        imagesInitialDimensions: {
            width: 100,
            height: 100
        }
    }

    componentDidMount () {
        this.getImageSize();
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    componentDidUpdate(prevProps, prevState) {
        this.getImageSize(this.props);
    }

    getDimensionsFromStyle (style, height, width) {
        let styleWidth;
        let styleHeight;

        if (height) {
            styleHeight = height;
        }
        if (width) {
            styleWidth = width;
        }
        if (Array.isArray(style)) {
            style.forEach((styles) => {
                if (!width && styles['width']) {
                    styleWidth = styles['width'];
                }
                if (!height && styles['height']) {
                    styleHeight = styles['height'];
                }
            });
        } else {
            if (!width && style['width']) {
                styleWidth = style['width'];
            }
            if (!height && style['height']) {
                styleHeight = style['height'];
            }
        }

        return { styleWidth, styleHeight };
    }

    getImageSize (props = this.props) {
        const { source, imagesMaxWidth, style, height, width } = props;
        const { styleWidth, styleHeight } = this.getDimensionsFromStyle(style, height, width);

        if (styleWidth && styleHeight) {
            return this.mounted && this.setState({
                width: typeof styleWidth === 'string' && styleWidth.search('%') !== -1 ? styleWidth : parseInt(styleWidth, 10),
                height: typeof styleHeight === 'string' && styleHeight.search('%') !== -1 ? styleHeight : parseInt(styleHeight, 10),
                indeterminate: false
            });
        }
        // Fetch image dimensions only if they aren't supplied or if with or height is missing
        Image.getSize(
            source.uri,
            (originalWidth, originalHeight) => {
                if (!imagesMaxWidth) {
                    return this.mounted && this.setState({ width: originalWidth, height: originalHeight });
                }
                const optimalWidth = imagesMaxWidth <= originalWidth ? imagesMaxWidth : originalWidth;
                const optimalHeight = parseInt((optimalWidth * originalHeight) / originalWidth);
                this.mounted && this.setState({ width: optimalWidth, height: optimalHeight, indeterminate: false,  error: false });
            },
            () => {
                this.mounted && this.setState({ error: true });
            }
        );
    }

    validImage (source, style, props = {}) {
        const defaultImage = require('./icon_default_40x40.png');
        return (
            <Image
              source={source}
              style={[style, { width: this.state.width, height: this.state.height, resizeMode: 'cover' }]}
              {...props}
            />
        );
    }

    get errorImage () {
        const defaultImage = require('./icon_default_40x40.png');
        return (
            <View style={{ width: Dimensions.get('window').width, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                {/* { this.props.alt ? <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>{ this.props.alt }</Text> : false } */}
                <Image source={defaultImage} />
            </View>
        );
    }

    get placeholderImage () {
        const defaultImage = require('./icon_default_40x40.png');
        return (
            <View style={{ width: Dimensions.get('window').width, height: this.props.imagesInitialDimensions.height, justifyContent: 'center', alignItems: 'center' }}>
                {/* { this.props.alt ? <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>{ this.props.alt }</Text> : false } */}
                <Image source={defaultImage} />
            </View>
        );
    }

    render () {
        const { source, style, passProps } = this.props;
        if (this.state.error) {
            return this.errorImage;
        } 
        if (this.state.indeterminate) {
             return this.placeholderImage;
        }
        return this.validImage(source, style, passProps);

        return !this.state.error ? this.validImage(source, style, passProps) : this.errorImage;
    }
}
