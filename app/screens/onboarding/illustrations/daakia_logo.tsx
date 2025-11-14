// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';
import {Image, type StyleProp, type ImageStyle} from 'react-native';
import tinyColor from 'tinycolor2';

type Props = {
    styles: StyleProp<ImageStyle>;
    theme: Theme;
};

const DaakiaLogoSvg = ({styles, theme}: Props) => {
    const isLightTheme = tinyColor(theme.centerChannelBg).isLight();
    const logoSource = isLightTheme
        ? require('../../../assets/konnectLogo.png')
        : require('../../../assets/konnectLogolight.png');

    return (
        <Image
            source={logoSource}
            style={[styles, {width: 180, height: 180, alignSelf: 'center'}]}
            resizeMode='contain'
        />
    );
};

export default DaakiaLogoSvg;
