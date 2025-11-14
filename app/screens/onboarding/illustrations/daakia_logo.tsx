// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';
import {Image, type StyleProp, type ImageStyle} from 'react-native';

type Props = {
    styles: StyleProp<ImageStyle>;
};

const DaakiaLogoSvg = ({styles}: Props) => {
    return (
        <Image
            source={require('../../../assets/konnectLogo.png')}
            style={[styles, {width: 340, height: 340, alignSelf: 'center'}]}
            resizeMode='contain'
        />
    );
};

export default DaakiaLogoSvg;
